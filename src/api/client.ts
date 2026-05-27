import { apiBaseUrl } from '../config'
import { buildPropertiesUrl, type PropertyQueryParams } from '@/lib/propertyQuery'

export interface MeResponse {
  id: number
  auth0_sub: string
  email: string | null
  name: string | null
  picture: string | null
}

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export interface ProfileSyncPayload {
  email?: string | null
  name?: string | null
  picture?: string | null
}

export async function syncProfile(
  accessToken: string,
  payload: ProfileSyncPayload,
): Promise<MeResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export interface ParsedRequirement {
  raw_text: string
  intent: 'buy' | 'rent' | null
  bedrooms: number | null
  budget_min: number | null
  budget_max: number | null
  budget_currency: string
  locality: string | null
  city: string | null
  property_type: string | null
  parser: string
  confidence: number
}

export interface RequirementRead {
  id: number
  user_id: number
  raw_text: string
  intent: 'buy' | 'rent' | null
  bedrooms: number | null
  budget_min: number | null
  budget_max: number | null
  budget_currency: string
  locality: string | null
  city: string | null
  property_type: string | null
  parser: string
  confidence: number
}

export async function parseRequirement(text: string): Promise<ParsedRequirement> {
  const response = await fetch(`${apiBaseUrl}/api/v1/requirements/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error(`Parse failed: ${response.status}`)
  }

  const data = await response.json()
  return data.parsed
}

export async function saveRequirement(
  accessToken: string,
  text: string,
  parsed: ParsedRequirement,
): Promise<RequirementRead> {
  const response = await fetch(`${apiBaseUrl}/api/v1/requirements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, parsed }),
  })

  if (!response.ok) {
    throw new Error(`Save failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchLatestRequirement(
  accessToken: string,
): Promise<RequirementRead | null> {
  const response = await fetch(`${apiBaseUrl}/api/v1/requirements/latest`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`)
  }

  return response.json()
}

export interface ApiProperty {
  id: number
  external_id: string
  title: string
  description: string | null
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  bedrooms: number
  bathrooms: number
  square_feet: number | null
  property_type: string
  listing_status: string
  source: string
  source_url: string
}

export interface PropertyListResponse {
  items: ApiProperty[]
  total: number
  page: number
  page_size: number
}

export async function fetchProperties(
  page = 1,
  pageSize = 50,
  params: Omit<PropertyQueryParams, 'page' | 'pageSize'> = {},
): Promise<PropertyListResponse> {
  const url = buildPropertiesUrl(apiBaseUrl, { page, pageSize, ...params })
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Properties fetch failed: ${response.status}`)
  }

  return response.json()
}

export interface MatchedPropertyItem {
  property: ApiProperty
  score: number
  reasons: string[]
}

export interface PropertyMatchResponse {
  items: MatchedPropertyItem[]
  parsed: ParsedRequirement
  total: number
  source: 'database' | 'database+llm' | 'database+relaxed'
  relaxed?: boolean
}

export async function matchProperties(payload: {
  text?: string
  requirement_id?: number
  min_score?: number
  limit?: number
}): Promise<PropertyMatchResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/properties/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Property match failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchProperty(propertyId: number): Promise<ApiProperty> {
  const response = await fetch(`${apiBaseUrl}/api/v1/properties/${propertyId}`)

  if (!response.ok) {
    throw new Error(`Property fetch failed: ${response.status}`)
  }

  return response.json()
}

export interface FavoriteRead {
  id: number
  listing_key: string
  property_id: number | null
  property: ApiProperty | null
  created_at: string
}

export interface FavoriteListResponse {
  items: FavoriteRead[]
  total: number
}

export async function fetchFavorites(accessToken: string): Promise<FavoriteListResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/favorites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Favorites fetch failed: ${response.status}`)
  }

  return response.json()
}

export async function addFavorite(
  accessToken: string,
  payload: { listing_key: string; property_id?: number },
): Promise<FavoriteRead> {
  const response = await fetch(`${apiBaseUrl}/api/v1/favorites`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Add favorite failed: ${response.status}`)
  }

  return response.json()
}

export async function removeFavorite(accessToken: string, listingKey: string): Promise<void> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/favorites?listing_key=${encodeURIComponent(listingKey)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )

  if (!response.ok) {
    throw new Error(`Remove favorite failed: ${response.status}`)
  }
}

export interface InquiryCreatePayload {
  listing_key: string
  property_id?: number
  name: string
  email: string
  phone?: string
  message: string
}

export interface InquiryRead {
  id: number
  listing_key: string
  property_id: number | null
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  created_at: string
}

export async function createInquiry(
  accessToken: string,
  payload: InquiryCreatePayload,
): Promise<InquiryRead> {
  const response = await fetch(`${apiBaseUrl}/api/v1/inquiries`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Inquiry submit failed: ${response.status}`)
  }

  return response.json()
}

export interface UploadTemplate {
  dataset_type: string
  table: string
  columns: string[]
  notes: string[]
}

export interface UploadResponse {
  dataset_type: string
  filename: string
  rows_read: number
  rows_inserted: number
  rows_updated: number
  rows_skipped: number
  errors: string[]
}

export async function fetchUploadTemplate(datasetType: string): Promise<UploadTemplate> {
  const response = await fetch(`${apiBaseUrl}/api/v1/data/upload/templates/${datasetType}`)

  if (response.status === 404) {
    const { getUploadTemplateFallback } = await import('@/data/uploadTemplates')
    const fallback = getUploadTemplateFallback(datasetType)
    if (fallback) {
      return fallback
    }
  }

  if (!response.ok) {
    throw new Error(`Template fetch failed: ${response.status}`)
  }

  return response.json()
}

export async function uploadDataset(
  accessToken: string,
  file: File,
  datasetType: string,
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('dataset_type', datasetType)

  const response = await fetch(`${apiBaseUrl}/api/v1/data/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Upload failed: ${response.status}`)
  }

  return response.json()
}

export interface ScrapeSourceResult {
  source: string
  fetched: number
  parsed: number
  blocked_by_robots: boolean
  errors: string[]
}

export interface ScrapeResponse {
  city: string
  listing_status: string
  rows_read: number
  rows_inserted: number
  rows_updated: number
  rows_skipped: number
  sources: ScrapeSourceResult[]
  errors: string[]
}

export async function scrapeListings(
  accessToken: string,
  payload: {
    sources: string[]
    city: string
    listing_status: 'for_sale' | 'for_rent'
    max_results?: number
  },
): Promise<ScrapeResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/data/scrape`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Scrape failed: ${response.status}`)
  }

  return response.json()
}
