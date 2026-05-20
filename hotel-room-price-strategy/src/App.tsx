import { useState, useMemo, useEffect } from 'react'
import { addDays } from 'date-fns'
import { BasePriceSettings } from '@/components/BasePriceSettings'
import { DiscountRulesSettings } from '@/components/DiscountRulesSettings'
import { DateSelector } from '@/components/DateSelector'
import { PricePreview } from '@/components/PricePreview'
import { calculatePrice } from '@/utils/pricing'
import {
  DEFAULT_PRICING_STRATEGY,
  CHINA_HOLIDAYS_2026,
} from '@/types'
import type { PricingStrategy, PriceCalculation } from '@/types'
import { Hotel, Settings, Sparkles, Calendar, Receipt } from 'lucide-react'

function App() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>({
    ...DEFAULT_PRICING_STRATEGY,
    holidays: CHINA_HOLIDAYS_2026,
  })

  const [checkIn, setCheckIn] = useState<Date>(today)
  const [checkOut, setCheckOut] = useState<Date>(addDays(today, 2))

  const calculation: PriceCalculation | null = useMemo(() => {
    return calculatePrice(checkIn, checkOut, pricingStrategy)
  }, [checkIn, checkOut, pricingStrategy])

  useEffect(() => {
    document.title = '民宿酒店房价调价模拟系统'
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Hotel className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  民宿酒店房价调价模拟系统
                </h1>
                <p className="text-xs text-muted-foreground">
                  智能定价 · 收益管理
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                实时计算房价与优惠
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">定价策略</h2>
                <p className="text-sm text-muted-foreground">
                  设置房价基准和优惠规则
                </p>
              </div>
            </div>

            <BasePriceSettings
              basePrice={pricingStrategy.basePrice}
              onChange={(basePrice) =>
                setPricingStrategy({ ...pricingStrategy, basePrice })
              }
            />

            <DiscountRulesSettings
              discountRules={pricingStrategy.discountRules}
              onChange={(discountRules) =>
                setPricingStrategy({ ...pricingStrategy, discountRules })
              }
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">模拟预览</h2>
                <p className="text-sm text-muted-foreground">
                  选择日期查看实时房价
                </p>
              </div>
            </div>

            <DateSelector
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
            />

            <PricePreview calculation={calculation} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              已内置 2026 年中国法定节假日数据 · 支持自定义定价策略
            </p>
            <p className="mt-1">
              系统自动识别工作日、周末、节假日并应用最优连住优惠
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
