import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import type { PriceCalculation, DayPrice } from '@/types'
import {
  formatCurrency,
  formatDisplayDate,
} from '@/utils/pricing'
import {
  Receipt,
  Calendar,
  Moon,
  Tag,
  ChevronDown,
  ChevronUp,
  Building2,
  Sun,
  PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricePreviewProps {
  calculation: PriceCalculation | null
}

export function PricePreview({ calculation }: PricePreviewProps) {
  const [showDetails, setShowDetails] = useState(true)

  if (!calculation) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            定价预览账单
          </CardTitle>
          <CardDescription>
            选择入住和离店日期后，将自动生成定价预览
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">请选择入住和离店日期</p>
        </CardContent>
      </Card>
    )
  }

  const {
    checkIn,
    checkOut,
    totalNights,
    dayPrices,
    subtotal,
    discountPercent,
    discountAmount,
    finalPrice,
    applicableRule,
  } = calculation

  const getPriceTypeIcon = (priceType: DayPrice['priceType']) => {
    switch (priceType) {
      case 'weekday':
        return <Building2 className="h-3 w-3" />
      case 'weekend':
        return <Sun className="h-3 w-3 text-amber-500" />
      case 'holiday':
        return <PartyPopper className="h-3 w-3 text-rose-500" />
    }
  }

  const getPriceTypeLabel = (priceType: DayPrice['priceType']) => {
    switch (priceType) {
      case 'weekday':
        return '工作日'
      case 'weekend':
        return '周末'
      case 'holiday':
        return '节假日'
    }
  }

  const getPriceTypeBadge = (priceType: DayPrice['priceType']) => {
    switch (priceType) {
      case 'weekday':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'weekend':
        return 'bg-amber-500/10 text-amber-700 border-amber-200'
      case 'holiday':
        return 'bg-rose-500/10 text-rose-700 border-rose-200'
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          定价预览账单
        </CardTitle>
        <CardDescription>
          {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">入住晚数</span>
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {totalNights} 晚
          </Badge>
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              每日房价明细
            </span>
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showDetails && (
            <div className="space-y-2 mt-2 max-h-64 overflow-y-auto pr-2">
              {dayPrices.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {day.dateStr.slice(5)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {day.dayOfWeekName}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs h-5 px-2',
                        getPriceTypeBadge(day.priceType)
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {getPriceTypeIcon(day.priceType)}
                        {getPriceTypeLabel(day.priceType)}
                      </span>
                    </Badge>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(day.basePrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">房间总价</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {applicableRule && (
            <div className="flex justify-between text-sm text-primary">
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                连住 {applicableRule.minDays} 晚优惠 (-{discountPercent}%)
              </span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">应付总额</span>
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(finalPrice)}
            </span>
          </div>

          {discountAmount > 0 && (
            <p className="text-sm text-primary text-right">
              已为您节省 {formatCurrency(discountAmount)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
