import { EmptyState } from '@/components/shared/EmptyState'
import { Settings } from 'lucide-react'

export function SettingsPage() {
  return (
    <EmptyState
      icon={<Settings className="h-6 w-6" />}
      title="Settings"
      description="Configure workspace preferences, integrations, and notification settings."
    />
  )
}
