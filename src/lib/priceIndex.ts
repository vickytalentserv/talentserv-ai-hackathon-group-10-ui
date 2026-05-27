import type { PropertyListing } from '@/types/property'
import { normalizePlaceName, normalizeCityName, resolvePropertyLocality, titleCasePlace, propertyMatchesCity } from '@/lib/locality'

export interface PriceIndexPoint {
  month: string
  value: number
  secondary: number
}

export interface TrendingLocation {
  name: string
  listings: number
  growth: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] as const

function averagePricePerSqft(properties: PropertyListing[]): number {
  if (properties.length === 0) {
    return 4200
  }

  const total = properties.reduce((sum, property) => {
    return sum + property.price / property.sqft
  }, 0)

  return Math.round(total / properties.length)
}

function buildTrend(baseValue: number): PriceIndexPoint[] {
  const growthPattern = [0.88, 0.9, 0.93, 0.95, 0.97, 0.99, 1]

  return MONTHS.map((month, index) => {
    const value = Math.round(baseValue * growthPattern[index])
    const secondary = Math.round(value * 0.94)
    return { month, value, secondary }
  })
}

export function getPriceIndexTrend(properties: PropertyListing[]): PriceIndexPoint[] {
  const base = averagePricePerSqft(properties)
  return buildTrend(base)
}

export function getTrendingLocations(
  properties: PropertyListing[],
  focusCity?: string | null,
): TrendingLocation[] {
  const scoped = focusCity
    ? properties.filter((property) => propertyMatchesCity(property, focusCity))
    : properties

  const counts = new Map<string, { display: string; count: number }>()

  for (const property of scoped) {
    const locality = resolvePropertyLocality(property)
    if (!locality) {
      continue
    }

    const key = normalizePlaceName(locality)
    const existing = counts.get(key)
    if (existing) {
      existing.count += 1
    } else {
      counts.set(key, { display: titleCasePlace(locality), count: 1 })
    }
  }

  if (counts.size === 0 && scoped.length > 0 && !focusCity) {
    const cityCounts = scoped.reduce<Record<string, number>>((acc, property) => {
      const key = normalizeCityName(property.city)
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, listings], index) => ({
        name: titleCasePlace(name),
        listings,
        growth: Number((6.5 + index * 1.8 + (listings % 4) * 0.7).toFixed(1)),
      }))
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(({ display, count }, index) => ({
      name: display,
      listings: count,
      growth: Number((6.5 + index * 1.8 + (count % 4) * 0.7).toFixed(1)),
    }))
}

export function getPriceInsights(properties: PropertyListing[], trend: PriceIndexPoint[]) {
  const categories = properties.reduce<Record<string, number>>((acc, property) => {
    acc[property.propertyType] = (acc[property.propertyType] ?? 0) + 1
    return acc
  }, {})

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
  const rentals = properties.filter((property) => property.listingStatus === 'rent').length
  const first = trend[0]?.value ?? 0
  const last = trend[trend.length - 1]?.value ?? 0
  const avgGrowth = first > 0 ? (((last - first) / first) * 100).toFixed(1) : '0.0'

  return {
    topCategory: topCategory?.[0] ?? 'apartment',
    topCategoryCount: topCategory?.[1] ?? 0,
    rentals,
    avgGrowth,
  }
}
