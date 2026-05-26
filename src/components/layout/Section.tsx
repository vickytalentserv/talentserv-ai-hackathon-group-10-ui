import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  variant?: 'default' | 'elevated' | 'subtle'
}

export function Section({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  variant = 'default',
}: SectionProps) {
  const variantClass =
    variant === 'elevated'
      ? 'rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-8'
      : variant === 'subtle'
        ? 'rounded-2xl border border-primary/10 bg-accent/40 p-6 sm:p-8'
        : ''

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('space-y-5', variantClass, className)}
    >
      {(title || description || action) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
            )}
            {description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </motion.section>
  )
}
