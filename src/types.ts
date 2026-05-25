export type TransactionType = 'Buy' | 'Rent'

export type PropertyStatus = 'Ready to Move' | 'Under Construction' | 'Resale'

export type TrendDirection = 'rising' | 'stable' | 'cooling'

export interface ParsedRequirement {
  rawInput: string
  city?: string
  localities: string[]
  transactionType?: TransactionType
  bhk: number[]
  budgetMax?: number
  propertyType?: string
  statusPreference?: PropertyStatus
  preferenceNotes: string[]
  confidence: number
}

export interface RawPropertyListing {
  property_id?: string
  title?: string
  source?: string
  source_url?: string
  city?: string
  locality?: string
  property_type?: string
  transaction_type?: string
  bhk?: number | string
  price?: number | string
  area_sqft?: number | string
  status?: string
  builder_or_owner?: string
  project_name?: string
}

export interface NormalizedProperty {
  propertyId: string
  title: string
  source: string
  sourceUrl?: string
  city: string
  locality: string
  propertyType: string
  transactionType: TransactionType
  bhk: number
  price: number
  areaSqft: number
  status: PropertyStatus
  builderOrOwner: string
  projectName: string
  pricePerSqft: number
  incompleteFields: string[]
  raw: RawPropertyListing
}

export interface DuplicateGroup {
  groupId: string
  canonicalPropertyId: string
  propertyIds: string[]
  reason: string
}

export interface BuilderProfile {
  builderOrOwner: string
  projectName: string
  reputationScore: number
  completionTrackRecord: string
  reviewSummary: string
  knownRisks: string[]
}

export interface SentimentInsight {
  projectName: string
  sentimentScore: number
  positiveThemes: string[]
  negativeThemes: string[]
  commentCount: number
  sentimentSummary: string
}

export interface TrendInsight {
  city: string
  locality: string
  keyword: string
  trendScore: number
  trendDirection: TrendDirection
  comparedLocalities: string[]
  trendSummary: string
}

export interface EnrichedProperty extends NormalizedProperty {
  builderProfile?: BuilderProfile
  sentiment?: SentimentInsight
  trend?: TrendInsight
  recommendationScore: number
  recommendationReasons: string[]
}

export interface LocalityComparison {
  locality: string
  matches: number
  averagePrice: number
  averagePricePerSqft: number
  averageTrendScore: number
  averageSentimentScore: number
}

export interface DashboardModel {
  requirement: ParsedRequirement
  cleanedProperties: NormalizedProperty[]
  duplicateGroups: DuplicateGroup[]
  matchingProperties: EnrichedProperty[]
  localityComparison: LocalityComparison[]
  recommendationSummary: string
}
