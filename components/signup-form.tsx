"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUp, resendVerificationEmail } from "@/lib/services/authService"
import { supabase } from "@/lib/supabase/client"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const startVerificationPolling = () => {
    const checkVerification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email_confirmed_at) {
          setIsEmailVerified(true)
          return true
        }
        return false
      } catch (error) {
        return false
      }
    }

    // Check immediately
    checkVerification()

    // Set up auth state listener for real-time updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setIsEmailVerified(true)
      }
    })

    // Poll every 3 seconds as backup
    const interval = setInterval(async () => {
      const verified = await checkVerification()
      if (verified) {
        clearInterval(interval)
        subscription.unsubscribe()
      }
    }, 3000)

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(interval)
      subscription.unsubscribe()
    }, 300000)
  }

  // Check if user is returning from email verification
  useEffect(() => {
    const checkVerification = async () => {
      const verified = searchParams.get('verified')
      
      // Always check auth state when component mounts or verified param changes
      const { data: { user } } = await supabase.auth.getUser()
      
      if (verified === 'true' || (user && user.email_confirmed_at)) {
        // User returned from email verification link or is already verified
        if (user) {
          setUserEmail(user.email || '')
          setShowVerifyDialog(true)
          
          // Check if email is already verified
          if (user.email_confirmed_at) {
            setIsEmailVerified(true)
            // Clear sessionStorage flag
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('showVerificationDialog')
            }
          } else {
            // Start polling if not verified yet
            startVerificationPolling()
          }
          
          // Remove the query parameter from URL without causing navigation
          if (typeof window !== 'undefined' && verified === 'true') {
            window.history.replaceState({}, '', '/signup')
          }
        }
      } else if (user && !user.email_confirmed_at) {
        // Check if we should show the dialog (user might have verified in another tab)
        const shouldShowDialog = typeof window !== 'undefined' 
          ? sessionStorage.getItem('showVerificationDialog') === 'true'
          : false
        
        if (shouldShowDialog) {
          setUserEmail(user.email || '')
          setShowVerifyDialog(true)
          startVerificationPolling()
        }
      }
    }

    checkVerification()
    
    // Also listen for auth state changes (in case user verifies in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Check if this is a verification event
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user?.email_confirmed_at) {
          const shouldShowDialog = typeof window !== 'undefined' 
            ? sessionStorage.getItem('showVerificationDialog') === 'true'
            : false
          
          if (shouldShowDialog) {
            setUserEmail(session.user.email || '')
            setShowVerifyDialog(true)
            setIsEmailVerified(true)
            sessionStorage.removeItem('showVerificationDialog')
          }
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams])

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setPasswordError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    // Validate all fields are filled
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    // Validate password
    const passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      setLoading(false)
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await signUp({ email, password, name })

    if (result.success) {
      // Check if email verification is needed
      const user = result.data?.user
      const needsVerification = user && !user.email_confirmed_at
      
      if (needsVerification) {
        setUserEmail(email)
        setShowVerifyDialog(true)
        setLoading(false)
        // Store in sessionStorage so we can show dialog if user verifies in another tab
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('showVerificationDialog', 'true')
        }
        // Start polling for email verification
        startVerificationPolling()
      } else {
        // If email is already confirmed, redirect to login
        router.push("/login")
      }
    } else {
      setError(result.error || "Failed to create account")
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    setShowVerifyDialog(false)
    router.push("/")
    router.refresh()
  }

  const handleGoToLogin = () => {
    setShowVerifyDialog(false)
    router.push("/login")
  }

  const handleResendVerification = async () => {
    if (!userEmail) return
    
    setResendLoading(true)
    setResendSuccess(false)
    
    const result = await resendVerificationEmail(userEmail)
    
    if (result.success) {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } else {
      setError(result.error || "Failed to resend verification email")
    }
    
    setResendLoading(false)
  }

  return (
    <>
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Fill in the form below to create your account
            </p>
          </div>
          {error && (
            <Field>
              <FieldError>{error}</FieldError>
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input 
              id="name" 
              name="name"
              type="text" 
              placeholder="Your Name" 
              required 
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input 
              id="email" 
              name="email"
              type="email" 
              placeholder="your.email@example.com" 
              required 
              disabled={loading}
            />
            <FieldDescription>
              We&apos;ll use this to contact you. We will not share your email
              with anyone else.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input 
              id="password" 
              name="password"
              type="password" 
              required 
              disabled={loading}
            />
            {passwordError && <FieldError>{passwordError}</FieldError>}
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input 
              id="confirm-password" 
              name="confirm-password"
              type="password" 
              required 
              disabled={loading}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <FieldDescription className="px-6 text-center">
              Already have an account? <a href="/login" className="underline underline-offset-4">Sign in</a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>

      <Dialog 
        open={showVerifyDialog} 
        onOpenChange={(open) => {
          // Only allow closing if email is verified
          if (!open && !isEmailVerified) {
            return
          }
          setShowVerifyDialog(open)
        }}
      >
        <DialogContent showCloseButton={isEmailVerified}>
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              {isEmailVerified ? (
                <>
                  Your email has been verified! You can now access your dashboard.
                </>
              ) : (
                <>
                  We&apos;ve sent a verification email to <strong>{userEmail}</strong>. 
                  Please check your inbox and click the verification link to activate your account.
                  <br /><br />
                  This dialog will automatically update when your email is verified.
                  {resendSuccess && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Verification email resent! Please check your inbox.
                    </div>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isEmailVerified ? (
              <Button onClick={handleGoToDashboard} className="w-full sm:w-auto">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleResendVerification} 
                  variant="outline" 
                  disabled={resendLoading}
                  className="w-full sm:w-auto"
                >
                  {resendLoading ? "Sending..." : "Resend Email"}
                </Button>
                <Button onClick={handleGoToLogin} variant="outline" className="w-full sm:w-auto">
                  Go to Login
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
