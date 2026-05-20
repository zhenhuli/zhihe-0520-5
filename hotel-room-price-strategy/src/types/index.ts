export interface BasePrice {
  weekday: number
  weekend: number
  holiday: number
}

export interface DiscountRule {
  minDays: number
  discountPercent: number
  enabled: boolean
}

export interface PricingStrategy {
  basePrice: BasePrice
  discountRules: DiscountRule[]
  holidays: string[]
}

export interface DayPrice {
  date: Date
  dateStr: string
  dayOfWeek: number
  dayOfWeekName: string
  basePrice: number
  isWeekend: boolean
  isHoliday: boolean
  priceType: 'weekday' | 'weekend' | 'holiday'
}

export interface PriceCalculation {
  checkIn: Date
  checkOut: Date
  totalNights: number
  dayPrices: DayPrice[]
  subtotal: number
  discountPercent: number
  discountAmount: number
  finalPrice: number
  applicableRule: DiscountRule | null
}

export const DEFAULT_PRICING_STRATEGY: PricingStrategy = {
  basePrice: {
    weekday: 299,
    weekend: 399,
    holiday: 499,
  },
  discountRules: [
    { minDays: 3, discountPercent: 5, enabled: true },
    { minDays: 7, discountPercent: 10, enabled: true },
    { minDays: 14, discountPercent: 15, enabled: false },
    { minDays: 30, discountPercent: 20, enabled: false },
  ],
  holidays: [],
}

export const CHINA_HOLIDAYS_2026: string[] = [
  '2026-01-01', '2026-01-02', '2026-01-03',
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22',
  '2026-04-04', '2026-04-05', '2026-04-06',
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
  '2026-06-19', '2026-06-20', '2026-06-21',
  '2026-09-25', '2026-09-26', '2026-09-27',
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07',
]

export const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
