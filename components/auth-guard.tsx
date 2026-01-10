"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@/lib/services/authService"
import { Skeleton } from "@/components/ui/skeleton"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

/**
 * AuthGuard component that redirects users based on authentication status
 * - If requireAuth is true: redirects to /login if not authenticated
 * - If requireAuth is false: redirects to / if authenticated (for login/signup pages)
 */
export function AuthGuard({ 
  children, 
  requireAuth = false,
  redirectTo 
}: AuthGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true)
      const session = await getSession()

      if (requireAuth) {
        // Page requires authentication
        if (!session) {
          // Not authenticated - redirect to login
          router.push(redirectTo || "/login")
          setIsChecking(false)
          return
        }
        // Authenticated - allow access
        setIsAuthorized(true)
        setIsChecking(false)
      } else {
        // Page should not be accessible when authenticated (login/signup)
        if (session) {
          // Already authenticated - redirect away
          router.push(redirectTo || "/")
          setIsChecking(false)
          return
        }
        // Not authenticated - allow access to login/signup page
        setIsAuthorized(true)
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [requireAuth, redirectTo, router])

  // Show loading skeleton while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
