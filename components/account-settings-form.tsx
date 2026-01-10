"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserIcon } from "lucide-react"
import { getCurrentUser } from "@/lib/services/authService"
import { supabase } from "@/lib/supabase/client"

export function AccountSettingsForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true)
        const user = await getCurrentUser()
        
        if (!user) {
          router.push("/login")
          return
        }

        setUserId(user.id)
        setEmail(user.email || "")

        // Load profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('user_id', user.id)
          .single()

        if (profile) {
          setName(profile.name || user.user_metadata?.name || user.email?.split('@')[0] || "")
          setAvatarUrl(profile.avatar_url)
        } else {
          // Fallback to user metadata
          setName(user.user_metadata?.name || user.email?.split('@')[0] || "")
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setError("Failed to load profile data")
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (!userId) {
        setError("User not found")
        setLoading(false)
        return
      }

      // Update profile in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          name,
          // Note: Email updates should be handled separately through Supabase auth
        })
        .eq('user_id', userId)

      if (updateError) {
        // If profile doesn't exist, create it
        if (updateError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              name,
              email,
            })

          if (insertError) {
            throw insertError
          }
        } else {
          throw updateError
        }
      }

      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(null), 5000)
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loadingProfile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
              {success}
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel>Avatar</FieldLabel>
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} />
                  ) : (
                    <AvatarFallback>
                      {name ? getInitials(name) : <UserIcon className="size-8" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avatar upload coming soon
                  </p>
                </div>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                disabled={loading}
              />
              <FieldDescription>
                This is your display name. It will be visible to other users.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <FieldDescription>
                Email cannot be changed here. Contact support if you need to change your email.
              </FieldDescription>
            </Field>

            <Field>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/forgot-password")}
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
