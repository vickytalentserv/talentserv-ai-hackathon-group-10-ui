import { MapPin, Star } from 'lucide-react'
import type { PropertyListing } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  getAvailabilityLabel,
  getFurnishingLabel,
  getPropertyTypeLabel,
} from '@/utils/property-search'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface PropertyDetailModalProps {
  property: PropertyListing | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PropertyDetailModal({
  property,
  open,
  onOpenChange,
}: PropertyDetailModalProps) {
  if (!property) return null

  const priceLabel =
    property.transactionType === 'rent'
      ? `${formatCurrency(property.price)}/month`
      : formatCurrency(property.price)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">{property.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-1 flex items-center gap-1 text-sm text-white/90">
              <MapPin className="h-4 w-4" />
              {property.locality}, {property.city}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-2xl font-bold text-primary">{priceLabel}</p>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{property.rating}</span>
              <span className="text-sm text-muted-foreground">({property.reviewCount} reviews)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{property.bhk} BHK</Badge>
            <Badge variant="secondary">{getPropertyTypeLabel(property.propertyType)}</Badge>
            <Badge variant="outline">{getFurnishingLabel(property.furnishing)}</Badge>
            <Badge variant="outline">{getAvailabilityLabel(property.availability)}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">{property.description}</p>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <DetailItem label="Area" value={`${property.area} sq.ft.`} />
            <DetailItem label="Builder" value={property.builder} />
            <DetailItem label="Source" value={property.source} />
            <DetailItem label="Status" value={property.status.replace('_', ' ')} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <span key={a} className="rounded-lg bg-muted px-3 py-1 text-xs font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1">Contact Agent</Button>
            <Button variant="outline" className="flex-1">Schedule Visit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  )
}
