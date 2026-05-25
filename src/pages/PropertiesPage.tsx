import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { usePropertyFilters, useProperties } from '@/hooks/use-properties'
import { PropertyFiltersBar } from '@/components/properties/PropertyFilters'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { PropertyDetailModal } from '@/components/properties/PropertyDetailModal'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PropertyListing } from '@/types'

export function PropertiesPage() {
  const { toggleFavorite, isFavorite, favorites } = useProperties()
  const {
    filters,
    updateFilter,
    resetFilters,
    paginated,
    filtered,
    page,
    setPage,
    totalPages,
    totalCount,
  } = usePropertyFilters()

  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const savedProperties = filtered.filter((p) => favorites.has(p.id))

  const handleContact = (property: PropertyListing) => {
    setSelectedProperty(property)
    setModalOpen(true)
  }

  const handleFavorite = (id: string) => {
    const wasFavorite = isFavorite(id)
    toggleFavorite(id)
    toast.success(wasFavorite ? 'Removed from saved' : 'Property saved!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Properties</h2>
        <p className="text-sm text-muted-foreground">
          Browse {totalCount} listings across apartments, villas, and luxury homes
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="saved" className="gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Saved ({favorites.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-6">
          <PropertyFiltersBar
            filters={filters}
            onUpdate={updateFilter}
            onReset={resetFilters}
            totalCount={totalCount}
          />

          <PropertyGrid
            properties={paginated}
            isFavorite={isFavorite}
            onToggleFavorite={handleFavorite}
            onContact={handleContact}
            columns={3}
            emptyTitle="No properties match your filters"
            emptyDescription="Try clearing filters or using a different search query."
          />

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6 space-y-6">
          {savedProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <Heart className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium">No saved properties yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click the heart icon on any property to save it here.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                Browse all properties
              </Button>
            </div>
          ) : (
            <PropertyGrid
              properties={savedProperties}
              isFavorite={isFavorite}
              onToggleFavorite={handleFavorite}
              onContact={handleContact}
              columns={3}
            />
          )}
        </TabsContent>
      </Tabs>

      <PropertyDetailModal
        property={selectedProperty}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
