import {
  format,
  eachDayOfInterval,
  differenceInDays,
  isBefore,
  startOfDay,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type {
  PricingStrategy,
  DayPrice,
  PriceCalculation,
  DiscountRule,
} from '@/types'
import { DAY_NAMES } from '@/types'

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function formatDisplayDate(date: Date): string {
  return format(date, 'yyyy年MM月dd日', { locale: zhCN })
}

export function isWeekend(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6
}

export function isHoliday(dateStr: string, holidays: string[]): boolean {
  return holidays.includes(dateStr)
}

export function getDayPrice(
  date: Date,
  strategy: PricingStrategy
): DayPrice {
  const dateStr = formatDate(date)
  const dayOfWeek = date.getDay()
  const isHolidayDate = isHoliday(dateStr, strategy.holidays)
  const isWeekendDate = isWeekend(dayOfWeek)

  let priceType: 'weekday' | 'weekend' | 'holiday' = 'weekday'
  let basePrice = strategy.basePrice.weekday

  if (isHolidayDate) {
    priceType = 'holiday'
    basePrice = strategy.basePrice.holiday
  } else if (isWeekendDate) {
    priceType = 'weekend'
    basePrice = strategy.basePrice.weekend
  }

  return {
    date,
    dateStr,
    dayOfWeek,
    dayOfWeekName: DAY_NAMES[dayOfWeek],
    basePrice,
    isWeekend: isWeekendDate,
    isHoliday: isHolidayDate,
    priceType,
  }
}

export function getApplicableDiscountRule(
  totalNights: number,
  discountRules: DiscountRule[]
): DiscountRule | null {
  const enabledRules = discountRules
    .filter((rule) => rule.enabled && rule.minDays <= totalNights)
    .sort((a, b) => b.minDays - a.minDays)

  return enabledRules.length > 0 ? enabledRules[0] : null
}

export function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  strategy: PricingStrategy
): PriceCalculation | null {
  const checkInStart = startOfDay(checkIn)
  const checkOutStart = startOfDay(checkOut)

  if (!isBefore(checkInStart, checkOutStart)) {
    return null
  }

  const totalNights = differenceInDays(checkOutStart, checkInStart)
  const days = eachDayOfInterval({ start: checkInStart, end: checkOutStart })
  const nightDays = days.slice(0, -1)

  const dayPrices: DayPrice[] = nightDays.map((date) =>
    getDayPrice(date, strategy)
  )

  const subtotal = dayPrices.reduce((sum, day) => sum + day.basePrice, 0)
  const applicableRule = getApplicableDiscountRule(totalNights, strategy.discountRules)
  const discountPercent = applicableRule?.discountPercent ?? 0
  const discountAmount = Math.round(subtotal * (discountPercent / 100))
  const finalPrice = subtotal - discountAmount

  return {
    checkIn: checkInStart,
    checkOut: checkOutStart,
    totalNights,
    dayPrices,
    subtotal,
    discountPercent,
    discountAmount,
    finalPrice,
    applicableRule,
  }
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}
