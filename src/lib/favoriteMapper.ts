import type { FavoriteRead } from '@/api/client'
import { MOCK_PROPERTIES } from '@/data/mockProperties'
import { fromListingKey } from '@/lib/listingKeys'
import { mapApiPropertyToListing } from '@/lib/propertyMapper'
import type { PropertyListing } from '@/types/property'

export function mapFavoriteItemsToListings(items: FavoriteRead[]): PropertyListing[] {
  const listings: PropertyListing[] = []

  items.forEach((item, index) => {
    if (item.property) {
      listings.push(mapApiPropertyToListing(item.property, index))
      return
    }

    const propertyId = fromListingKey(item.listing_key)
    const mock = MOCK_PROPERTIES.find((property) => property.id === propertyId)
    if (mock) {
      listings.push(mock)
    }
  })

  return listings
}
