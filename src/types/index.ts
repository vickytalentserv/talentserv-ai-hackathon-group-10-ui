export type Theme = 'light' | 'dark' | 'system'

export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'studio' | 'independent_house'
export type FurnishingStatus = 'furnished' | 'semi_furnished' | 'unfurnished'
export type AvailabilityStatus = 'available' | 'sold' | 'rented' | 'under_offer'
export type TransactionType = 'buy' | 'rent'

export interface PropertyListing {
  id: string
  title: string
  description: string
  image: string
  images: string[]
  locality: string
  city: string
  bhk: number
  price: number
  area: number
  propertyType: PropertyType
  furnishing: FurnishingStatus
  transactionType: TransactionType
  amenities: string[]
  availability: AvailabilityStatus
  rating: number
  reviewCount: number
  builder: string
  status: 'ready' | 'under_construction' | 'resale'
  source: string
  sentiment: number
  trend: 'up' | 'down' | 'stable'
  listedAt: string
  isFeatured?: boolean
  isLuxury?: boolean
}

export interface ParsedSearchCriteria {
  query: string
  localities: string[]
  cities: string[]
  bhk: number | null
  bhkMin: number | null
  budgetMax: number | null
  budgetMin: number | null
  propertyTypes: PropertyType[]
  furnishing: FurnishingStatus | null
  isLuxury: boolean
  keywords: string[]
}

export interface PropertyFilters {
  search: string
  localities: string[]
  propertyTypes: PropertyType[]
  bhk: number | null
  furnishing: FurnishingStatus | null
  transactionType: TransactionType | null
  priceMin: number | null
  priceMax: number | null
  sortBy: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'area'
}

export interface KpiMetric {
  id: string
  label: string
  value: string
  change: number
  changeLabel: string
  icon: string
  trend: 'up' | 'down' | 'neutral'
}

export interface ChartDataPoint {
  name: string
  value: number
  secondary?: number
}

export interface ActivityItem {
  id: string
  user: string
  avatar: string
  action: string
  target: string
  timestamp: string
  type: 'listing' | 'analysis' | 'alert' | 'user'
}

export interface UpdateItem {
  id: string
  title: string
  description: string
  timestamp: string
  category: 'market' | 'listing' | 'system' | 'insight'
  read: boolean
}

export interface TaskItem {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
  progress: number
}

export interface InsightItem {
  id: string
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  metric?: string
}

/** @deprecated Use PropertyListing for new UI */
export interface PropertyRecord {
  id: string
  title: string
  locality: string
  city: string
  bhk: number
  price: number
  area: number
  status: 'ready' | 'under_construction' | 'resale'
  source: string
  builder: string
  sentiment: number
  trend: 'up' | 'down' | 'stable'
  listedAt: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'alert'
}

export interface Workspace {
  id: string
  name: string
  plan: string
  avatar: string
}

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  badge?: string
  children?: NavItem[]
}

export interface DashboardData {
  kpis: KpiMetric[]
  revenueChart: ChartDataPoint[]
  localityChart: ChartDataPoint[]
  distributionChart: ChartDataPoint[]
  activities: ActivityItem[]
  updates: UpdateItem[]
  tasks: TaskItem[]
  insights: InsightItem[]
  properties: PropertyRecord[]
  notifications: NotificationItem[]
}

export type PropertyStatus = PropertyRecord['status']
export type TaskStatus = TaskItem['status']
export type TaskPriority = TaskItem['priority']
