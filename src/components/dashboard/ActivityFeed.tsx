import { motion } from 'framer-motion'
import type { ActivityItem } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const typeColors: Record<ActivityItem['type'], string> = {
  listing: 'bg-primary/10 text-primary',
  analysis: 'bg-success/10 text-success',
  alert: 'bg-warning/10 text-warning',
  user: 'bg-muted text-muted-foreground',
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent actions across your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px]">{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize',
                          typeColors[activity.type],
                        )}
                      >
                        {activity.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
