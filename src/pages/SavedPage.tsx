import { Heart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_PROPERTIES } from '@/data/mockProperties'
import { usePropertyContext } from '@/context/PropertyContext'
import { AppShell } from '@/components/layout/AppShell'
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import { PropertyEmptyState } from '@/components/properties/PropertyEmptyState'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { toRoutePropertyId } from '@/lib/listingKeys'
import type { PropertyListing } from '@/types/property'

export function SavedPage() {
  const navigate = useNavigate()
  const { properties, favorites, favoritesLoaded, toggleFavorite } = usePropertyContext()
  const [contactProperty, setContactProperty] = useState<PropertyListing | null>(null)

  const savedProperties = useMemo(() => {
    const fromCatalog = properties.filter((property) => favorites.has(property.id))
    const catalogIds = new Set(fromCatalog.map((property) => property.id))
    const fromMocks = MOCK_PROPERTIES.filter(
      (property) => favorites.has(property.id) && !catalogIds.has(property.id),
    )
    return [...fromCatalog, ...fromMocks]
  }, [properties, favorites])

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Saved properties</h1>
          <p className="mt-1 text-muted-foreground">
            {favoritesLoaded
              ? `${savedProperties.length} properties saved to your account`
              : 'Loading your saved listings…'}
          </p>
        </div>

        {!favoritesLoaded ? (
          <PropertyGrid
            properties={[]}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            loading
          />
        ) : savedProperties.length === 0 ? (
          <PropertyEmptyState
            icon={Heart}
            title="No saved properties yet"
            description="Tap the heart icon on any listing to save it here. Favorites sync across sessions when you are signed in."
          />
        ) : (
          <PropertyGrid
            properties={savedProperties}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onContactProperty={setContactProperty}
            onViewProperty={(property) => navigate(`/properties/${toRoutePropertyId(property.id)}`)}
          />
        )}
      </div>

      <ContactInquiryModal
        property={contactProperty}
        open={contactProperty != null}
        onOpenChange={(open) => {
          if (!open) {
            setContactProperty(null)
          }
        }}
      />
    </AppShell>
  )
}
