import { useAuth0 } from '@auth0/auth0-react'
import { ArrowLeft, Bath, BedDouble, ExternalLink, GitCompare, Heart, Loader2, MapPin, Maximize2, Phone, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchProperty } from '@/api/client'
import { usePropertyContext } from '@/context/PropertyContext'
import { useCompareContext } from '@/context/CompareContext'
import { AppShell } from '@/components/layout/AppShell'
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import { parseRoutePropertyId, toRoutePropertyId } from '@/lib/listingKeys'
import { mapApiPropertyToListing } from '@/lib/propertyMapper'
import { cn, formatPrice } from '@/lib/utils'
import type { PropertyListing } from '@/types/property'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'

export function PropertyDetailPage() {
  const { propertyId = '' } = useParams()
  const navigate = useNavigate()
  const { findProperty, favorites, toggleFavorite } = usePropertyContext()
  const { isInCompare, toggleCompare, canAddToCompare } = useCompareContext()
  const { user } = useAuth0()

  const [property, setProperty] = useState<PropertyListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contactOpen, setContactOpen] = useState(false)

  const routeParts = useMemo(() => parseRoutePropertyId(propertyId), [propertyId])

  useEffect(() => {
    let cancelled = false

    async function loadProperty() {
      setLoading(true)
      setError(null)

      try {
        if (routeParts.dbId) {
          const apiProperty = await fetchProperty(routeParts.dbId)
          if (!cancelled) {
            setProperty(mapApiPropertyToListing(apiProperty))
          }
          return
        }

        const mockId = routeParts.mockId ?? propertyId
        const cached = findProperty(mockId)
        if (!cancelled) {
          if (cached) {
            setProperty(cached)
          } else {
            setError('Property not found')
          }
        }
      } catch (err) {
        if (!cancelled) {
          const cached = findProperty(routeParts.mockId ?? propertyId)
          if (cached) {
            setProperty(cached)
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load property')
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProperty()
    return () => {
      cancelled = true
    }
  }, [findProperty, propertyId, routeParts.dbId, routeParts.mockId])

  const isFavorite = property ? favorites.has(property.id) : false
  const compareSelected = property ? isInCompare(property.id) : false
  const compareDisabled = property ? !compareSelected && !canAddToCompare : true

  const priceLabel =
    property?.listingStatus === 'rent'
      ? `${formatPrice(property.price, property.currency)}/mo`
      : property
        ? formatPrice(property.price, property.currency)
        : ''

  return (
    <AppShell profileName={user?.name} profilePicture={user?.picture}>
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2 px-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {loading && (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && !loading && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" asChild>
              <Link to="/properties">Browse properties</Link>
            </Button>
          </Card>
        )}

        {property && !loading && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-border">
                <img src={property.imageUrl} alt={property.title} className="aspect-[16/10] w-full object-cover" />
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{property.propertyType}</Badge>
                  <StatusBadge status={property.availability} />
                  <Badge variant="outline">{property.furnishing}</Badge>
                  {property.matchScore != null && (
                    <Badge variant="success">{Math.round(property.matchScore * 100)}% match</Badge>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
                  <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <p className="text-3xl font-bold text-primary">{priceLabel}</p>
                  <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {property.rating.toFixed(1)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 text-center">
                    <BedDouble className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{property.bedrooms} BHK</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Bath className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{property.bathrooms} baths</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Maximize2 className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{property.sqft.toLocaleString()} sqft</p>
                  </Card>
                </div>

                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2" onClick={() => setContactOpen(true)}>
                    <Phone className="h-4 w-4" />
                    Contact agent
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={compareDisabled}
                    onClick={() => property && toggleCompare(property)}
                  >
                    <GitCompare className="h-4 w-4" />
                    {compareSelected ? 'Added to compare' : 'Add to compare'}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => void toggleFavorite(property.id)}
                  >
                    <Heart className={cn('h-4 w-4', isFavorite && 'fill-current text-primary')} />
                    {isFavorite ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                  {property.sourceUrl && (
                    <Button variant="outline" className="gap-2" asChild>
                      <a href={property.sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Source listing
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">About this property</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {property.description ??
                  'A well-located listing with modern amenities, strong connectivity, and flexible viewing options. Contact the agent to schedule a tour or request more details.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Source: {property.source}</span>
                {property.zipCode && <span>Pincode: {property.zipCode}</span>}
                <span>Listing ID: {toRoutePropertyId(property.id)}</span>
              </div>
            </Card>

            {property.matchReasons && property.matchReasons.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold">Why this matched your search</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.matchReasons.map((reason) => (
                    <Badge key={reason} variant="secondary">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      <ContactInquiryModal property={property} open={contactOpen} onOpenChange={setContactOpen} />
    </AppShell>
  )
}
