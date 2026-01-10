'use client'

import type { ReactNode } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

import { cn } from '@/lib/utils'

// Statistics card data type
type StatisticsCardProps = {
  icon: ReactNode
  value: string
  title: string
  changePercentage: string
  chartData: Array<{ day: string; value: number }>
  className?: string
}

const StatisticsCard = ({ icon, value, title, changePercentage, chartData, className }: StatisticsCardProps) => {
  const isPositive = changePercentage.startsWith('+')
  const chartColor = isPositive ? 'var(--chart-2)' : 'var(--chart-1)'

  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader className='flex items-center'>
        <div className='bg-muted/50 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'>
          {icon}
        </div>
        <span className='text-2xl'>{value}</span>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <span className='font-semibold'>{title}</span>
          <p className='space-x-2 text-sm'>
            <span>{changePercentage}</span>
            <span className='text-muted-foreground'>than last week</span>
          </p>
        </div>
        <div className='h-[100px] w-full'>
          <ChartContainer
            config={{
              value: {
                label: title,
                color: chartColor
              }
            }}
            className='h-full w-full'
          >
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='day'
                tickLine={false}
                axisLine={false}
                tickMargin={2}
                interval={0}
                tick={{ fontSize: 10 }}
                height={18}
              />
              <YAxis
                hide
                domain={['auto', 'auto']}
                allowDataOverflow={false}
              />
              <ChartTooltip
                cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '3 3' }}
                content={<ChartTooltipContent hideLabel indicator='line' />}
              />
              <Line
                type='monotone'
                dataKey='value'
                stroke={chartColor}
                strokeWidth={2.5}
                dot={{
                  fill: chartColor,
                  strokeWidth: 2,
                  r: 4,
                  strokeOpacity: 0
                }}
                activeDot={{
                  r: 5,
                  fill: chartColor,
                  strokeWidth: 0
                }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard

