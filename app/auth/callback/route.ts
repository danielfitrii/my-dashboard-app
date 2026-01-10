import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { ensureProfile } from '@/lib/services/authService'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    // Ensure profile exists for OAuth users
    if (data.user) {
      const name = data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
      const email = data.user.email || ''
      await ensureProfile(data.user.id, email, name)
    }

    // If this is an email verification (not OAuth), redirect to signup page
    if (type === 'signup' || type === 'email') {
      return NextResponse.redirect(new URL('/signup?verified=true', requestUrl.origin))
    }
  }

  // OAuth sign-ins go to dashboard
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
