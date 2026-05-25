import { motion } from 'framer-motion'
import { Building2, Home, Key, Sparkles, Wallet } from 'lucide-react'
import { propertyCategories } from '@/constants/properties'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Home,
  Sparkles,
  Wallet,
  Key,
}

export function PropertyCategoriesWidget() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Property Categories</CardTitle>
        <CardDescription>Inventory breakdown by type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {propertyCategories.map((cat, index) => {
            const Icon = iconMap[cat.icon] ?? Building2
            return (
              <motion.button
                key={cat.type}
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{cat.type}</p>
                  <p className="text-xs text-muted-foreground">{cat.count} listings</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
