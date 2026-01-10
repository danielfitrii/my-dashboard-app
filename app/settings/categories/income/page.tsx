import PageTemplate from '@/components/layout/PageTemplate'
import { AuthGuard } from '@/components/auth-guard'

export default function IncomeCategoriesPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <PageTemplate />
    </AuthGuard>
  )
}

