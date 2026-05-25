import { motion } from 'framer-motion'
import {
  Bath,
  Heart,
  MapPin,
  Maximize2,
  Phone,
  Star,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { PropertyListing } from '@/types'
import {
  getAvailabilityLabel,
  getFurnishingLabel,
  getPropertyTypeLabel,
} from '@/utils/property-search'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PropertyCardProps {
  property: PropertyListing
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  onContact?: (property: PropertyListing) => void
  index?: number
  className?: string
}

const availabilityVariant: Record<
  PropertyListing['availability'],
  'success' | 'secondary' | 'warning' | 'destructive'
> = {
  available: 'success',
  sold: 'destructive',
  rented: 'secondary',
  under_offer: 'warning',
}

export function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
  onContact,
  index = 0,
  className,
}: PropertyCardProps) {
  const priceLabel =
    property.transactionType === 'rent'
      ? `${formatCurrency(property.price)}/mo`
      : formatCurrency(property.price, true)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-elevated',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {property.isFeatured && (
            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
              Featured
            </Badge>
          )}
          {property.isLuxury && (
            <Badge variant="warning" className="backdrop-blur-sm">
              Luxury
            </Badge>
          )}
          <Badge variant={availabilityVariant[property.availability]} className="backdrop-blur-sm">
            {getAvailabilityLabel(property.availability)}
          </Badge>
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite?.(property.id)}
          className={cn(
            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200',
            isFavorite
              ? 'bg-destructive/90 text-white'
              : 'bg-white/90 text-foreground hover:bg-white hover:scale-110 dark:bg-black/50 dark:text-white',
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save property'}
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0">
            {property.bhk} BHK · {getPropertyTypeLabel(property.propertyType)}
          </Badge>
          <div className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {property.rating}
            <span className="text-white/70">({property.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
            {property.title}
          </h3>
        </div>

        <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {property.locality}, {property.city}
          </span>
        </div>

        <p className="mb-3 text-xl font-bold tracking-tight text-primary">{priceLabel}</p>

        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5" />
            {property.area} sq.ft.
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" />
            {getFurnishingLabel(property.furnishing)}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          {property.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {a}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{property.amenities.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onContact?.(property)}
          >
            View Details
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => onContact?.(property)}>
            <Phone className="h-3.5 w-3.5" />
            Contact
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
