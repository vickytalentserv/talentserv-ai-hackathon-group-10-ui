import { motion } from 'framer-motion'
import { MapPin, TrendingUp } from 'lucide-react'
import type { TrendingLocation } from '@/lib/priceIndex'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendingLocationsProps {
  locations: TrendingLocation[]
  description?: string
}

export function TrendingLocations({
  locations,
  description = 'Most searched localities this month',
}: TrendingLocationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Trending Locations</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {locations.map((location, index) => (
            <div
              key={location.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-muted/30 to-transparent px-3 py-2.5 transition-colors hover:border-primary/20 hover:from-primary/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="icon-tile-blue h-9 w-9 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{location.name}</p>
                  <p className="text-xs text-muted-foreground">{location.listings} listings</p>
                </div>
              </div>
              <Badge
                variant="success"
                className={cn('shrink-0 gap-1', index === 0 && 'ring-1 ring-primary/30')}
              >
                <TrendingUp className="h-3 w-3" />
                +{location.growth}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface PriceInsightCardsProps {
  topCategory: string
  topCategoryCount: number
  rentals: number
  avgGrowth: string
  searchContext?: boolean
}

export function PriceInsightCards({
  topCategory,
  topCategoryCount,
  rentals,
  avgGrowth,
  searchContext = false,
}: PriceInsightCardsProps) {
  const cards = [
    {
      label: 'Most Popular Category',
      value: topCategory.charAt(0).toUpperCase() + topCategory.slice(1),
      sub: `${topCategoryCount} in results`,
    },
    {
      label: 'Rentals Insight',
      value: String(rentals),
      sub: searchContext ? 'Rent listings in your search' : 'High demand in IT corridors',
    },
    {
      label: 'Avg. Growth',
      value: `+${avgGrowth}%`,
      sub: searchContext ? 'Based on matching localities' : 'Across top localities',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + index * 0.06 }}
        >
          <Card className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{card.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.sub}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
