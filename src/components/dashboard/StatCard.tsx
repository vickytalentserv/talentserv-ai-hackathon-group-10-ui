import { motion } from 'framer-motion'
import type { KpiMetric } from '@/types'
import { getKpiIcon } from '@/utils/icon-mapper'
import { TrendIndicator } from '@/components/charts/TrendIndicator'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  metric: KpiMetric
  index?: number
}

export function StatCard({ metric, index = 0 }: StatCardProps) {
  const Icon = getKpiIcon(metric.icon)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="group relative overflow-hidden transition-shadow duration-300 hover:shadow-elevated">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
              <TrendIndicator value={metric.change} label={metric.changeLabel} />
            </div>
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300',
                metric.trend === 'up' && 'bg-success/10 text-success group-hover:bg-success/15',
                metric.trend === 'down' && 'bg-destructive/10 text-destructive group-hover:bg-destructive/15',
                metric.trend === 'neutral' && 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  )
}

interface KpiGridProps {
  metrics: KpiMetric[]
  isLoading?: boolean
}

export function KpiGrid({ metrics, isLoading }: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <StatCard key={metric.id} metric={metric} index={index} />
      ))}
    </div>
  )
}
