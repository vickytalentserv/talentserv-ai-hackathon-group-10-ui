import { motion } from 'framer-motion'
import type { UpdateItem } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const categoryVariant: Record<UpdateItem['category'], 'default' | 'secondary' | 'success' | 'warning'> = {
  market: 'default',
  listing: 'secondary',
  system: 'secondary',
  insight: 'success',
}

interface RecentUpdatesProps {
  updates: UpdateItem[]
  isLoading?: boolean
}

export function RecentUpdates({ updates, isLoading }: RecentUpdatesProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Updates</CardTitle>
        <CardDescription>Market signals and system notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 border-b border-border pb-4 last:border-0">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className={cn(
                  'group rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/30',
                  !update.read && 'bg-primary/5',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!update.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <p className="truncate text-sm font-medium">{update.title}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {update.description}
                    </p>
                  </div>
                  <Badge variant={categoryVariant[update.category]} className="shrink-0 text-[10px]">
                    {update.category}
                  </Badge>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {formatRelativeTime(update.timestamp)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
