import { ArrowUpIcon, WalletIcon, TrendingDownIcon, CreditCardIcon, ScaleIcon } from 'lucide-react'

import MainLayout from '@/components/layout/MainLayout'
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card-01'
import { ChartAreaFinancial } from '@/components/shadcn-studio/blocks/chart-area-financial'
import { ChartPieExpenses } from '@/components/shadcn-studio/blocks/chart-pie-expenses'
import { DataTableTransactions } from '@/components/shadcn-studio/blocks/data-table-transactions'

// Statistics card data
const StatisticsCardData = [
  {
    icon: <CreditCardIcon className='size-4' />,
    value: '142',
    title: 'Transactions',
    changePercentage: '+4.3%'
  },
  {
    icon: <WalletIcon className='size-4' />,
    value: 'RM 8,450',
    title: 'Available Income',
    changePercentage: '+12.5%'
  },
  {
    icon: <ScaleIcon className='size-4' />,
    value: 'RM 15,240',
    title: 'Total Balance',
    changePercentage: '+8.2%'
  },
  {
    icon: <TrendingDownIcon className='size-4' />,
    value: 'RM 6,800',
    title: 'Total Expenses',
    changePercentage: '-2.7%'
  }
]

export default function Dashboard() {
  return (
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
  )
}
