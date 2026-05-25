import { motion } from 'framer-motion'
import { Bath, BedDouble, Heart, MapPin, Maximize2, Phone, Star } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import { cn, formatPrice } from '@/lib/utils'
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
  onContact?: (property: PropertyListing) => void
  onViewDetails?: (property: PropertyListing) => void
}

export function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  index = 0,
  showMatchDetails = false,
  onContact,
  onViewDetails,
}: PropertyCardProps) {
  const priceLabel =
    property.listingStatus === 'rent'
      ? `${formatPrice(property.price, property.currency)}/mo`
      : formatPrice(property.price, property.currency)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group h-full overflow-hidden border-border/80 transition-shadow hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur">
              {property.propertyType}
            </Badge>
            <StatusBadge status={property.availability} />
          </div>
          <button
            type="button"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save property'}
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50',
              isFavorite && 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
            onClick={() => void onToggleFavorite(property.id)}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <p className="text-lg font-bold text-white drop-shadow">{priceLabel}</p>
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {property.rating.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="space-y-1.5">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug">{property.title}</h3>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              {property.bedrooms} BHK
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {property.bathrooms}
            </span>
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-4 w-4" />
              {property.sqft.toLocaleString()} sqft
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{property.furnishing}</Badge>
            {showMatchDetails && property.matchScore != null && (
              <Badge variant="success">{Math.round(property.matchScore * 100)}% match</Badge>
            )}
            {property.amenities.slice(0, 2).map((amenity) => (
              <Badge key={amenity} variant="outline">
                {amenity}
              </Badge>
            ))}
          </div>

          {showMatchDetails && property.matchReasons && property.matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {property.matchReasons.slice(0, 3).map((reason) => (
                <Badge key={reason} variant="secondary" className="text-[11px] font-normal">
                  {reason}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto flex gap-2 pt-1">
            <Button className="flex-1" size="sm" onClick={() => onContact?.(property)}>
              <Phone className="h-4 w-4" />
              Contact
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails?.(property)}>
              View details
            </Button>
          </div>
        </div>
      </Card>
    </motion.article>
  )
}
