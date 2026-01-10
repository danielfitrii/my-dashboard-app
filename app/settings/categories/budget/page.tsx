import PageTemplate from '@/components/layout/PageTemplate'
import { AuthGuard } from '@/components/auth-guard'

export default function BudgetCategoriesPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <PageTemplate />
    </AuthGuard>
  )
}

