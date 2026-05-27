export type ListingIntent = 'buy' | 'rent'
export type FurnishingStatus = 'furnished' | 'unfurnished' | 'semi-furnished'
export type AvailabilityStatus = 'available' | 'sold' | 'rented'

export interface PropertyListing {
  id: string
  title: string
  location: string
  city: string
  locality: string | null
  state: string
  price: number
  currency: 'USD' | 'INR'
  bedrooms: number
  bathrooms: number
  sqft: number
  propertyType: string
  furnishing: FurnishingStatus
  amenities: string[]
  availability: AvailabilityStatus
  rating: number
  imageUrl: string
  listingStatus: ListingIntent
  source: string
  isFavorite?: boolean
  matchScore?: number
  matchReasons?: string[]
  listingKey?: string
  description?: string | null
  sourceUrl?: string | null
  zipCode?: string | null
}

export interface PropertyFilters {
  search: string
  city: string
  propertyType: string
  furnishing: string
  listingStatus: string
  sort: 'price-asc' | 'price-desc' | 'rating-desc' | 'newest'
}

export interface DashboardStats {
  totalListed: number
  soldOrRented: number
  trendingLocation: string
  categories: { label: string; count: number }[]
}
