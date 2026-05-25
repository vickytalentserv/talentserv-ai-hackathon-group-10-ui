import type { ApiProperty } from '@/api/client'
import { MOCK_PROPERTIES } from '@/data/mockProperties'
import { toListingKey } from '@/lib/listingKeys'
import type { PropertyListing } from '@/types/property'

const imagePool = MOCK_PROPERTIES.map((p) => p.imageUrl)

function pickImage(id: number): string {
  return imagePool[id % imagePool.length] ?? imagePool[0]
}

function extractLocality(address: string): string | null {
  const parts = address.split(',').map((part) => part.trim())
  if (parts.length >= 2) {
    return parts[parts.length - 1]
  }
  return null
}

export function mapApiPropertyToListing(property: ApiProperty, index = 0): PropertyListing {
  const furnishingOptions = ['furnished', 'semi-furnished', 'unfurnished'] as const
  const { listingKey } = toListingKey(`api-${property.id}`)
  const locality = extractLocality(property.address)

  return {
    id: `api-${property.id}`,
    title: property.title,
    location: locality ? `${locality}, ${property.city}` : `${property.address}, ${property.city}`,
    city: property.city,
    locality,
    state: property.state,
    price: Number(property.price),
    currency: 'INR',
    bedrooms: property.bedrooms,
    bathrooms: Number(property.bathrooms),
    sqft: property.square_feet ?? 1000,
    propertyType: property.property_type,
    furnishing: furnishingOptions[index % furnishingOptions.length],
    amenities: ['Parking', 'Security'],
    availability: 'available',
    rating: 4.2 + (index % 8) * 0.1,
    imageUrl: pickImage(property.id),
    listingStatus: property.listing_status === 'for_rent' ? 'rent' : 'buy',
    source: property.source,
    description: property.description,
    sourceUrl: property.source_url,
    zipCode: property.zip_code,
    listingKey,
  }
}

export function mapMatchedItemToListing(
  item: { property: ApiProperty; score: number; reasons: string[] },
  index: number,
): PropertyListing {
  return {
    ...mapApiPropertyToListing(item.property, index),
    matchScore: item.score,
    matchReasons: item.reasons,
  }
}

export function mergeProperties(apiItems: ApiProperty[]): PropertyListing[] {
  const mapped = apiItems.map(mapApiPropertyToListing)
  const existingIds = new Set(mapped.map((p) => p.city + p.title))
  const extras = MOCK_PROPERTIES.filter((p) => !existingIds.has(p.city + p.title))
  return [...mapped, ...extras]
}
