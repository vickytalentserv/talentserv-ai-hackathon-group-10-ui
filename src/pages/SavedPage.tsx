import { Heart } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePropertyContext } from '@/context/PropertyContext'
import { AppShell } from '@/components/layout/AppShell'
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import { PropertyEmptyState } from '@/components/properties/PropertyEmptyState'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { toRoutePropertyId } from '@/lib/listingKeys'
import type { PropertyListing } from '@/types/property'

export function SavedPage() {
  const navigate = useNavigate()
  const { savedProperties, favorites, favoritesLoaded, toggleFavorite } = usePropertyContext()
  const [contactProperty, setContactProperty] = useState<PropertyListing | null>(null)

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shortlisted properties</h1>
          <p className="mt-1 text-muted-foreground">
            {favoritesLoaded
              ? `${savedProperties.length} properties saved to your account`
              : 'Loading your shortlist…'}
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
            title="No shortlisted properties yet"
            description="Tap the heart on any listing to save it here. Your shortlist stays linked to your account until you remove it."
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
