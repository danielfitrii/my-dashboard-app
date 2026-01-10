export interface PeriodSettings {
    custom_period_start_day: number // 1-31
  }
  
  export function calculatePeriod(date: string, periodStartDay: number): string {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    
    // If day is before period start day, it belongs to previous month's period
    if (day < periodStartDay) {
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      return `${prevYear}-${String(prevMonth).padStart(2, '0')}`
    }
    
    return `${year}-${String(month).padStart(2, '0')}`
  }