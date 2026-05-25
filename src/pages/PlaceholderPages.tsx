import { EmptyState } from '@/components/shared/EmptyState'
import { Search, Sparkles, FileText } from 'lucide-react'

export function RequirementsPage() {
  return (
    <EmptyState
      icon={<Search className="h-6 w-6" />}
      title="Property Requirements"
      description="Enter natural-language property requirements and get AI-parsed structured filters."
    />
  )
}

export function RecommendationsPage() {
  return (
    <EmptyState
      icon={<Sparkles className="h-6 w-6" />}
      title="Recommendations"
      description="AI-ranked property recommendations with explainable insights."
    />
  )
}

export function ReportsPage() {
  return (
    <EmptyState
      icon={<FileText className="h-6 w-6" />}
      title="Reports"
      description="Generate and export investment analysis reports."
    />
  )
}
