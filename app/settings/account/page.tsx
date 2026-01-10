import MainLayout from '@/components/layout/MainLayout'
import { AuthGuard } from '@/components/auth-guard'
import { AccountSettingsForm } from '@/components/account-settings-form'

export default function AccountSettingsPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <MainLayout>
        <div className='py-4 sm:py-6 lg:py-8'>
          <div className='mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8'>
            <div>
              <h1 className='text-3xl font-bold'>Account Settings</h1>
              <p className='text-muted-foreground mt-2 text-sm'>
                Manage your account information and preferences
              </p>
            </div>
            <AccountSettingsForm />
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}
