import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartDataPoint } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AreaChartWidgetProps {
  title: string
  description?: string
  data: ChartDataPoint[]
  dataKey?: keyof ChartDataPoint
  secondaryKey?: keyof ChartDataPoint
  height?: number
}

export function AreaChartWidget({
  title,
  description,
  data,
  dataKey = 'value',
  secondaryKey = 'secondary',
  height = 280,
}: AreaChartWidgetProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.15 264)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.15 264)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.12 200)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="oklch(0.65 0.12 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 265)" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 265)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'oklch(0.55 0.02 265)' }}
              />
              <Tooltip
                contentStyle={{
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                }}
              />
              <Area
                type="monotone"
                dataKey={secondaryKey as string}
                stroke="oklch(0.65 0.12 200)"
                strokeWidth={2}
                fill="url(#colorSecondary)"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey={dataKey as string}
                stroke="oklch(0.55 0.15 264)"
                strokeWidth={2}
                fill="url(#colorPrimary)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  )
}
