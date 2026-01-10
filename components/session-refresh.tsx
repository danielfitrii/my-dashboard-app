"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { refreshSession } from "@/lib/services/authService"

/**
 * Component that handles automatic session refresh
 * Should be placed in the app layout to run globally
 */
export function SessionRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          // Session was refreshed successfully
          console.log('Session refreshed')
        } else if (event === 'SIGNED_OUT') {
          // User was signed out, redirect to login
          router.push('/login')
        } else if (event === 'USER_UPDATED') {
          // User data was updated
          console.log('User updated')
        }
      }
    )

    // Set up automatic session refresh interval (check every 5 minutes)
    const refreshInterval = setInterval(async () => {
      const session = await refreshSession()
      if (!session) {
        // Session refresh failed, user might be logged out
        // Don't redirect here as it might be a temporary network issue
        console.warn('Session refresh failed')
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [router])

  return null
}
