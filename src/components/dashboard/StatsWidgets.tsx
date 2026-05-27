import { motion } from 'framer-motion'
import { Building2, MapPin, TrendingUp, Users } from 'lucide-react'
import type { DashboardStats } from '@/types/property'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsWidgetsProps {
  stats: DashboardStats
  searchContext?: boolean
}

const statCards = [
  { key: 'totalListed', label: 'Total listed', searchLabel: 'Matching listings', icon: Building2, tile: 'icon-tile-orange' },
  { key: 'soldOrRented', label: 'Sold / rented', searchLabel: 'Sold / rented', icon: Users, tile: 'icon-tile-teal' },
  { key: 'trendingLocation', label: 'Trending area', searchLabel: 'Top search city', icon: MapPin, tile: 'icon-tile-blue' },
  { key: 'categoriesCount', label: 'Categories', searchLabel: 'Categories', icon: TrendingUp, tile: 'icon-tile-violet' },
] as const

export function StatsWidgets({ stats, searchContext = false }: StatsWidgetsProps) {
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="transition-shadow hover:shadow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('h-11 w-11 shrink-0', card.tile)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {searchContext ? card.searchLabel : card.label}
                  </p>
                  <p className="text-2xl font-semibold tracking-tight">{values[card.key]}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

export function CategoryBreakdown({ stats }: StatsWidgetsProps) {
  const barColors = ['bg-primary', 'bg-foreground', 'bg-chart-3', 'bg-chart-4']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.categories.map((category, i) => (
          <div key={category.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">{category.label}</span>
              <span className="font-semibold text-foreground">{category.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(8, (category.count / stats.totalListed) * 100)}%` }}
                transition={{ duration: 0.5 }}
                className={cn('h-full rounded-full', barColors[i % barColors.length])}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RecentActivityPanel({ properties }: { properties: { title: string; city: string }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {properties.slice(0, 5).map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex gap-3 rounded-lg p-2.5 hover:bg-muted/50">
            <div className="icon-tile-blue mt-0.5 h-7 w-7 shrink-0">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.city}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
