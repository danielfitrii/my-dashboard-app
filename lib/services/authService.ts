import { supabase } from '@/lib/supabase/client'

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}

/**
 * Sign in with email and password
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Check if error is related to email verification
      if (error.message.toLowerCase().includes('email not confirmed') || 
          error.message.toLowerCase().includes('email not verified')) {
        return {
          success: false,
          error: 'Email not confirmed. Please verify your email before signing in.',
        }
      }
      
      return {
        success: false,
        error: error.message,
      }
    }

    // Check if email is verified even if login succeeded (shouldn't happen, but just in case)
    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: false,
        error: 'Email not confirmed. Please verify your email before signing in.',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Create a profile in the profiles table
 */
export async function createProfile(userId: string, name: string, email: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name,
        email,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Sign up with email, password, and name
 */
export async function signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'This function must be called from the client side',
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/signup?verified=true`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Profile will be created automatically by database trigger
    // If trigger is not set up, we'll try to create it manually as fallback
    if (data.user) {
      // Wait a bit for trigger to execute, then check if profile exists
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Check if profile was created by trigger
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single()
      
      // If profile doesn't exist, try to create it manually
      // This will fail if RLS is blocking, but that's okay - user can still sign in
      if (!existingProfile) {
        const profileResult = await createProfile(data.user.id, name, email)
        
        if (!profileResult.success) {
          // Profile creation failed - this is expected if RLS is blocking
          // The database trigger should handle this, or admin needs to set up RLS policies
          console.warn('Profile not created automatically. Please set up database trigger or RLS policies.')
        }
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'This function must be called from the client side',
      }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'This function must be called from the client side',
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    // Check if session is expired or about to expire (within 5 minutes)
    if (session && session.expires_at) {
      const expiresAt = session.expires_at * 1000 // Convert to milliseconds
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      // If session expires within 5 minutes, try to refresh it
      if (expiresAt - now < fiveMinutes) {
        const refreshed = await refreshSession()
        return refreshed || session
      }
    }

    return session
  } catch (error) {
    return null
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('Error refreshing session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Error refreshing session:', error)
    return null
  }
}

/**
 * Ensure user has a profile (creates one if it doesn't exist)
 * Useful for OAuth sign-ins where profile might not be created automatically
 */
export async function ensureProfile(userId: string, email?: string, name?: string): Promise<AuthResponse> {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingProfile) {
      // Profile already exists
      return {
        success: true,
        data: existingProfile,
      }
    }

    // Profile doesn't exist, create it
    // Try to get user data from auth if name/email not provided
    if (!name || !email) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        name = name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
        email = email || user.email || ''
      }
    }

    return await createProfile(userId, name || 'User', email || '')
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Update user password (for password reset flow)
 */
export async function updatePassword(password: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(email?: string): Promise<AuthResponse> {
  try {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'This function must be called from the client side',
      }
    }

    // If email is provided, use it, otherwise get from current user
    let emailToUse = email
    if (!emailToUse) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        return {
          success: false,
          error: 'No email address found',
        }
      }
      emailToUse = user.email
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: emailToUse,
      options: {
        emailRedirectTo: `${window.location.origin}/signup?verified=true`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}
