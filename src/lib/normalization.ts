import type { NormalizedProperty, PropertyStatus, RawPropertyListing, TransactionType } from '../types'

const CITY_ALIASES: Record<string, string> = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  pune: 'Pune',
}

const LOCALITY_ALIASES: Record<string, string> = {
  hinjawadi: 'Hinjewadi',
  hinjewadi: 'Hinjewadi',
  wakad: 'Wakad',
  baner: 'Baner',
  whitefield: 'Whitefield',
  sarjapur: 'Sarjapur Road',
  'sarjapur road': 'Sarjapur Road',
}

const STATUS_ALIASES: Array<[RegExp, PropertyStatus]> = [
  [/under\s*construction|new\s*project|launch|possession/i, 'Under Construction'],
  [/resale|secondary/i, 'Resale'],
  [/ready|ready\s*to\s*move|rtm/i, 'Ready to Move'],
]

export function normalizeCity(value?: string): string {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) {
    return 'Unknown'
  }

  return CITY_ALIASES[normalized] ?? titleCase(value)
}

export function normalizeLocality(value?: string): string {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) {
    return 'Unknown'
  }

  return LOCALITY_ALIASES[normalized] ?? titleCase(value)
}

export function normalizeTransactionType(value?: string): TransactionType {
  return /rent|lease|tenant/i.test(value ?? '') ? 'Rent' : 'Buy'
}

export function normalizeStatus(value?: string): PropertyStatus {
  const status = value ?? ''
  return STATUS_ALIASES.find(([pattern]) => pattern.test(status))?.[1] ?? 'Ready to Move'
}

export function normalizeBhk(value?: number | string): number {
  if (typeof value === 'number') {
    return value
  }

  const match = value?.match(/\d+/)
  return match ? Number(match[0]) : 0
}

export function normalizeArea(value?: number | string): number {
  if (typeof value === 'number') {
    return value
  }

  const numeric = value?.replace(/,/g, '').match(/\d+(\.\d+)?/)
  return numeric ? Math.round(Number(numeric[0])) : 0
}

export function normalizePrice(value?: number | string): number {
  if (typeof value === 'number') {
    return Math.round(value)
  }

  const rawValue = value?.trim()
  if (!rawValue) {
    return 0
  }

  const compact = rawValue.toLowerCase().replace(/₹|rs\.?|inr|,/g, '').trim()
  const numberMatch = compact.match(/\d+(\.\d+)?/)
  if (!numberMatch) {
    return 0
  }

  const amount = Number(numberMatch[0])
  if (/crore|\bcr\b/.test(compact)) {
    return Math.round(amount * 10_000_000)
  }
  if (/lakh|lac|\bl\b/.test(compact)) {
    return Math.round(amount * 100_000)
  }
  if (/k\b|thousand/.test(compact)) {
    return Math.round(amount * 1_000)
  }

  return Math.round(amount)
}

export function normalizeProperty(listing: RawPropertyListing, index = 0): NormalizedProperty {
  const price = normalizePrice(listing.price)
  const areaSqft = normalizeArea(listing.area_sqft)
  const bhk = normalizeBhk(listing.bhk)
  const incompleteFields = findIncompleteFields(listing, price, areaSqft, bhk)

  return {
    propertyId: listing.property_id?.trim() || `PROP-${index + 1}`,
    title: listing.title?.trim() || 'Untitled property',
    source: listing.source?.trim() || 'Unknown source',
    sourceUrl: listing.source_url?.trim(),
    city: normalizeCity(listing.city),
    locality: normalizeLocality(listing.locality),
    propertyType: normalizePropertyType(listing.property_type),
    transactionType: normalizeTransactionType(listing.transaction_type),
    bhk,
    price,
    areaSqft,
    status: normalizeStatus(listing.status),
    builderOrOwner: listing.builder_or_owner?.trim() || 'Unknown builder/owner',
    projectName: listing.project_name?.trim() || 'Independent listing',
    pricePerSqft: areaSqft > 0 ? Math.round(price / areaSqft) : 0,
    incompleteFields,
    raw: listing,
  }
}

export function normalizeProperties(listings: RawPropertyListing[]): NormalizedProperty[] {
  return listings.map((listing, index) => normalizeProperty(listing, index))
}

export function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function normalizePropertyType(value?: string): string {
  if (/flat/i.test(value ?? '')) {
    return 'Apartment'
  }

  return value?.trim() || 'Apartment'
}

function findIncompleteFields(
  listing: RawPropertyListing,
  price: number,
  areaSqft: number,
  bhk: number,
): string[] {
  const missing: string[] = []
  const requiredFields: Array<[keyof RawPropertyListing, string]> = [
    ['title', 'title'],
    ['source', 'source'],
    ['city', 'city'],
    ['locality', 'locality'],
    ['transaction_type', 'transaction_type'],
    ['status', 'status'],
    ['builder_or_owner', 'builder_or_owner'],
    ['project_name', 'project_name'],
  ]

  requiredFields.forEach(([field, label]) => {
    if (!listing[field]) {
      missing.push(label)
    }
  })

  if (price <= 0) {
    missing.push('price')
  }
  if (areaSqft <= 0) {
    missing.push('area_sqft')
  }
  if (bhk <= 0) {
    missing.push('bhk')
  }

  return missing
}
