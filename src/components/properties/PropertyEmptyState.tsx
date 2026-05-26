import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface PropertyEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function PropertyEmptyState({ icon: Icon, title, description, action }: PropertyEmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-dashed border-border/80 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-soft">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
          {action && <div className="mt-6">{action}</div>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
