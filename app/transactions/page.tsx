import MainLayout from '@/components/layout/MainLayout'
import { DataTableTransactions } from '@/components/shadcn-studio/blocks/data-table/data-table-transactions'
import { AuthGuard } from '@/components/auth-guard'

export default function TransactionsPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <MainLayout>
        <div className='py-4 sm:py-6 lg:py-8'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <DataTableTransactions />
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  )
}

