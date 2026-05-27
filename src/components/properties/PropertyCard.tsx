import { motion } from 'framer-motion'
import { Bath, BedDouble, GitCompare, Heart, MapPin, Maximize2, Phone, Star } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import { useCompareContext } from '@/context/CompareContext'
import { cn, formatListingPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'

interface PropertyCardProps {
  property: PropertyListing
  isFavorite: boolean
  onToggleFavorite: (id: string) => void | Promise<void>
  index?: number
  showMatchDetails?: boolean
  showCompareAction?: boolean
  onContact?: (property: PropertyListing) => void
  onViewDetails?: (property: PropertyListing) => void
}

function formatPropertyType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
}

export function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  index = 0,
  showMatchDetails = false,
  showCompareAction = false,
  onContact,
  onViewDetails,
}: PropertyCardProps) {
  const { isInCompare, toggleCompare, canAddToCompare } = useCompareContext()
  const compareSelected = isInCompare(property.id)
  const compareDisabled = !compareSelected && !canAddToCompare
  const priceLabel = formatListingPrice(property.price, property.listingStatus, property.currency)

  const typeLabel = formatPropertyType(property.propertyType)

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="h-full"
    >
      <Card
        className={cn(
          'property-card-hover group flex h-full flex-col overflow-hidden border-border/80',
          compareSelected && showCompareAction && 'ring-2 ring-primary/30',
        )}
      >
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-muted">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(224_56%_16%/0.75)] via-[hsl(224_56%_16%/0.15)] to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge className="border-0 bg-highlight text-highlight-foreground shadow-soft">Featured</Badge>
            {(property.propertyType === 'villa' || property.price >= 1_50_00_000) && (
              <Badge variant="warning" className="border-0 shadow-soft">
                Luxury
              </Badge>
            )}
            <StatusBadge status={property.availability} />
          </div>

          <button
            type="button"
            aria-label={isFavorite ? 'Remove from shortlist' : 'Add to shortlist'}
            className={cn(
              'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-soft transition-colors',
              isFavorite
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-muted-foreground hover:text-primary',
            )}
            onClick={() => void onToggleFavorite(property.id)}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="rounded-md bg-black/30 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
              {property.bedrooms} BHK · {typeLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold text-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {property.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-highlight">
              {property.title}
            </h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </p>
          </div>

          <p className="text-lg font-bold text-primary">{priceLabel}</p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {property.sqft.toLocaleString()} sqft
            </span>
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms} BHK
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms} bath
            </span>
            <span className="capitalize">{property.furnishing.replace('-', ' ')}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {amenity}
              </span>
            ))}
            {showMatchDetails && property.matchScore != null && (
              <Badge variant="accent" className="text-[11px]">
                {Math.round(property.matchScore * 100)}% match
              </Badge>
            )}
          </div>

          <div className="mt-auto space-y-2 border-t border-border pt-3">
            {showCompareAction && (
              <Button
                variant={compareSelected ? 'highlight' : 'outline'}
                size="sm"
                className="h-8 w-full text-xs"
                disabled={compareDisabled}
                onClick={() => toggleCompare(property)}
              >
                <GitCompare className="h-3.5 w-3.5" />
                {compareSelected ? 'In compare list' : 'Add to compare'}
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 flex-1 text-xs"
                onClick={() => onViewDetails?.(property)}
              >
                View Details
              </Button>
              <Button variant="default" size="sm" className="h-9 flex-1 text-xs" onClick={() => onContact?.(property)}>
                <Phone className="h-3.5 w-3.5" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.article>
  )
}
