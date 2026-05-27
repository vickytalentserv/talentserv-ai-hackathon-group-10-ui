import { SearchX } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertyEmptyState } from '@/components/properties/PropertyEmptyState'
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton'

/** Shared grid layout — max 3 cards per row on desktop with generous spacing */
export const PROPERTY_GRID_CLASS =
  'grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'

interface PropertyGridProps {
  properties: PropertyListing[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void | Promise<void>
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  showMatchDetails?: boolean
  showCompareAction?: boolean
  onContactProperty?: (property: PropertyListing) => void
  onViewProperty?: (property: PropertyListing) => void
}

const SKELETON_COUNT = 8

export function PropertyGrid({
  properties,
  favorites,
  onToggleFavorite,
  loading = false,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your search or filters to see more listings.',
  showMatchDetails = false,
  showCompareAction = false,
  onContactProperty,
  onViewProperty,
}: PropertyGridProps) {
  if (loading) {
    return (
      <div className={PROPERTY_GRID_CLASS}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <PropertyEmptyState
        icon={SearchX}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className={PROPERTY_GRID_CLASS}>
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={favorites.has(property.id)}
          onToggleFavorite={onToggleFavorite}
          index={index}
          showMatchDetails={showMatchDetails}
          showCompareAction={showCompareAction}
          onContact={onContactProperty}
          onViewDetails={onViewProperty}
        />
      ))}
    </div>
  )
}
