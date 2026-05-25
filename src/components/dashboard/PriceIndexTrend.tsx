import { motion } from 'framer-motion'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PriceIndexPoint } from '@/lib/priceIndex'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PriceIndexTrendProps {
  data: PriceIndexPoint[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) {
    return null
  }

  const primary = payload.find((entry) => entry.dataKey === 'value')
  const secondary = payload.find((entry) => entry.dataKey === 'secondary')

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold">{label}</p>
      {secondary && (
        <p className="text-muted-foreground">
          secondary : <span className="font-medium text-foreground">{secondary.value}</span>
        </p>
      )}
      {primary && (
        <p className="text-muted-foreground">
          value : <span className="font-medium text-primary">{primary.value}</span>
        </p>
      )}
    </div>
  )
}

export function PriceIndexTrend({ data }: PriceIndexTrendProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Price Index Trend</CardTitle>
          <CardDescription>Average price per sq.ft across tracked localities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceIndexFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(173 80% 32%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(173 80% 32%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 32% 91%)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215 16% 47%)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(215 16% 47%)', fontSize: 12 }}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(173 80% 32%)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(173 80% 32%)"
                  strokeWidth={2.5}
                  fill="url(#priceIndexFill)"
                  dot={{ r: 3, fill: 'hsl(173 80% 32%)', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'hsl(173 80% 32%)', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="secondary"
                  stroke="hsl(173 60% 45%)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
