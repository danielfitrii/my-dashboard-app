'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  SettingsIcon,
  SquarePenIcon,
  LogOutIcon
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { signOut, getCurrentUser } from '@/lib/services/authService'
import { supabase } from '@/lib/supabase/client'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('User')
  const [userEmail, setUserEmail] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setUserEmail(user.email || '')
          
          // Try to get profile data from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('user_id', user.id)
            .single()
          
          if (profile) {
            setUserName(profile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User')
            setAvatarUrl(profile.avatar_url)
          } else {
            // Fallback to user metadata or email
            setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'User')
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserData()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      router.push('/login')
      router.refresh()
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-80' align={align || 'end'}>
        <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
          <div className='relative'>
            <Avatar className='size-10'>
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} />
              ) : (
                <AvatarFallback>
                  {loading ? (
                    <UserIcon className='size-5' />
                  ) : (
                    getInitials(userName)
                  )}
                </AvatarFallback>
              )}
            </Avatar>
            <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
          </div>
          <div className='flex flex-1 flex-col items-start'>
            <span className='text-foreground text-lg font-semibold'>{loading ? 'Loading...' : userName}</span>
            <span className='text-muted-foreground text-base'>{loading ? '' : userEmail}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem 
            className='px-4 py-2.5 text-base'
            onClick={() => router.push('/settings/account')}
          >
            <UserIcon className='text-foreground size-5' />
            <span>My account</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className='px-4 py-2.5 text-base'
            onClick={() => router.push('/settings')}
          >
            <SettingsIcon className='text-foreground size-5' />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='px-4 py-2.5 text-base'>
            <SquarePenIcon className='text-foreground size-5' />
            <span>Customization</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          variant='destructive' 
          className='px-4 py-2.5 text-base'
          onClick={handleLogout}
        >
          <LogOutIcon className='size-5' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown

