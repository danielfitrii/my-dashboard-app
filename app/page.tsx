import { ArrowUpIcon, WalletIcon, TrendingDownIcon, CreditCardIcon, ScaleIcon } from 'lucide-react'

import MainLayout from '@/components/layout/MainLayout'
import StatisticsCard from '@/components/shadcn-studio/blocks/statistics-card-01'

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
    value: '$8,450',
    title: 'Available Income',
    changePercentage: '+12.5%'
  },
  {
    icon: <ScaleIcon className='size-4' />,
    value: '$15,240',
    title: 'Total Balance',
    changePercentage: '+8.2%'
  },
  {
    icon: <TrendingDownIcon className='size-4' />,
    value: '$6,800',
    title: 'Total Expenses',
    changePercentage: '-2.7%'
  }
]

export default function Dashboard() {
  return (
    <MainLayout>
      <div className='py-4 sm:py-6 lg:py-8'>
        <div className='mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8'>
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
      </div>
    </MainLayout>
  )
}
