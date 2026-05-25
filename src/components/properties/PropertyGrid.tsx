import { PropertyCard, PropertyCardSkeleton } from '@/components/properties/PropertyCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Search } from 'lucide-react'
import type { PropertyListing } from '@/types'

interface PropertyGridProps {
  properties: PropertyListing[]
  isLoading?: boolean
  isFavorite?: (id: string) => boolean
  onToggleFavorite?: (id: string) => void
  onContact?: (property: PropertyListing) => void
  emptyTitle?: string
  emptyDescription?: string
  columns?: 2 | 3 | 4
}

export function PropertyGrid({
  properties,
  isLoading = false,
  isFavorite,
  onToggleFavorite,
  onContact,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your search or filters to find more listings.',
  columns = 3,
}: PropertyGridProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (isLoading) {
    return (
      <div className={`grid gap-5 ${gridCols[columns]}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-6 w-6" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className={`grid gap-5 ${gridCols[columns]}`}>
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          index={index}
          isFavorite={isFavorite?.(property.id)}
          onToggleFavorite={onToggleFavorite}
          onContact={onContact}
        />
      ))}
    </div>
  )
}
