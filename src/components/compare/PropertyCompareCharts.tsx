import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PropertyListing } from '@/types/property'
import {
  buildBhkChartData,
  buildPriceChartData,
  buildPricePerSqftChartData,
  buildRatingChartData,
  buildSqftChartData,
  type CompareChartPoint,
} from '@/lib/propertyCompare'
import { formatPrice } from '@/lib/utils'
import { OverallComparisonPanel } from '@/components/compare/OverallComparisonPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PropertyCompareChartsProps {
  properties: PropertyListing[]
}

function MetricChartTooltip({
  active,
  payload,
  valueFormatter,
}: {
  active?: boolean
  payload?: { payload: CompareChartPoint; value: number }[]
  valueFormatter?: (value: number) => string
}) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0].payload
  const formatted =
    valueFormatter && typeof payload[0].value === 'number'
      ? valueFormatter(payload[0].value)
      : String(payload[0].value ?? '')

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{item.name}</p>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">{formatted}</span>
      </p>
    </div>
  )
}

function SimpleColumnChart({
  title,
  description,
  data,
  valueFormatter,
  lowerIsBetter = false,
}: {
  title: string
  description: string
  data: CompareChartPoint[]
  valueFormatter?: (value: number) => string
  lowerIsBetter?: boolean
}) {
  const bestValue = lowerIsBetter
    ? Math.min(...data.map((point) => point.value))
    : Math.max(...data.map((point) => point.value))

  const formatLabel = (value: unknown) => {
    if (typeof value !== 'number') {
      return ''
    }
    return valueFormatter ? valueFormatter(value) : String(value)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                interval={0}
                angle={-14}
                textAnchor="end"
                height={52}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={valueFormatter}
                width={56}
              />
              <Tooltip
                content={<MetricChartTooltip valueFormatter={valueFormatter} />}
                cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {data.map((entry) => (
                  <Cell
                    key={entry.propertyId}
                    fill={entry.fill}
                    opacity={entry.value === bestValue ? 1 : 0.75}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={formatLabel}
                  className="fill-foreground text-[10px] font-semibold"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {lowerIsBetter
            ? 'Shortest column = best in this comparison'
            : 'Tallest column = highest in this comparison'}
        </p>
      </CardContent>
    </Card>
  )
}

export function PropertyCompareCharts({ properties }: PropertyCompareChartsProps) {
  const currency = properties[0]?.currency ?? 'INR'

  return (
    <div className="space-y-6">
      <OverallComparisonPanel properties={properties} />

      <div>
        <h2 className="mb-1 text-lg font-semibold">Key metric charts</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Simple column charts with values shown on top — easy to compare at a glance.
        </p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <SimpleColumnChart
            title="Price chart"
            description="Listed price for each property"
            data={buildPriceChartData(properties)}
            valueFormatter={(value) => formatPrice(value, currency)}
            lowerIsBetter
          />
          <SimpleColumnChart
            title="Area chart"
            description="Carpet area in square feet"
            data={buildSqftChartData(properties)}
            valueFormatter={(value) => `${value.toLocaleString()} sqft`}
          />
          <SimpleColumnChart
            title="Price per sqft chart"
            description="Useful for comparing value on similar homes"
            data={buildPricePerSqftChartData(properties)}
            valueFormatter={(value) => formatPrice(value, currency)}
            lowerIsBetter
          />
          <SimpleColumnChart
            title="Rating chart"
            description="User rating out of 5 stars"
            data={buildRatingChartData(properties)}
            valueFormatter={(value) => `${value.toFixed(1)} ★`}
          />
          <SimpleColumnChart
            title="Bedrooms chart"
            description="Number of bedrooms (BHK)"
            data={buildBhkChartData(properties)}
            valueFormatter={(value) => `${value} BHK`}
          />
        </div>
      </div>
    </div>
  )
}
