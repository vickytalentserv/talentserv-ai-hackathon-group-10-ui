import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { cn, formatPercent } from '@/lib/utils'

interface TrendIndicatorProps {
  value: number
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export function TrendIndicator({
  value,
  label,
  size = 'sm',
  className,
}: TrendIndicatorProps) {
  const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'

  const Icon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        size === 'sm' ? 'text-xs' : 'text-sm',
        trend === 'up' && 'text-success',
        trend === 'down' && 'text-destructive',
        trend === 'neutral' && 'text-muted-foreground',
        className,
      )}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      {formatPercent(value)}
      {label && <span className="text-muted-foreground font-normal">{label}</span>}
    </span>
  )
}
