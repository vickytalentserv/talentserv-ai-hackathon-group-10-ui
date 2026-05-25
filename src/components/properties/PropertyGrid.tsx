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
  variant?: 'default' | 'large'
  emptyTitle?: string
  emptyDescription?: string
  showMatchDetails?: boolean
  showCompareAction?: boolean
  onContactProperty?: (property: PropertyListing) => void
  onViewProperty?: (property: PropertyListing) => void
}

export function PropertyGrid({
  properties,
  favorites,
  onToggleFavorite,
  loading = false,
  variant = 'default',
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your search or filters to see more listings.',
  showMatchDetails = false,
  showCompareAction = false,
  onContactProperty,
  onViewProperty,
}: PropertyGridProps) {
  const isLarge = variant === 'large'
  const gridClass = isLarge
    ? 'grid gap-8 md:grid-cols-2'
    : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
  const skeletonCount = isLarge ? 4 : 6

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <PropertyCardSkeleton key={index} size={variant} />
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
    <div className={gridClass}>
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={favorites.has(property.id)}
          onToggleFavorite={onToggleFavorite}
          index={index}
          size={variant}
          showMatchDetails={showMatchDetails}
          showCompareAction={showCompareAction}
          onContact={onContactProperty}
          onViewDetails={onViewProperty}
        />
      ))}
    </div>
  )
}
