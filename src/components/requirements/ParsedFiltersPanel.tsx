import type { ParsedRequirement } from '@/api/client'
import { formatBudget } from '@/utils/requirements'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ParsedFiltersPanelProps {
  parsed: ParsedRequirement
  saved?: boolean
}

function formatValue(value: string | number | null | undefined): string {
  if (value == null || value === '') {
    return '—'
  }
  return String(value)
}

export function ParsedFiltersPanel({ parsed, saved }: ParsedFiltersPanelProps) {
  const items = [
    {
      label: 'Intent',
      value:
        parsed.intent === 'buy' ? (
          <Badge>Buy</Badge>
        ) : parsed.intent === 'rent' ? (
          <Badge variant="secondary">Rent</Badge>
        ) : (
          '—'
        ),
    },
    {
      label: 'Bedrooms',
      value: parsed.bedrooms != null ? `${parsed.bedrooms} BHK` : '—',
    },
    {
      label: 'Budget',
      value: formatBudget(parsed.budget_min, parsed.budget_max, parsed.budget_currency),
    },
    { label: 'City', value: formatValue(parsed.city) },
    { label: 'Locality', value: formatValue(parsed.locality) },
    { label: 'Type', value: formatValue(parsed.property_type) },
  ]

  return (
    <Card className="border-primary/20 bg-background/60 backdrop-blur">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-base">Parsed filters</CardTitle>
          <p className="mt-1 text-sm italic text-muted-foreground">“{parsed.raw_text}”</p>
        </div>
        {saved && <Badge variant="success">Saved</Badge>}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-card px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <div className="mt-1 text-sm font-semibold">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Parser: {parsed.parser}</span>
          <span>Confidence: {Math.round(parsed.confidence * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
