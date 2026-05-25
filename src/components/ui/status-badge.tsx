import type { AvailabilityStatus } from '@/types/property'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig: Record<
  AvailabilityStatus,
  { label: string; variant: 'success' | 'warning' | 'secondary' }
> = {
  available: { label: 'Available', variant: 'success' },
  sold: { label: 'Sold', variant: 'warning' },
  rented: { label: 'Rented', variant: 'secondary' },
}

interface StatusBadgeProps {
  status: AvailabilityStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  )
}
