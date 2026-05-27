import type { ParsedRequirement } from '@/api/client'
import { propertyMatchesCity } from '@/lib/locality'
import type { PropertyFilters, PropertyListing } from '@/types/property'
import { normalizeBudgetCurrency } from '@/utils/requirements'

const PROPERTY_TYPE_ALIASES: Record<string, string[]> = {
  apartment: ['apartment', 'flat', 'condo'],
  flat: ['flat', 'apartment', 'condo'],
  house: ['house', 'villa', 'townhome', 'bungalow'],
  villa: ['villa', 'house', 'bungalow'],
}

function propertyMatchesType(property: PropertyListing, propertyType: string): boolean {
  const aliases = PROPERTY_TYPE_ALIASES[propertyType.toLowerCase()] ?? [propertyType.toLowerCase()]
  return aliases.includes(property.propertyType.toLowerCase())
}

export function filterByParsedRequirement(
  properties: PropertyListing[],
  parsed: ParsedRequirement | null,
  options?: { relaxed?: boolean },
): PropertyListing[] {
  if (!parsed) {
    return properties
  }

  const relaxed = options?.relaxed ?? false

  return properties.filter((property) => {
    if (!relaxed && parsed.intent && property.listingStatus !== parsed.intent) {
      return false
    }

    if (parsed.bedrooms != null && property.bedrooms !== parsed.bedrooms) {
      return false
    }

    if (parsed.city && !propertyMatchesCity(property, parsed.city)) {
      const haystack = [property.title, property.location, property.city, property.locality]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const cityTerm = parsed.city.toLowerCase()
      const aliasMatch =
        cityTerm === 'mumbai'
          ? haystack.includes('mumbai') || haystack.includes('bombay')
          : cityTerm === 'bengaluru'
            ? haystack.includes('bengaluru') || haystack.includes('bangalore')
            : haystack.includes(cityTerm)
      if (!aliasMatch) {
        return false
      }
    }

    if (parsed.locality && !matchesLocation(property, parsed.locality)) {
      return false
    }

    if (parsed.property_type && !propertyMatchesType(property, parsed.property_type)) {
      return false
    }

    const budgetMax = parsed.budget_max != null ? Number(parsed.budget_max) : null
    const budgetMin = parsed.budget_min != null ? Number(parsed.budget_min) : null
    const budgetCurrency = normalizeBudgetCurrency(parsed.budget_currency ?? 'INR', parsed.raw_text)
    const toInr = (value: number) => (budgetCurrency === 'USD' ? value * 83 : value)
    const budgetMaxInr = budgetMax != null ? toInr(budgetMax) : null
    const budgetMinInr = budgetMin != null ? toInr(budgetMin) : null

    if (!relaxed && budgetMaxInr != null && property.price > budgetMaxInr * 1.15) {
      return false
    }

    if (!relaxed && budgetMinInr != null && property.price < budgetMinInr * 0.85) {
      return false
    }

    if (parsed.raw_text.toLowerCase().includes('furnished') && property.furnishing === 'unfurnished') {
      return false
    }

    if (parsed.raw_text.toLowerCase().includes('luxury') && property.price < 50_00_000) {
      return false
    }

    return true
  })
}

function matchesLocation(property: PropertyListing, query: string): boolean {
  const normalized = query.toLowerCase().trim()
  const haystack = [property.city, property.locality, property.location, property.title]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (haystack.includes(normalized)) {
    return true
  }

  const cityNames = new Set(['mumbai', 'bombay', 'pune', 'bengaluru', 'bangalore', 'delhi', 'chennai', 'hyderabad', 'gurgaon', 'gurugram', 'kolkata'])
  const tokens = normalized
    .split(/\s+/)
    .filter((token) => token.length > 2 && !cityNames.has(token))

  if (tokens.length === 0) {
    return haystack.includes(normalized)
  }

  return tokens.some((token) => haystack.includes(token))
}

export function filterProperties(
  properties: PropertyListing[],
  filters: PropertyFilters,
): PropertyListing[] {
  let result = [...properties]

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q),
    )
  }

  if (filters.city !== 'all') {
    result = result.filter((p) => p.city === filters.city)
  }

  if (filters.propertyType !== 'all') {
    result = result.filter((p) => p.propertyType === filters.propertyType)
  }

  if (filters.furnishing !== 'all') {
    result = result.filter((p) => p.furnishing === filters.furnishing)
  }

  if (filters.listingStatus !== 'all') {
    result = result.filter((p) => p.listingStatus === filters.listingStatus)
  }

  switch (filters.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating-desc':
      result.sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }

  return result
}

export function paginateProperties<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  }
}

export function getDashboardStats(properties: PropertyListing[], preferredCity?: string | null) {
  const cities = properties.reduce<Record<string, number>>((acc, property) => {
    acc[property.city] = (acc[property.city] ?? 0) + 1
    return acc
  }, {})

  const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]?.[0]
  const trending =
    preferredCity ??
    topCity ??
    '—'

  const categories = Object.entries(
    properties.reduce<Record<string, number>>((acc, property) => {
      acc[property.propertyType] = (acc[property.propertyType] ?? 0) + 1
      return acc
    }, {}),
  ).map(([label, count]) => ({ label, count }))

  return {
    totalListed: properties.length,
    soldOrRented: properties.filter((p) => p.availability !== 'available').length,
    trendingLocation: trending,
    categories,
  }
}

export function getUniqueCities(properties: PropertyListing[]): string[] {
  return [...new Set(properties.map((p) => p.city))].sort()
}
