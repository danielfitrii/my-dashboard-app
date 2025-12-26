'use client'

import { TrendingDown } from 'lucide-react'
import { Pie, PieChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'

const chartData = [
  { category: 'Food & Dining', amount: 1250, fill: 'var(--color-food)' },
  { category: 'Transportation', amount: 980, fill: 'var(--color-transport)' },
  { category: 'Shopping', amount: 750, fill: 'var(--color-shopping)' },
  { category: 'Bills & Utilities', amount: 650, fill: 'var(--color-bills)' },
  { category: 'Entertainment', amount: 420, fill: 'var(--color-entertainment)' },
  { category: 'Other', amount: 350, fill: 'var(--color-other)' }
]

const chartConfig = {
  amount: {
    label: 'Amount'
  },
  food: {
    label: 'Food & Dining',
    color: 'var(--chart-1)'
  },
  transport: {
    label: 'Transportation',
    color: 'var(--chart-2)'
  },
  shopping: {
    label: 'Shopping',
    color: 'var(--chart-3)'
  },
  bills: {
    label: 'Bills & Utilities',
    color: 'var(--chart-4)'
  },
  entertainment: {
    label: 'Entertainment',
    color: 'var(--chart-5)'
  },
  other: {
    label: 'Other',
    color: 'var(--chart-6)'
  }
} satisfies ChartConfig

export function ChartPieExpenses() {
  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>June 2024</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square w-full max-w-[280px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='amount'
              nameKey='category'
              stroke='0'
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col items-center gap-2 text-center text-sm'>
        <div className='flex items-center justify-center gap-2 leading-none font-medium'>
          Expenses down by 3.5% this month <TrendingDown className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Showing total expenses breakdown for the last month
        </div>
      </CardFooter>
    </Card>
  )
}

