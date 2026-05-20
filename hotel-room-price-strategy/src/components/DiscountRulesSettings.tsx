
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
import type { DiscountRule } from '@/types'
import { Percent, Plus, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiscountRulesSettingsProps {
  discountRules: DiscountRule[]
  onChange: (discountRules: DiscountRule[]) => void
}

export function DiscountRulesSettings({ discountRules, onChange }: DiscountRulesSettingsProps) {
  const handleRuleChange = (index: number, field: keyof DiscountRule, value: number | boolean) => {
    const newRules = [...discountRules]
    newRules[index] = {
      ...newRules[index],
      [field]: value,
    }
    onChange(newRules)
  }

  const addRule = () => {
    const maxDays = Math.max(...discountRules.map((r) => r.minDays), 0)
    onChange([
      ...discountRules,
      { minDays: maxDays + 7, discountPercent: 5, enabled: true },
    ])
  }

  const removeRule = (index: number) => {
    if (discountRules.length <= 1) return
    onChange(discountRules.filter((_, i) => i !== index))
  }

  const toggleRule = (index: number) => {
    handleRuleChange(index, 'enabled', !discountRules[index].enabled)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          连住优惠规则
        </CardTitle>
        <CardDescription>
          设置入住天数对应的折扣优惠，系统自动应用最高折扣
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {discountRules.map((rule, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border transition-all',
                rule.enabled
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-muted/50 opacity-60'
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleRule(index)}
                className={cn(
                  'h-8 w-8',
                  rule.enabled
                    ? 'text-primary hover:text-primary hover:bg-primary/10'
                    : 'text-muted-foreground'
                )}
              >
                {rule.enabled ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap">入住满</Label>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="1"
                      value={rule.minDays}
                      onChange={(e) =>
                        handleRuleChange(
                          index,
                          'minDays',
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="text-center"
                    />
                  </div>
                  <Label className="whitespace-nowrap">晚</Label>
                </div>

                <span className="text-muted-foreground">享</span>

                <div className="flex items-center gap-2">
                  <div className="w-20">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={rule.discountPercent}
                      onChange={(e) =>
                        handleRuleChange(
                          index,
                          'discountPercent',
                          Math.min(
                            100,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                      className="text-center"
                    />
                  </div>
                  <Label className="whitespace-nowrap">% 折扣</Label>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRule(index)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={discountRules.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={addRule}
        >
          <Plus className="h-4 w-4 mr-2" />
          添加优惠规则
        </Button>
      </CardContent>
    </Card>
  )
}
