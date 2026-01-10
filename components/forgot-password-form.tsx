"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
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
import { resetPassword } from "@/lib/services/authService"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    if (!email) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    const result = await resetPassword(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || "Failed to send reset email")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We&apos;ve sent you a password reset link. Please check your email inbox.
            </p>
          </div>
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

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot Password?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email and we&apos;ll send you instructions to reset your password
          </p>
        </div>
        {error && (
          <Field>
            <FieldError>{error}</FieldError>
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
            disabled={loading}
          />
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
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
