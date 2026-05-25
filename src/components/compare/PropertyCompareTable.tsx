import { ArrowLeftRight } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import { buildMultiCompareRows, shortPropertyName, summarizeMultiCompare } from '@/lib/propertyCompare'
import { formatPrice } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface PropertyCompareTableProps {
  properties: PropertyListing[]
}

export function PropertyCompareTable({ properties }: PropertyCompareTableProps) {
  const rows = buildMultiCompareRows(properties)
  const summary = summarizeMultiCompare(properties)
  const columnTemplate = `minmax(140px,1fr) repeat(${properties.length}, minmax(160px, 1fr))`

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
          <ArrowLeftRight className="h-4 w-4" />
          Quick summary
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {summary.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <div
          className="grid min-w-[720px] border-b border-border bg-muted/40 text-sm font-semibold"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="p-4">Attribute</div>
          {properties.map((property, index) => (
            <div key={property.id} className="border-l border-border p-4">
              Property {String.fromCharCode(65 + index)}
            </div>
          ))}
        </div>

        <div
          className="grid min-w-[720px] border-b border-border"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="p-4 text-sm font-medium text-muted-foreground">Preview</div>
          {properties.map((property, index) => (
            <div key={property.id} className="border-l border-border p-4">
              <img
                src={property.imageUrl}
                alt={property.title}
                className="mb-3 aspect-[4/3] w-full rounded-xl object-cover"
              />
              <p className="font-semibold leading-snug">{shortPropertyName(property, index)}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{property.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{property.location}</p>
              <p className="mt-2 text-lg font-bold text-primary">
                {property.listingStatus === 'rent'
                  ? `${formatPrice(property.price, property.currency)}/mo`
                  : formatPrice(property.price, property.currency)}
              </p>
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div
            key={row.label}
            className="grid min-w-[720px] border-b border-border last:border-b-0"
            style={{ gridTemplateColumns: columnTemplate }}
          >
            <div className="flex flex-col justify-center gap-1 p-4">
              <span className="text-sm font-medium">{row.label}</span>
              {row.hint && <span className="text-xs text-muted-foreground">{row.hint}</span>}
            </div>
            {row.values.map((value, index) => (
              <div key={`${row.label}-${index}`} className="border-l border-border p-4 text-sm">
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
