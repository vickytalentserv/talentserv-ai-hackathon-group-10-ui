import { motion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ChartDataPoint } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = [
  'oklch(0.55 0.15 264)',
  'oklch(0.65 0.12 200)',
  'oklch(0.72 0.14 75)',
  'oklch(0.55 0.15 155)',
  'oklch(0.58 0.22 27)',
]

interface PieChartWidgetProps {
  title: string
  description?: string
  data: ChartDataPoint[]
  height?: number
}

export function PieChartWidget({
  title,
  description,
  data,
  height = 260,
}: PieChartWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col items-center gap-4 lg:flex-row"
        >
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
