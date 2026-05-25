import { motion } from 'framer-motion'
import { Building2, MapPin, TrendingUp, Users } from 'lucide-react'
import type { DashboardStats } from '@/types/property'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsWidgetsProps {
  stats: DashboardStats
}

const statCards = [
  { key: 'totalListed', label: 'Total listed', icon: Building2 },
  { key: 'soldOrRented', label: 'Sold / rented', icon: Users },
  { key: 'trendingLocation', label: 'Trending location', icon: MapPin },
  { key: 'categoriesCount', label: 'Property categories', icon: TrendingUp },
] as const

export function StatsWidgets({ stats }: StatsWidgetsProps) {
  const values: Record<(typeof statCards)[number]['key'], string | number> = {
    totalListed: stats.totalListed,
    soldOrRented: stats.soldOrRented,
    trendingLocation: stats.trendingLocation,
    categoriesCount: stats.categories.length,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className="rounded-lg bg-accent p-2 text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tracking-tight">{values[card.key]}</p>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export function CategoryBreakdown({ stats }: StatsWidgetsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Property categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.categories.map((category) => (
          <div key={category.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="capitalize">{category.label}</span>
              <span className="font-medium">{category.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.max(8, (category.count / stats.totalListed) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RecentActivityPanel({ properties }: { properties: { title: string; city: string }[] }) {
  const recent = properties.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recent.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div>
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.city} · Listed recently</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
