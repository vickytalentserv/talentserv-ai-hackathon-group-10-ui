import {
  BarChart3,
  Building2,
  FileText,
  IndianRupee,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  BarChart3,
  TrendingUp,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  FileText,
  Settings,
}

const kpiIconMap: Record<string, LucideIcon> = {
  Building2,
  IndianRupee,
  Target,
  Users,
}

export function getNavIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutDashboard
}

export function getKpiIcon(name: string): LucideIcon {
  return kpiIconMap[name] ?? LayoutDashboard
}

export { IndianRupee, Target, Users }
