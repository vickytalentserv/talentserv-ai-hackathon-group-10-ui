import { motion } from 'framer-motion'
import type { TaskItem } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const statusConfig: Record<
  TaskItem['status'],
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  blocked: { label: 'Blocked', variant: 'destructive' },
}

const priorityColors: Record<TaskItem['priority'], string> = {
  low: 'border-l-muted-foreground',
  medium: 'border-l-warning',
  high: 'border-l-destructive',
}

interface TaskStatusCardsProps {
  tasks: TaskItem[]
  isLoading?: boolean
}

export function TaskStatusCards({ tasks, isLoading }: TaskStatusCardsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks & Status</CardTitle>
        <CardDescription>Pipeline and operational tasks</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  'rounded-xl border border-border border-l-4 bg-card p-4 shadow-soft transition-shadow hover:shadow-elevated',
                  priorityColors[task.priority],
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{task.title}</p>
                  <Badge variant={statusConfig[task.status].variant} className="shrink-0 text-[10px]">
                    {statusConfig[task.status].label}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{task.assignee}</span>
                    <span className="capitalize">{task.priority} priority</span>
                  </div>
                  <Progress value={task.progress} />
                  <p className="text-right text-xs text-muted-foreground">{task.progress}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
