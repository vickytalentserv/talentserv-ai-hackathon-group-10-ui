import { GitCompare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PropertyCompareCharts } from '@/components/compare/PropertyCompareCharts'
import { PropertyCompareTable } from '@/components/compare/PropertyCompareTable'
import { AppShell } from '@/components/layout/AppShell'
import { useCompareContext } from '@/context/CompareContext'
import { MAX_COMPARE_COUNT, MIN_COMPARE_COUNT } from '@/lib/propertyCompare'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ComparePage() {
  const { compareList, compareCount, removeFromCompare, clearCompare } = useCompareContext()
  const ready = compareCount >= MIN_COMPARE_COUNT

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <GitCompare className="h-5 w-5" />
              <span className="text-sm font-medium">Property comparison</span>
              {compareCount > 0 && <Badge variant="secondary">{compareCount} selected</Badge>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Compare properties</h1>
            <p className="mt-1 text-muted-foreground">
              Column charts and detailed comparison for price, locality, builder, area, and amenities.
            </p>
          </div>
          {compareCount > 0 && (
            <Button variant="ghost" onClick={clearCompare}>
              Clear selection
            </Button>
          )}
        </div>

        {!ready ? (
          <Card className="flex flex-col items-center gap-4 p-10 text-center">
            <GitCompare className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                {compareCount === 0
                  ? 'No properties selected yet'
                  : `Add ${MIN_COMPARE_COUNT - compareCount} more property to compare`}
              </h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                Go to the Properties page, filter listings, and use <strong>Add to compare</strong>{' '}
                on any card. You can select up to {MAX_COMPARE_COUNT} properties, then return here
                for graphs and side-by-side analysis.
              </p>
            </div>
            <Button asChild>
              <Link to="/properties">Browse & filter properties</Link>
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex flex-wrap gap-2">
                {compareList.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 pr-3"
                  >
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{property.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{property.location}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-8 px-2"
                      onClick={() => removeFromCompare(property.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link to="/properties">Add more from filters</Link>
                </Button>
              </div>
            </Card>

            <PropertyCompareCharts properties={compareList} />
            <PropertyCompareTable properties={compareList} />
          </>
        )}
      </div>
    </AppShell>
  )
}
