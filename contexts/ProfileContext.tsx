'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Profile {
  id: string
  name: string
  email: string | null
  avatar_url?: string | null
}

interface ProfileContextType {
  currentProfile: Profile | null
  profiles: Profile[]
  loading: boolean
  error: string | null
  setCurrentProfile: (profileId: string) => void
  refreshProfiles: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProfiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get current user from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        // No user logged in - you can handle this based on your auth flow
        setProfiles([])
        setCurrentProfileState(null)
        setLoading(false)
        return
      }

      // Fetch profiles for this user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (profilesError) {
        throw profilesError
      }

      setProfiles(profilesData || [])

      // Set current profile from localStorage or use first profile
      const savedProfileId = typeof window !== 'undefined' 
        ? localStorage.getItem('currentProfileId') 
        : null
      
      const profileToUse = savedProfileId 
        ? profilesData?.find(p => p.id === savedProfileId)
        : profilesData?.[0] || null

      setCurrentProfileState(profileToUse || null)
    } catch (err: any) {
      setError(err.message || 'Failed to load profiles')
      console.error('Error loading profiles:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProfiles()
  }, [refreshProfiles])

  const setCurrentProfile = useCallback((profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setCurrentProfileState(profile)
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentProfileId', profileId)
      }
    }
  }, [profiles])

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        loading,
        error,
        setCurrentProfile,
        refreshProfiles
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}
