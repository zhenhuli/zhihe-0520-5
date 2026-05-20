import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CalendarIcon, ArrowRight } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DateSelectorProps {
  checkIn: Date
  checkOut: Date
  onCheckInChange: (date: Date) => void
  onCheckOutChange: (date: Date) => void
}

export function DateSelector({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: DateSelectorProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    if (!isNaN(date.getTime())) {
      onCheckInChange(date)
      if (date >= checkOut) {
        onCheckOutChange(addDays(date, 1))
      }
    }
  }

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    if (!isNaN(date.getTime()) && date > checkIn) {
      onCheckOutChange(date)
    }
  }

  const setQuickDates = (days: number) => {
    const newCheckIn = new Date(today)
    const newCheckOut = addDays(newCheckIn, days)
    onCheckInChange(newCheckIn)
    onCheckOutChange(newCheckOut)
  }

  const minCheckOut = format(addDays(checkIn, 1), 'yyyy-MM-dd')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          选择入住日期
        </CardTitle>
        <CardDescription>
          选择入住和离店日期，系统将自动核算房价
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="check-in">入住日期</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="check-in"
                type="date"
                value={format(checkIn, 'yyyy-MM-dd')}
                min={format(today, 'yyyy-MM-dd')}
                onChange={handleCheckInChange}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {format(checkIn, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </p>
          </div>

          <div className="hidden md:flex items-center pb-8">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="check-out">离店日期</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="check-out"
                type="date"
                value={format(checkOut, 'yyyy-MM-dd')}
                min={minCheckOut}
                onChange={handleCheckOutChange}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {format(checkOut, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground py-1">快速选择：</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickDates(1)}
          >
            1 晚
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickDates(2)}
          >
            2 晚
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickDates(3)}
          >
            3 晚
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickDates(7)}
          >
            1 周
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickDates(14)}
          >
            2 周
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickDates(30)}
          >
            1 个月
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
