import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
  buildRadarChartData,
  buildRatingChartData,
  buildSqftChartData,
  COMPARE_CHART_COLORS,
  shortPropertyName,
  type CompareChartPoint,
} from '@/lib/propertyCompare'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PropertyCompareChartsProps {
  properties: PropertyListing[]
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CompareChartPoint; value: number }[]
}) {
  if (!active || !payload?.length) {
    return null
  }

  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{item.name}</p>
      <p className="text-muted-foreground">
        Value: <span className="font-medium text-foreground">{payload[0].value}</span>
      </p>
    </div>
  )
}

function MetricBarChart({
  title,
  description,
  data,
  valueFormatter,
}: {
  title: string
  description: string
  data: CompareChartPoint[]
  valueFormatter?: (value: number) => string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 32% 91%)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215 16% 47%)', fontSize: 11 }}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={56}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215 16% 47%)', fontSize: 11 }}
                tickFormatter={valueFormatter}
              />
              <Tooltip
                content={<ChartTooltip />}
                formatter={(value) =>
                  valueFormatter && typeof value === 'number'
                    ? valueFormatter(value)
                    : String(value ?? '')
                }
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function PropertyCompareCharts({ properties }: PropertyCompareChartsProps) {
  const radarData = buildRadarChartData(properties)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Overall comparison radar</CardTitle>
          <CardDescription>
            Normalized view across price value, area, rating, BHK, and amenities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="hsl(214 32% 91%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215 16% 47%)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                {properties.map((property, index) => (
                  <Radar
                    key={property.id}
                    name={shortPropertyName(property, index)}
                    dataKey={shortPropertyName(property, index)}
                    stroke={COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length]}
                    fill={COMPARE_CHART_COLORS[index % COMPARE_CHART_COLORS.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricBarChart
          title="Price comparison"
          description="Listed price for each selected property"
          data={buildPriceChartData(properties)}
          valueFormatter={(value) => formatPrice(value, properties[0]?.currency ?? 'INR')}
        />
        <MetricBarChart
          title="Area comparison"
          description="Carpet area in square feet"
          data={buildSqftChartData(properties)}
          valueFormatter={(value) => `${value.toLocaleString()} sqft`}
        />
        <MetricBarChart
          title="Price per sqft"
          description="Lower is usually better value for similar listings"
          data={buildPricePerSqftChartData(properties)}
          valueFormatter={(value) => formatPrice(value, properties[0]?.currency ?? 'INR')}
        />
        <MetricBarChart
          title="Rating & BHK"
          description="User rating and bedroom count side by side"
          data={buildRatingChartData(properties)}
          valueFormatter={(value) => value.toFixed(1)}
        />
      </div>

      <MetricBarChart
        title="Bedroom count (BHK)"
        description="Number of bedrooms in each listing"
        data={buildBhkChartData(properties)}
        valueFormatter={(value) => `${value} BHK`}
      />
    </div>
  )
}
