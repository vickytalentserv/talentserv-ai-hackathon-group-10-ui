import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Trophy } from 'lucide-react'
import type { PropertyListing } from '@/types/property'
import {
  buildOverallComparisonChartData,
  buildOverallComparisonMetrics,
  buildPropertyOverallScores,
  getOverallComparisonTooltipDetails,
  shortPropertyName,
} from '@/lib/propertyCompare'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface OverallComparisonPanelProps {
  properties: PropertyListing[]
}

function OverallChartTooltip({
  active,
  payload,
  label,
  details,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  details: Map<string, Map<string, string>>
}) {
  if (!active || !payload?.length || !label) {
    return null
  }

  const metricDetails = details.get(label)

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-2 font-semibold">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums">{entry.value}/100</p>
              {metricDetails?.get(entry.name) && (
                <p className="text-muted-foreground">{metricDetails.get(entry.name)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OverallComparisonPanel({ properties }: OverallComparisonPanelProps) {
  const overallScores = buildPropertyOverallScores(properties)
  const chartData = buildOverallComparisonChartData(properties)
  const tooltipDetails = getOverallComparisonTooltipDetails(properties)
  const propertyNames = properties.map((property, index) => shortPropertyName(property, index))
  const topScore = overallScores.reduce(
    (best, current) => (current.score > best.score ? current : best),
    overallScores[0],
  )

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Overall comparison chart</CardTitle>
        <CardDescription>
          Column chart of category scores (0–100). Taller columns mean a stronger result. Hover for
          the actual value.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {overallScores.map((entry) => (
            <div
              key={entry.propertyId}
              className={cn(
                'relative overflow-hidden rounded-xl border p-4',
                entry.propertyId === topScore?.propertyId
                  ? 'border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent'
                  : 'border-border bg-muted/20',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <p className="truncate text-sm font-medium">{entry.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Overall fit score</p>
                </div>
                {entry.rank === 1 && (
                  <Badge variant="success" className="shrink-0 gap-1">
                    <Trophy className="h-3 w-3" />
                    Top pick
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">
                {entry.score}
                <span className="text-base font-normal text-muted-foreground">/100</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Rank #{entry.rank} in this set</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-muted/10 p-4">
          <p className="mb-3 text-sm font-medium">Category score chart</p>
          <div className="h-[320px] w-full sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 12, left: 0, bottom: 8 }}
                barCategoryGap="18%"
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="metric"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={64}
                />
                <YAxis
                  domain={[0, 100]}
                  tickCount={6}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  label={{
                    value: 'Score',
                    angle: -90,
                    position: 'insideLeft',
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 11,
                  }}
                />
                <Tooltip content={<OverallChartTooltip details={tooltipDetails} />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => <span className="text-foreground">{value}</span>}
                />
                {propertyNames.map((name, index) => (
                  <Bar
                    key={name}
                    dataKey={name}
                    fill={overallScores[index]?.color}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  >
                    <LabelList
                      dataKey={name}
                      position="top"
                      formatter={(value) => (typeof value === 'number' ? `${value}` : '')}
                      className="fill-foreground text-[10px] font-medium"
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {buildOverallComparisonMetrics(properties).map((metric) => {
            const winner = metric.values.find((value) => value.isBest)
            return (
              <div key={metric.id} className="rounded-lg border border-border bg-card/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold">{winner?.displayValue ?? '—'}</p>
                <p className="mt-0.5 text-xs text-success">
                  Best: {winner?.name ?? '—'}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
