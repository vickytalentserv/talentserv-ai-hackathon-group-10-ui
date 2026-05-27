import { GitCompare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PropertyCompareCharts } from '@/components/compare/PropertyCompareCharts'
import { PropertyCompareTable } from '@/components/compare/PropertyCompareTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { Section } from '@/components/layout/Section'
import { AppShell } from '@/components/layout/AppShell'
import { useCompareContext } from '@/context/CompareContext'
import { MAX_COMPARE_COUNT, MIN_COMPARE_COUNT } from '@/lib/propertyCompare'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ComparePage() {
  const { compareList, compareCount, removeFromCompare, clearCompare } = useCompareContext()
  const ready = compareCount >= MIN_COMPARE_COUNT

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow={
            <div className="flex items-center gap-2 text-primary">
              <GitCompare className="h-4 w-4" />
              <span className="text-sm font-medium">Property comparison</span>
              {compareCount > 0 && <Badge variant="secondary">{compareCount} selected</Badge>}
            </div>
          }
          title="Compare properties"
          description="Clear charts and side-by-side details for price, area, ratings, and amenities."
          actions={
            compareCount > 0 ? (
              <Button variant="outline" onClick={clearCompare}>
                Clear selection
              </Button>
            ) : undefined
          }
        />

        {!ready ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                <GitCompare className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                  {compareCount === 0
                    ? 'No properties selected yet'
                    : `Add ${MIN_COMPARE_COUNT - compareCount} more property to compare`}
                </h2>
                <p className="max-w-lg text-sm text-muted-foreground">
                  Go to the Properties page, filter listings, and use <strong>Add to compare</strong>{' '}
                  on any card. You can select up to {MAX_COMPARE_COUNT} properties, then return here
                  for charts and side-by-side analysis.
                </p>
              </div>
              <Button asChild>
                <Link to="/properties">Browse & filter properties</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {compareList.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/30 p-2 pr-3 transition-colors hover:bg-muted/50"
                    >
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="h-12 w-12 rounded-lg object-cover shadow-soft"
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
              </CardContent>
            </Card>

            <Section title="Visual comparison" description="Score charts and key metric columns">
              <PropertyCompareCharts properties={compareList} />
            </Section>

            <Section title="Detailed breakdown" description="Side-by-side attribute comparison">
              <PropertyCompareTable properties={compareList} />
            </Section>
          </>
        )}
      </div>
    </AppShell>
  )
}
