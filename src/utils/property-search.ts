import type {
  FurnishingStatus,
  ParsedSearchCriteria,
  PropertyFilters,
  PropertyListing,
  PropertyType,
} from '@/types'

const CITY_KEYWORDS = ['pune', 'bangalore', 'bengaluru', 'mumbai']

function parseBudget(text: string): { min: number | null; max: number | null } {
  const lower = text.toLowerCase()
  let max: number | null = null
  let min: number | null = null

  const croreMatch = lower.match(/under\s+(\d+(?:\.\d+)?)\s*cr(?:ore)?/i)
  if (croreMatch) max = parseFloat(croreMatch[1]!) * 1_00_00_000

  const lakhMatch = lower.match(/under\s+(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)/i)
  if (lakhMatch) max = parseFloat(lakhMatch[1]!) * 1_00_000

  const rentMatch = lower.match(/under\s+(\d+)\s*k/i)
  if (rentMatch) max = parseInt(rentMatch[1]!, 10) * 1000

  if (lower.includes('luxury') || lower.includes('premium')) {
    min = 1_00_00_000
  }

  if (lower.includes('budget') || lower.includes('affordable')) {
    max = max ?? 50_00_000
  }

  return { min, max }
}

function parseBhk(text: string): { bhk: number | null; bhkMin: number | null } {
  const match = text.match(/(\d)\s*bhk/i)
  if (match) return { bhk: parseInt(match[1]!, 10), bhkMin: null }

  const rangeMatch = text.match(/(\d)\s*(?:or|\/)\s*(\d)\s*bhk/i)
  if (rangeMatch) return { bhk: null, bhkMin: parseInt(rangeMatch[1]!, 10) }

  return { bhk: null, bhkMin: null }
}

function parseLocalities(text: string): string[] {
  const lower = text.toLowerCase()
  const found: string[] = []

  const canonicalNames: Record<string, string> = {
    baner: 'Baner',
    hinjewadi: 'Hinjewadi',
    hinjawadi: 'Hinjewadi',
    wakad: 'Wakad',
    whitefield: 'Whitefield',
    kharadi: 'Kharadi',
    'electronic city': 'Electronic City',
    electroniccity: 'Electronic City',
    'bandra west': 'Bandra West',
    bandra: 'Bandra West',
    lonavala: 'Lonavala',
  }

  for (const [alias, canonical] of Object.entries(canonicalNames)) {
    if (lower.includes(alias) && !found.includes(canonical)) {
      found.push(canonical)
    }
  }

  return found
}

function parseCities(text: string): string[] {
  const lower = text.toLowerCase()
  return CITY_KEYWORDS.filter((c) => lower.includes(c)).map((c) =>
    c === 'bengaluru' ? 'Bangalore' : c.charAt(0).toUpperCase() + c.slice(1),
  )
}

function parsePropertyTypes(text: string): PropertyType[] {
  const lower = text.toLowerCase()
  const types: PropertyType[] = []

  if (lower.includes('villa')) types.push('villa')
  if (lower.includes('penthouse')) types.push('penthouse')
  if (lower.includes('studio')) types.push('studio')
  if (lower.includes('independent')) types.push('independent_house')
  if (lower.includes('apartment') || lower.includes('flat')) types.push('apartment')

  if (lower.includes('luxury')) {
    types.push('penthouse', 'villa')
  }

  return [...new Set(types)]
}

function parseFurnishing(text: string): FurnishingStatus | null {
  const lower = text.toLowerCase()
  if (lower.includes('furnished') && !lower.includes('unfurnished') && !lower.includes('semi')) {
    return 'furnished'
  }
  if (lower.includes('semi-furnished') || lower.includes('semi furnished')) {
    return 'semi_furnished'
  }
  if (lower.includes('unfurnished')) return 'unfurnished'
  return null
}

export function parseNaturalLanguageQuery(query: string): ParsedSearchCriteria {
  const lower = query.toLowerCase()
  const { min, max } = parseBudget(query)
  const { bhk, bhkMin } = parseBhk(query)

  return {
    query,
    localities: parseLocalities(query),
    cities: parseCities(query),
    bhk,
    bhkMin,
    budgetMax: max,
    budgetMin: min,
    propertyTypes: parsePropertyTypes(query),
    furnishing: parseFurnishing(query),
    isLuxury: lower.includes('luxury') || lower.includes('premium'),
    keywords: query.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
  }
}

export function filterPropertiesByCriteria(
  properties: PropertyListing[],
  criteria: ParsedSearchCriteria,
): PropertyListing[] {
  return properties.filter((p) => {
    if (criteria.localities.length > 0 && !criteria.localities.includes(p.locality)) {
      return false
    }
    if (criteria.cities.length > 0 && !criteria.cities.some((c) => p.city.toLowerCase().includes(c.toLowerCase()))) {
      return false
    }
    if (criteria.bhk !== null && p.bhk !== criteria.bhk) return false
    if (criteria.bhkMin !== null && p.bhk < criteria.bhkMin) return false
    if (criteria.budgetMax !== null && p.price > criteria.budgetMax) return false
    if (criteria.budgetMin !== null && p.price < criteria.budgetMin) return false
    if (criteria.propertyTypes.length > 0 && !criteria.propertyTypes.includes(p.propertyType)) {
      return false
    }
    if (criteria.furnishing && p.furnishing !== criteria.furnishing) return false
    if (criteria.isLuxury && !p.isLuxury && p.price < 1_00_00_000) return false
    return true
  })
}

export function filterPropertiesByFilters(
  properties: PropertyListing[],
  filters: PropertyFilters,
): PropertyListing[] {
  let result = [...properties]

  if (filters.search.trim()) {
    const criteria = parseNaturalLanguageQuery(filters.search)
    result = filterPropertiesByCriteria(result, criteria)
    const q = filters.search.toLowerCase()
    if (result.length === 0) {
      result = properties.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.builder.toLowerCase().includes(q),
      )
    }
  }

  if (filters.localities.length > 0) {
    result = result.filter((p) => filters.localities.includes(p.locality))
  }
  if (filters.propertyTypes.length > 0) {
    result = result.filter((p) => filters.propertyTypes.includes(p.propertyType))
  }
  if (filters.bhk !== null) {
    result = result.filter((p) => p.bhk === filters.bhk)
  }
  if (filters.furnishing) {
    result = result.filter((p) => p.furnishing === filters.furnishing)
  }
  if (filters.transactionType) {
    result = result.filter((p) => p.transactionType === filters.transactionType)
  }
  if (filters.priceMin !== null) {
    result = result.filter((p) => p.price >= filters.priceMin!)
  }
  if (filters.priceMax !== null) {
    result = result.filter((p) => p.price <= filters.priceMax!)
  }

  switch (filters.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'area':
      result.sort((a, b) => b.area - a.area)
      break
    case 'newest':
      result.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime())
      break
  }

  return result
}

export const defaultPropertyFilters: PropertyFilters = {
  search: '',
  localities: [],
  propertyTypes: [],
  bhk: null,
  furnishing: null,
  transactionType: null,
  priceMin: null,
  priceMax: null,
  sortBy: 'newest',
}

export function getFurnishingLabel(f: FurnishingStatus): string {
  const labels: Record<FurnishingStatus, string> = {
    furnished: 'Furnished',
    semi_furnished: 'Semi-Furnished',
    unfurnished: 'Unfurnished',
  }
  return labels[f]
}

export function getPropertyTypeLabel(t: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    apartment: 'Apartment',
    villa: 'Villa',
    penthouse: 'Penthouse',
    studio: 'Studio',
    independent_house: 'Independent House',
  }
  return labels[t]
}

export function getAvailabilityLabel(a: PropertyListing['availability']): string {
  const labels = {
    available: 'Available',
    sold: 'Sold',
    rented: 'Rented',
    under_offer: 'Under Offer',
  }
  return labels[a]
}
