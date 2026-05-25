import { EmptyState } from '@/components/shared/EmptyState'
import { BarChart3 } from 'lucide-react'

export function AnalyticsPage() {
  return (
    <EmptyState
      icon={<BarChart3 className="h-6 w-6" />}
      title="Analytics"
      description="Deep-dive analytics for market trends, locality comparison, and sentiment analysis."
    />
  )
}
