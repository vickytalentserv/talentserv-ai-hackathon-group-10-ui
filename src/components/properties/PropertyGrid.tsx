import { SearchX } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertyEmptyState } from '@/components/properties/PropertyEmptyState'
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton'

interface PropertyGridProps {
  properties: PropertyListing[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void | Promise<void>
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  showMatchDetails?: boolean
  onContactProperty?: (property: PropertyListing) => void
  onViewProperty?: (property: PropertyListing) => void
}

export function PropertyGrid({
  properties,
  favorites,
  onToggleFavorite,
  loading = false,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your search or filters to see more listings.',
  showMatchDetails = false,
  onContactProperty,
  onViewProperty,
}: PropertyGridProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
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
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={favorites.has(property.id)}
          onToggleFavorite={onToggleFavorite}
          index={index}
          showMatchDetails={showMatchDetails}
          onContact={onContactProperty}
          onViewDetails={onViewProperty}
        />
      ))}
    </div>
  )
}
