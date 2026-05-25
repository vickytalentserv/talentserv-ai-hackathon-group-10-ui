import type {
  BuilderProfile,
  DashboardModel,
  EnrichedProperty,
  LocalityComparison,
  NormalizedProperty,
  ParsedRequirement,
  RawPropertyListing,
  SentimentInsight,
  TrendInsight,
} from '../types'
import { deduplicateProperties } from './deduplication'
import { normalizeProperties } from './normalization'

export function buildDashboardModel(
  requirement: ParsedRequirement,
  rawListings: RawPropertyListing[],
  builders: BuilderProfile[],
  sentiments: SentimentInsight[],
  trends: TrendInsight[],
): DashboardModel {
  const cleanedProperties = normalizeProperties(rawListings)
  const { uniqueProperties, duplicateGroups } = deduplicateProperties(cleanedProperties)
  const matchingProperties = uniqueProperties
    .filter((property) => matchesRequirement(property, requirement))
    .map((property) => enrichProperty(property, requirement, builders, sentiments, trends))
    .sort((first, second) => second.recommendationScore - first.recommendationScore)

  return {
    requirement,
    cleanedProperties: uniqueProperties,
    duplicateGroups,
    matchingProperties,
    localityComparison: buildLocalityComparison(matchingProperties),
    recommendationSummary: summarizeRecommendations(matchingProperties, requirement),
  }
}

export function matchesRequirement(property: NormalizedProperty, requirement: ParsedRequirement): boolean {
  if (requirement.city && property.city !== requirement.city) {
    return false
  }
  if (requirement.localities.length > 0 && !requirement.localities.includes(property.locality)) {
    return false
  }
  if (requirement.transactionType && property.transactionType !== requirement.transactionType) {
    return false
  }
  if (requirement.bhk.length > 0 && !requirement.bhk.includes(property.bhk)) {
    return false
  }
  if (requirement.propertyType && property.propertyType !== requirement.propertyType) {
    return false
  }
  if (requirement.budgetMax && property.price > requirement.budgetMax) {
    return false
  }
  if (requirement.statusPreference && property.status !== requirement.statusPreference) {
    return false
  }

  return true
}

export function enrichProperty(
  property: NormalizedProperty,
  requirement: ParsedRequirement,
  builders: BuilderProfile[],
  sentiments: SentimentInsight[],
  trends: TrendInsight[],
): EnrichedProperty {
  const builderProfile = findBuilderProfile(property, builders)
  const sentiment = sentiments.find((insight) => insight.projectName === property.projectName)
  const trend = trends.find((insight) => insight.city === property.city && insight.locality === property.locality)
  const { score, reasons } = calculateRecommendation(property, requirement, builderProfile, sentiment, trend)

  return {
    ...property,
    builderProfile,
    sentiment,
    trend,
    recommendationScore: score,
    recommendationReasons: reasons,
  }
}

export function buildLocalityComparison(properties: EnrichedProperty[]): LocalityComparison[] {
  const byLocality = new Map<string, EnrichedProperty[]>()
  properties.forEach((property) => {
    byLocality.set(property.locality, [...(byLocality.get(property.locality) ?? []), property])
  })

  return Array.from(byLocality.entries())
    .map(([locality, listings]) => ({
      locality,
      matches: listings.length,
      averagePrice: average(listings.map((listing) => listing.price)),
      averagePricePerSqft: average(listings.map((listing) => listing.pricePerSqft)),
      averageTrendScore: average(listings.map((listing) => listing.trend?.trendScore ?? 0)),
      averageSentimentScore: average(listings.map((listing) => listing.sentiment?.sentimentScore ?? 0)),
    }))
    .sort((first, second) => second.averageTrendScore - first.averageTrendScore)
}

function findBuilderProfile(property: NormalizedProperty, builders: BuilderProfile[]): BuilderProfile | undefined {
  return (
    builders.find((builder) => builder.projectName === property.projectName) ??
    builders.find((builder) => builder.builderOrOwner === property.builderOrOwner)
  )
}

function calculateRecommendation(
  property: NormalizedProperty,
  requirement: ParsedRequirement,
  builderProfile?: BuilderProfile,
  sentiment?: SentimentInsight,
  trend?: TrendInsight,
): { score: number; reasons: string[] } {
  let score = 15
  const reasons: string[] = []

  if (requirement.budgetMax) {
    const budgetFit = Math.max(0, (requirement.budgetMax - property.price) / requirement.budgetMax)
    score += 18 + budgetFit * 12
    reasons.push(`${formatCurrency(property.price)} is within the parsed budget ceiling.`)
  } else {
    score += 10
  }

  if (requirement.bhk.includes(property.bhk)) {
    score += 10
    reasons.push(`${property.bhk} BHK matches the requirement.`)
  }

  if (!requirement.statusPreference || requirement.statusPreference === property.status) {
    score += 8
    reasons.push(`${property.status} status fits the preference.`)
  }

  if (builderProfile) {
    score += builderProfile.reputationScore * 0.22
    reasons.push(`${builderProfile.builderOrOwner} has a ${builderProfile.reputationScore}/100 reputation score.`)
  }

  if (sentiment) {
    score += sentiment.sentimentScore * 0.16
    reasons.push(`Public sentiment is ${sentiment.sentimentScore}/100 with ${sentiment.positiveThemes[0]} as a positive theme.`)
  }

  if (trend) {
    score += trend.trendScore * 0.15
    reasons.push(`${property.locality} trend score is ${trend.trendScore}/100 and ${trend.trendDirection}.`)
  }

  if (property.incompleteFields.length > 0) {
    score -= property.incompleteFields.length * 3
  }

  return { score: Math.min(100, Math.round(score)), reasons }
}

function summarizeRecommendations(properties: EnrichedProperty[], requirement: ParsedRequirement): string {
  if (properties.length === 0) {
    return 'No properties matched all parsed filters. Broaden budget, BHK, status, or locality to see comparable options.'
  }

  const top = properties[0]
  const locality = requirement.localities.length > 0 ? requirement.localities.join(' / ') : top.locality
  return `${top.title} is the top recommendation for ${locality} with a ${top.recommendationScore}/100 fit score, supported by ${top.builderProfile?.builderOrOwner ?? top.builderOrOwner} reputation, ${top.sentiment?.sentimentScore ?? 'available'} sentiment context, and ${top.trend?.trendDirection ?? 'sample'} demand signals.`
}

function average(values: number[]): number {
  const filtered = values.filter((value) => value > 0)
  if (filtered.length === 0) {
    return 0
  }

  return Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}
