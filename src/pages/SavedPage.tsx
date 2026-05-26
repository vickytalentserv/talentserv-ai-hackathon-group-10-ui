import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePropertyContext } from '@/context/PropertyContext'
import { AppShell } from '@/components/layout/AppShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import { PropertyEmptyState } from '@/components/properties/PropertyEmptyState'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { toRoutePropertyId } from '@/lib/listingKeys'
import type { PropertyListing } from '@/types/property'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function SavedPage() {
  const navigate = useNavigate()
  const { savedProperties, favorites, favoritesLoaded, toggleFavorite } = usePropertyContext()
  const [contactProperty, setContactProperty] = useState<PropertyListing | null>(null)

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Your shortlist
            </span>
          }
          title="Saved properties"
          description={
            favoritesLoaded
              ? `${savedProperties.length} properties saved to your account`
              : 'Loading your shortlist…'
          }
          actions={
            favoritesLoaded && savedProperties.length > 0 ? (
              <Badge variant="secondary">{savedProperties.length} saved</Badge>
            ) : undefined
          }
        />

        {!favoritesLoaded ? (
          <PropertyGrid properties={[]} favorites={favorites} onToggleFavorite={toggleFavorite} loading />
        ) : savedProperties.length === 0 ? (
          <PropertyEmptyState
            icon={Heart}
            title="No shortlisted properties yet"
            description="Tap the heart on any listing to save it here. Your shortlist stays linked to your account until you remove it."
            action={
              <Button asChild>
                <Link to="/properties">Browse properties</Link>
              </Button>
            }
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
