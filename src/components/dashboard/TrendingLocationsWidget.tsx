import { motion } from 'framer-motion'
import { MapPin, TrendingUp } from 'lucide-react'
import { trendingLocations } from '@/constants/properties'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPercent } from '@/lib/utils'

export function TrendingLocationsWidget() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending Locations
        </CardTitle>
        <CardDescription>Most searched localities this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingLocations.map((loc, index) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.count} listings</p>
              </div>
              <span className="text-xs font-medium text-success">
                {formatPercent(loc.growth)}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
