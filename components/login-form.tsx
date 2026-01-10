"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn, signInWithGoogle, resendVerificationEmail } from "@/lib/services/authService"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check for success message from email verification
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setSuccess("Email verified successfully! You can now log in.")
      // Remove query parameter from URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/login')
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    const result = await signIn({ email, password })

    if (result.success) {
      router.push("/")
      router.refresh()
    } else {
      const errorMessage = result.error || "Failed to sign in"
      
      // Check if error is related to email verification
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('confirm')) {
        setUnverifiedEmail(email)
        setError("Please verify your email before signing in. Check your inbox for the verification link.")
      } else if (errorMessage.toLowerCase().includes('invalid login') || errorMessage.toLowerCase().includes('invalid credentials')) {
        setError("Invalid email or password. Please try again.")
      } else if (errorMessage.toLowerCase().includes('email not confirmed')) {
        setUnverifiedEmail(email)
        setError("Please verify your email before signing in. Check your inbox for the verification link.")
      } else {
        setError(errorMessage)
      }
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)

    const result = await signInWithGoogle()

    if (!result.success) {
      setError(result.error || "Failed to sign in with Google")
      setGoogleLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return
    
    setResendLoading(true)
    setResendSuccess(false)
    
    const result = await resendVerificationEmail(unverifiedEmail)
    
    if (result.success) {
      setResendSuccess(true)
      setError(null)
      setTimeout(() => setResendSuccess(false), 5000)
    } else {
      setError(result.error || "Failed to resend verification email")
    }
    
    setResendLoading(false)
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        {success && (
          <Field>
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
              {success}
            </div>
          </Field>
        )}
        {error && (
          <Field>
            <FieldError>{error}</FieldError>
            {unverifiedEmail && (
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full"
                >
                  {resendLoading ? "Sending..." : resendSuccess ? "Email Sent!" : "Resend Verification Email"}
                </Button>
                {resendSuccess && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                    Verification email sent! Please check your inbox.
                  </p>
                )}
              </div>
            )}
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="your.email@example.com" 
            required 
            disabled={loading || googleLoading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required 
            disabled={loading || googleLoading}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={loading || googleLoading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button 
            variant="outline" 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {googleLoading ? "Connecting..." : "Login with Google"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
