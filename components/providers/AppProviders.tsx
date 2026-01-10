'use client'

import { ProfileProvider, useProfile } from '@/contexts/ProfileContext'
import { FinanceProvider } from '@/contexts/SupabaseFinanceContext'
import { SessionRefresh } from '@/components/session-refresh'

// Inner component that has access to ProfileContext
function FinanceProviderWrapper({ children }: { children: React.ReactNode }) {
  const { currentProfile, loading } = useProfile()

  // Show loading state or use a default profile ID while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Use current profile ID or a temporary one
  // Note: Using temp-profile-id will cause queries to fail gracefully
  const profileId = currentProfile?.id || 'temp-profile-id'

  return (
    <FinanceProvider profileId={profileId}>
      {children}
    </FinanceProvider>
  )
}

// Main provider component
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <FinanceProviderWrapper>
        <SessionRefresh />
        {children}
      </FinanceProviderWrapper>
    </ProfileProvider>
  )
}
