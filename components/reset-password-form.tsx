"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updatePassword, getSession } from "@/lib/services/authService"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  // Check if we have a valid session from the password reset token
  useEffect(() => {
    const checkToken = async () => {
      // Supabase handles the token from URL hash fragments automatically
      // First, check if we have hash fragments and process them
      if (typeof window !== 'undefined') {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        if (accessToken && type === 'recovery') {
          // Supabase automatically processes hash fragments, but we need to wait
          // for the session to be established
          const checkSession = async () => {
            // Give Supabase time to process the hash
            await new Promise(resolve => setTimeout(resolve, 500))
            const session = await getSession()
            setIsValidToken(!!session)
          }
          checkSession()
        } else {
          // Check if we already have a session
          const session = await getSession()
          setIsValidToken(!!session)
        }
      } else {
        setIsValidToken(false)
      }
    }

    checkToken()
  }, [])

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (!password || !confirmPassword) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    // Validate password
    const passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      setError(passwordValidationError)
      setLoading(false)
      return
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Check if we have a valid session
    const session = await getSession()
    if (!session) {
      setError("Invalid or expired reset link. Please request a new password reset.")
      setLoading(false)
      return
    }

    const result = await updatePassword(password)

    if (result.success) {
      setSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } else {
      setError(result.error || "Failed to update password")
      setLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Verifying...</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Please wait while we verify your reset link.
            </p>
          </div>
        </FieldGroup>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Invalid Link</h1>
            <p className="text-muted-foreground text-sm text-balance">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <Field>
            <Button 
              type="button" 
              className="w-full" 
              onClick={() => router.push("/forgot-password")}
            >
              Request New Reset Link
            </Button>
          </Field>
          <Field>
            <FieldDescription className="text-center">
              <a href="/login" className="group inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary">
                <ChevronLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                Back to login
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </div>
    )
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Password Updated</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Your password has been successfully updated. Redirecting to login...
            </p>
          </div>
        </FieldGroup>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Please enter your new password to update your account security.
          </p>
        </div>
        {error && (
          <Field>
            <FieldError>{error}</FieldError>
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="••••••••••••••••"
              required
              disabled={loading}
              className="pr-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
              disabled={loading}
            >
              {isPasswordVisible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <span className="sr-only">
                {isPasswordVisible ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <div className="relative">
            <Input
              id="confirm-password"
              name="confirm-password"
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="••••••••••••••••"
              required
              disabled={loading}
              className="pr-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              className="absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
              disabled={loading}
            >
              {isConfirmPasswordVisible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <span className="sr-only">
                {isConfirmPasswordVisible ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Set New Password"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            <a href="/login" className="group inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary">
              <ChevronLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back to login
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
