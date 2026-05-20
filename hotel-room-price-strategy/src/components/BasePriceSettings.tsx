
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BasePrice } from '@/types'
import { CalendarDays, Sun, PartyPopper } from 'lucide-react'

interface BasePriceSettingsProps {
  basePrice: BasePrice
  onChange: (basePrice: BasePrice) => void
}

export function BasePriceSettings({ basePrice, onChange }: BasePriceSettingsProps) {
  const handleChange = (key: keyof BasePrice, value: string) => {
    const numValue = parseInt(value) || 0
    onChange({
      ...basePrice,
      [key]: Math.max(0, numValue),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          基准价格设置
        </CardTitle>
        <CardDescription>
          设置工作日、周末和节假日的基础房价（单位：元/晚）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="weekday-price" className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              工作日价格
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ¥
              </span>
              <Input
                id="weekday-price"
                type="number"
                min="0"
                value={basePrice.weekday}
                onChange={(e) => handleChange('weekday', e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              周一至周五
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="weekend-price" className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              周末价格
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ¥
              </span>
              <Input
                id="weekend-price"
                type="number"
                min="0"
                value={basePrice.weekend}
                onChange={(e) => handleChange('weekend', e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              周六、周日
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="holiday-price" className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4 text-rose-500" />
              节假日价格
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ¥
              </span>
              <Input
                id="holiday-price"
                type="number"
                min="0"
                value={basePrice.holiday}
                onChange={(e) => handleChange('holiday', e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              法定节假日
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
