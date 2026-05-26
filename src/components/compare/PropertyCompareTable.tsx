import { ArrowLeftRight } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import { buildMultiCompareRows, shortPropertyName, summarizeMultiCompare } from '@/lib/propertyCompare'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface PropertyCompareTableProps {
  properties: PropertyListing[]
}

export function PropertyCompareTable({ properties }: PropertyCompareTableProps) {
  const rows = buildMultiCompareRows(properties)
  const summary = summarizeMultiCompare(properties)
  const columnTemplate = `minmax(148px,1fr) repeat(${properties.length}, minmax(168px, 1fr))`

  return (
    <div className="space-y-6">
      <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeftRight className="h-4 w-4" />
            Quick summary
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {summary.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {line}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-card">
        <div className="relative min-w-[720px]">
          <div
            className="sticky top-0 z-10 grid border-b border-border bg-muted/80 text-sm font-semibold backdrop-blur-md"
            style={{ gridTemplateColumns: columnTemplate }}
          >
            <div className="p-4">Attribute</div>
            {properties.map((property, index) => (
              <div key={property.id} className="border-l border-border/80 p-4">
                Property {String.fromCharCode(65 + index)}
              </div>
            ))}
          </div>

          <div
            className="grid border-b border-border/80 bg-muted/20"
            style={{ gridTemplateColumns: columnTemplate }}
          >
            <div className="p-4 text-sm font-medium text-muted-foreground">Preview</div>
            {properties.map((property, index) => (
              <div key={property.id} className="border-l border-border/80 p-4">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="mb-3 aspect-[4/3] w-full rounded-xl object-cover shadow-soft"
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

          {rows.map((row, rowIndex) => (
            <div
              key={row.label}
              className={cn(
                'grid border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/30',
                rowIndex % 2 === 0 && 'bg-background',
              )}
              style={{ gridTemplateColumns: columnTemplate }}
            >
              <div className="flex flex-col justify-center gap-1 p-4">
                <span className="text-sm font-medium">{row.label}</span>
                {row.hint && <span className="text-xs text-muted-foreground">{row.hint}</span>}
              </div>
              {row.values.map((value, index) => (
                <div
                  key={`${row.label}-${index}`}
                  className="border-l border-border/60 p-4 text-sm leading-relaxed"
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
