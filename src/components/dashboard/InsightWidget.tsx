import { motion } from 'framer-motion'
import { Lightbulb, TrendingDown, TrendingUp } from 'lucide-react'
import type { InsightItem } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const impactConfig = {
  positive: {
    icon: TrendingUp,
    color: 'text-success bg-success/10',
    badge: 'success' as const,
  },
  negative: {
    icon: TrendingDown,
    color: 'text-destructive bg-destructive/10',
    badge: 'destructive' as const,
  },
  neutral: {
    icon: Lightbulb,
    color: 'text-muted-foreground bg-muted',
    badge: 'secondary' as const,
  },
}

interface InsightWidgetProps {
  insights: InsightItem[]
  isLoading?: boolean
}

export function InsightWidget({ insights, isLoading }: InsightWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>Automated market intelligence</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const config = impactConfig[insight.impact]
              const Icon = config.icon
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30"
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      config.color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{insight.title}</p>
                      {insight.metric && (
                        <Badge variant={config.badge} className="shrink-0 text-[10px]">
                          {insight.metric}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
