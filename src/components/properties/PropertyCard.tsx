import { motion } from 'framer-motion'
import { Bath, BedDouble, GitCompare, Heart, MapPin, Maximize2, Phone, Star } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import { useCompareContext } from '@/context/CompareContext'
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
  size?: 'default' | 'large'
  showMatchDetails?: boolean
  showCompareAction?: boolean
  onContact?: (property: PropertyListing) => void
  onViewDetails?: (property: PropertyListing) => void
}

export function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  size = 'default',
  showMatchDetails = false,
  showCompareAction = false,
  onContact,
  onViewDetails,
}: PropertyCardProps) {
  const isLarge = size === 'large'
  const { isInCompare, toggleCompare, canAddToCompare } = useCompareContext()
  const compareSelected = isInCompare(property.id)
  const compareDisabled = !compareSelected && !canAddToCompare
  const priceLabel =
    property.listingStatus === 'rent'
      ? `${formatPrice(property.price, property.currency)}/mo`
      : formatPrice(property.price, property.currency)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={cn(
          'group h-full overflow-hidden border-border/80 transition-shadow hover:shadow-xl',
          isLarge && 'shadow-md',
          compareSelected && showCompareAction && 'ring-2 ring-primary',
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden',
            isLarge ? 'aspect-[4/3] min-h-[240px] sm:min-h-[320px]' : 'aspect-[16/10]',
          )}
        >
          <img
            src={property.imageUrl}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className={cn('absolute left-3 top-3 flex flex-wrap gap-2', isLarge && 'left-4 top-4 gap-2.5')}>
            <Badge variant="secondary" className="bg-background/90 backdrop-blur">
              {property.propertyType}
            </Badge>
            <StatusBadge status={property.availability} />
          </div>
          <div className={cn('absolute right-3 top-3 flex gap-2', isLarge && 'right-4 top-4')}>
            <button
              type="button"
              aria-label={isFavorite ? 'Remove from shortlist' : 'Add to shortlist'}
              className={cn(
                'flex items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50',
                isLarge ? 'h-11 w-11' : 'h-9 w-9',
                isFavorite && 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
              onClick={() => void onToggleFavorite(property.id)}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-current', isLarge && 'h-5 w-5')} />
            </button>
          </div>
          <div
            className={cn(
              'absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2',
              isLarge && 'bottom-4 left-4 right-4',
            )}
          >
            <p className={cn('font-bold text-white drop-shadow', isLarge ? 'text-2xl sm:text-3xl' : 'text-lg')}>
              {priceLabel}
            </p>
            <div
              className={cn(
                'flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 font-medium text-white backdrop-blur',
                isLarge ? 'px-3 py-1.5 text-sm' : 'text-xs',
              )}
            >
              <Star className={cn('fill-amber-400 text-amber-400', isLarge ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
              {property.rating.toFixed(1)}
            </div>
          </div>
        </div>

        <div className={cn('flex flex-col gap-4', isLarge ? 'gap-5 p-6' : 'p-4')}>
          <div className="space-y-1.5">
            <h3
              className={cn(
                'line-clamp-2 font-semibold leading-snug',
                isLarge ? 'text-xl sm:text-2xl' : 'text-base',
              )}
            >
              {property.title}
            </h3>
            <p
              className={cn(
                'flex items-center gap-1.5 text-muted-foreground',
                isLarge ? 'text-base' : 'text-sm',
              )}
            >
              <MapPin className={cn('shrink-0', isLarge ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
              <span className="line-clamp-1">{property.location}</span>
            </p>
          </div>

          <div
            className={cn(
              'flex flex-wrap items-center gap-3 text-muted-foreground',
              isLarge ? 'gap-4 text-base' : 'text-sm',
            )}
          >
            <span className="inline-flex items-center gap-1">
              <BedDouble className={cn(isLarge ? 'h-5 w-5' : 'h-4 w-4')} />
              {property.bedrooms} BHK
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className={cn(isLarge ? 'h-5 w-5' : 'h-4 w-4')} />
              {property.bathrooms}
            </span>
            <span className="inline-flex items-center gap-1">
              <Maximize2 className={cn(isLarge ? 'h-5 w-5' : 'h-4 w-4')} />
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

          <div className="mt-auto flex flex-col gap-2 pt-1">
            {showCompareAction && (
              <Button
                variant={compareSelected ? 'default' : 'outline'}
                size={isLarge ? 'default' : 'sm'}
                className="w-full"
                disabled={compareDisabled}
                onClick={() => toggleCompare(property)}
              >
                <GitCompare className="h-4 w-4" />
                {compareSelected ? 'Added to compare' : 'Add to compare'}
              </Button>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" size={isLarge ? 'default' : 'sm'} onClick={() => onContact?.(property)}>
                <Phone className="h-4 w-4" />
                Contact
              </Button>
              <Button
                variant="outline"
                size={isLarge ? 'default' : 'sm'}
                className="flex-1"
                onClick={() => onViewDetails?.(property)}
              >
                View details
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.article>
  )
}
