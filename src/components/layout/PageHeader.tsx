import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  eyebrow?: ReactNode
  title: string
  description?: string
  actions?: ReactNode
  className?: string
  size?: 'default' | 'compact'
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  size = 'default',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4',
        size === 'default' ? 'mb-8' : 'mb-6',
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        {eyebrow && <div className="text-sm font-medium text-highlight">{eyebrow}</div>}
        <h1
          className={cn(
            'font-semibold tracking-tight text-foreground',
            size === 'default' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl',
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
