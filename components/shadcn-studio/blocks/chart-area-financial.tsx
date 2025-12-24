'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const chartData = [
  { date: '2024-04-01', income: 2450, expenses: 1800 },
  { date: '2024-04-02', income: 1200, expenses: 2100 },
  { date: '2024-04-03', income: 1890, expenses: 1500 },
  { date: '2024-04-04', income: 3200, expenses: 2400 },
  { date: '2024-04-05', income: 4100, expenses: 3200 },
  { date: '2024-04-06', income: 3500, expenses: 2800 },
  { date: '2024-04-07', income: 2800, expenses: 2200 },
  { date: '2024-04-08', income: 4800, expenses: 3600 },
  { date: '2024-04-09', income: 900, expenses: 1400 },
  { date: '2024-04-10', income: 3100, expenses: 2300 },
  { date: '2024-04-11', income: 3900, expenses: 3800 },
  { date: '2024-04-12', income: 3400, expenses: 2600 },
  { date: '2024-04-13', income: 4200, expenses: 4100 },
  { date: '2024-04-14', income: 1800, expenses: 2700 },
  { date: '2024-04-15', income: 1500, expenses: 2000 },
  { date: '2024-04-16', income: 1700, expenses: 2300 },
  { date: '2024-04-17', income: 5200, expenses: 4200 },
  { date: '2024-04-18', income: 4300, expenses: 4800 },
  { date: '2024-04-19', income: 2900, expenses: 2200 },
  { date: '2024-04-20', income: 1100, expenses: 1800 },
  { date: '2024-04-21', income: 1800, expenses: 2400 },
  { date: '2024-04-22', income: 2700, expenses: 2000 },
  { date: '2024-04-23', income: 1700, expenses: 2700 },
  { date: '2024-04-24', income: 4500, expenses: 3400 },
  { date: '2024-04-25', income: 2600, expenses: 3000 },
  { date: '2024-04-26', income: 950, expenses: 1600 },
  { date: '2024-04-27', income: 4400, expenses: 4900 },
  { date: '2024-04-28', income: 1500, expenses: 2200 },
  { date: '2024-04-29', income: 3700, expenses: 2900 },
  { date: '2024-04-30', income: 5100, expenses: 4300 },
  { date: '2024-05-01', income: 2000, expenses: 2600 },
  { date: '2024-05-02', income: 3500, expenses: 3600 },
  { date: '2024-05-03', income: 2900, expenses: 2300 },
  { date: '2024-05-04', income: 4500, expenses: 4800 },
  { date: '2024-05-05', income: 5400, expenses: 4300 },
  { date: '2024-05-06', income: 5600, expenses: 5700 },
  { date: '2024-05-07', income: 4400, expenses: 3500 },
  { date: '2024-05-08', income: 1800, expenses: 2500 },
  { date: '2024-05-09', income: 2700, expenses: 2200 },
  { date: '2024-05-10', income: 3500, expenses: 3800 },
  { date: '2024-05-11', income: 3900, expenses: 3200 },
  { date: '2024-05-12', income: 2300, expenses: 2800 },
  { date: '2024-05-13', income: 2300, expenses: 1900 },
  { date: '2024-05-14', income: 5100, expenses: 5400 },
  { date: '2024-05-15', income: 5300, expenses: 4300 },
  { date: '2024-05-16', income: 3900, expenses: 4600 },
  { date: '2024-05-17', income: 5600, expenses: 4800 },
  { date: '2024-05-18', income: 3700, expenses: 4000 },
  { date: '2024-05-19', income: 2800, expenses: 2200 },
  { date: '2024-05-20', income: 2100, expenses: 2700 },
  { date: '2024-05-21', income: 1000, expenses: 1700 },
  { date: '2024-05-22', income: 950, expenses: 1500 },
  { date: '2024-05-23', income: 3000, expenses: 3400 },
  { date: '2024-05-24', income: 3500, expenses: 2600 },
  { date: '2024-05-25', income: 2400, expenses: 2900 },
  { date: '2024-05-26', income: 2500, expenses: 2000 },
  { date: '2024-05-27', income: 4800, expenses: 5100 },
  { date: '2024-05-28', income: 2800, expenses: 2300 },
  { date: '2024-05-29', income: 900, expenses: 1600 },
  { date: '2024-05-30', income: 3900, expenses: 3300 },
  { date: '2024-05-31', income: 2100, expenses: 2700 },
  { date: '2024-06-01', income: 2100, expenses: 2400 },
  { date: '2024-06-02', income: 5300, expenses: 4600 },
  { date: '2024-06-03', income: 1200, expenses: 1900 },
  { date: '2024-06-04', income: 5000, expenses: 4300 },
  { date: '2024-06-05', income: 1050, expenses: 1700 },
  { date: '2024-06-06', income: 3500, expenses: 2900 },
  { date: '2024-06-07', income: 3800, expenses: 4200 },
  { date: '2024-06-08', income: 4400, expenses: 3700 },
  { date: '2024-06-09', income: 5000, expenses: 5300 },
  { date: '2024-06-10', income: 1800, expenses: 2400 },
  { date: '2024-06-11', income: 1100, expenses: 1800 },
  { date: '2024-06-12', income: 5500, expenses: 4800 },
  { date: '2024-06-13', income: 950, expenses: 1600 },
  { date: '2024-06-14', income: 4800, expenses: 4300 },
  { date: '2024-06-15', income: 3600, expenses: 4000 },
  { date: '2024-06-16', income: 4300, expenses: 3600 },
  { date: '2024-06-17', income: 5400, expenses: 5700 },
  { date: '2024-06-18', income: 1250, expenses: 2000 },
  { date: '2024-06-19', income: 3900, expenses: 3400 },
  { date: '2024-06-20', income: 4700, expenses: 5000 },
  { date: '2024-06-21', income: 2000, expenses: 2500 },
  { date: '2024-06-22', income: 3700, expenses: 3200 },
  { date: '2024-06-23', income: 5400, expenses: 5800 },
  { date: '2024-06-24', income: 1600, expenses: 2200 },
  { date: '2024-06-25', income: 1700, expenses: 2300 },
  { date: '2024-06-26', income: 5000, expenses: 4300 },
  { date: '2024-06-27', income: 5100, expenses: 5400 },
  { date: '2024-06-28', income: 1800, expenses: 2400 },
  { date: '2024-06-29', income: 1200, expenses: 1900 },
  { date: '2024-06-30', income: 5100, expenses: 4500 }
]

const chartConfig = {
  income: {
    label: 'Income',
    color: 'var(--chart-1)'
  },
  expenses: {
    label: 'Expenses',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig

export function ChartAreaFinancial() {
  const [timeRange, setTimeRange] = React.useState('90d')

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date('2024-06-30')
    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const getDescription = () => {
    switch (timeRange) {
      case '7d':
        return 'Showing income and expenses for the last 7 days'
      case '30d':
        return 'Showing income and expenses for the last 30 days'
      case '90d':
      default:
        return 'Showing income and expenses for the last 3 months'
    }
  }

  return (
    <Card className='pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className='hidden w-[160px] rounded-lg sm:ml-auto sm:flex'
            aria-label='Select time range'
          >
            <SelectValue placeholder='Last 3 months' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='90d' className='rounded-lg'>
              Last 3 months
            </SelectItem>
            <SelectItem value='30d' className='rounded-lg'>
              Last 30 days
            </SelectItem>
            <SelectItem value='7d' className='rounded-lg'>
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id='fillIncome' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-income)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-income)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillExpenses' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-expenses)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-expenses)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })
                  }}
                  indicator='dot'
                />
              }
            />
            <Area
              dataKey='expenses'
              type='natural'
              fill='url(#fillExpenses)'
              stroke='var(--color-expenses)'
              stackId='a'
            />
            <Area
              dataKey='income'
              type='natural'
              fill='url(#fillIncome)'
              stroke='var(--color-income)'
              stackId='a'
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

