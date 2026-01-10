import { ArrowUpIcon, WalletIcon, TrendingDownIcon, CreditCardIcon, ScaleIcon } from 'lucide-react'

import MainLayout from '@/components/layout/MainLayout'
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card'
import { ChartAreaFinancial } from '@/components/shadcn-studio/blocks/chart-area-financial'
import { ChartPieExpenses } from '@/components/shadcn-studio/blocks/chart-pie-expenses'
import { DataTableTransactions } from '@/components/shadcn-studio/blocks/data-table/data-table-transactions'
import { AuthGuard } from '@/components/auth-guard'

// Statistics card data
const StatisticsCardData = [
  {
    icon: <CreditCardIcon className='size-4' />,
    value: '142',
    title: 'Transactions',
    changePercentage: '+4.3%',
    chartData: [
      { day: 'Mon', value: 120 },
      { day: 'Tue', value: 125 },
      { day: 'Wed', value: 118 },
      { day: 'Thu', value: 130 },
      { day: 'Fri', value: 135 },
      { day: 'Sat', value: 138 },
      { day: 'Sun', value: 142 }
    ]
  },
  {
    icon: <WalletIcon className='size-4' />,
    value: 'RM 8,450',
    title: 'Available Income',
    changePercentage: '+12.5%',
    chartData: [
      { day: 'Mon', value: 7200 },
      { day: 'Tue', value: 7500 },
      { day: 'Wed', value: 7800 },
      { day: 'Thu', value: 8000 },
      { day: 'Fri', value: 8200 },
      { day: 'Sat', value: 8300 },
      { day: 'Sun', value: 8450 }
    ]
  },
  {
    icon: <ScaleIcon className='size-4' />,
    value: 'RM 15,240',
    title: 'Total Balance',
    changePercentage: '+8.2%',
    chartData: [
      { day: 'Mon', value: 14000 },
      { day: 'Tue', value: 14200 },
      { day: 'Wed', value: 14500 },
      { day: 'Thu', value: 14800 },
      { day: 'Fri', value: 15000 },
      { day: 'Sat', value: 15100 },
      { day: 'Sun', value: 15240 }
    ]
  },
  {
    icon: <TrendingDownIcon className='size-4' />,
    value: 'RM 6,800',
    title: 'Total Expenses',
    changePercentage: '-2.7%',
    chartData: [
      { day: 'Mon', value: 7200 },
      { day: 'Tue', value: 7100 },
      { day: 'Wed', value: 7000 },
      { day: 'Thu', value: 6900 },
      { day: 'Fri', value: 6850 },
      { day: 'Sat', value: 6820 },
      { day: 'Sun', value: 6800 }
    ]
  }
]

export default function Dashboard() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <MainLayout>
        <div className='py-4 sm:py-6 lg:py-8'>
          <div className='mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8'>
            <div className='grid gap-6 lg:grid-cols-3'>
              <div className='grid gap-4 sm:grid-cols-2 lg:col-span-2'>
                {StatisticsCardData.map((card, index) => (
                  <StatisticsCard
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    value={card.value}
                    changePercentage={card.changePercentage}
                    chartData={card.chartData}
                  />
                ))}
              </div>
              <div className='lg:col-span-1'>
                <ChartPieExpenses />
              </div>
          </div>
            <ChartAreaFinancial />
            <DataTableTransactions />
          </div>
      </div>
      </MainLayout>
    </AuthGuard>
  )
}
