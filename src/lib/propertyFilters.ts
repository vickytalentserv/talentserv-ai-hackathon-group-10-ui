import type { ParsedRequirement } from '@/api/client'
import type { PropertyFilters, PropertyListing } from '@/types/property'

export function filterByParsedRequirement(
  properties: PropertyListing[],
  parsed: ParsedRequirement | null,
): PropertyListing[] {
  if (!parsed) {
    return properties
  }

  return properties.filter((property) => {
    if (parsed.intent && property.listingStatus !== parsed.intent) {
      return false
    }

    if (parsed.bedrooms != null && property.bedrooms !== parsed.bedrooms) {
      return false
    }

    if (parsed.city && !matchesLocation(property, parsed.city)) {
      return false
    }

    if (parsed.locality && !matchesLocation(property, parsed.locality)) {
      return false
    }

    if (parsed.property_type && property.propertyType !== parsed.property_type) {
      return false
    }

    const budgetMax = parsed.budget_max != null ? Number(parsed.budget_max) : null
    const budgetMin = parsed.budget_min != null ? Number(parsed.budget_min) : null
    const budgetCurrency = parsed.budget_currency ?? 'INR'
    const toInr = (value: number) => (budgetCurrency === 'USD' ? value * 83 : value)
    const budgetMaxInr = budgetMax != null ? toInr(budgetMax) : null
    const budgetMinInr = budgetMin != null ? toInr(budgetMin) : null

    if (budgetMaxInr != null && property.price > budgetMaxInr * 1.15) {
      return false
    }

    if (budgetMinInr != null && property.price < budgetMinInr * 0.85) {
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
  const normalized = query.toLowerCase()
  return [property.city, property.locality, property.location, property.title]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(normalized))
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

export function getDashboardStats(properties: PropertyListing[]) {
  const cities = properties.reduce<Record<string, number>>((acc, property) => {
    acc[property.city] = (acc[property.city] ?? 0) + 1
    return acc
  }, {})

  const trending = Object.entries(cities).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

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
