import { useState } from 'react'
import { ArrowRight, Building2, Key, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { usePropertySearch, useProperties, usePropertyStats } from '@/hooks/use-properties'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { AISearchHero } from '@/components/properties/AISearchHero'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { PropertyDetailModal } from '@/components/properties/PropertyDetailModal'
import { KpiGrid } from '@/components/dashboard/StatCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { TrendingLocationsWidget } from '@/components/dashboard/TrendingLocationsWidget'
import { PropertyCategoriesWidget } from '@/components/dashboard/PropertyCategoriesWidget'
import { AreaChartWidget } from '@/components/charts/AreaChartWidget'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { PropertyListing } from '@/types'

export function DashboardPage() {
  const { data, isLoading: dashboardLoading } = useDashboardData()
  const { properties, toggleFavorite, isFavorite } = useProperties()
  const {
    query,
    setQuery,
    search,
    isSearching,
    parsedCriteria,
    filteredProperties,
    hasSearched,
  } = usePropertySearch()
  const stats = usePropertyStats(properties)
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const realEstateKpis = [
    {
      id: 'kpi-total',
      label: 'Total Listings',
      value: String(stats.total),
      change: 12.4,
      changeLabel: 'vs last month',
      icon: 'Building2',
      trend: 'up' as const,
    },
    {
      id: 'kpi-available',
      label: 'Available Now',
      value: String(stats.available),
      change: 8.2,
      changeLabel: 'active listings',
      icon: 'Target',
      trend: 'up' as const,
    },
    {
      id: 'kpi-sold',
      label: 'Sold / Rented',
      value: String(stats.sold + stats.rented),
      change: 5.6,
      changeLabel: 'this quarter',
      icon: 'IndianRupee',
      trend: 'up' as const,
    },
    {
      id: 'kpi-rent',
      label: 'For Rent',
      value: String(stats.forRent),
      change: 15.3,
      changeLabel: 'rental demand',
      icon: 'Users',
      trend: 'up' as const,
    },
  ]

  const handleContact = (property: PropertyListing) => {
    setSelectedProperty(property)
    setModalOpen(true)
  }

  const handleFavorite = (id: string) => {
    const wasFavorite = isFavorite(id)
    toggleFavorite(id)
    toast.success(wasFavorite ? 'Removed from saved' : 'Property saved!', {
      description: wasFavorite ? undefined : 'Added to your shortlist.',
    })
  }

  return (
    <div className="space-y-8">
      <AISearchHero
        query={query}
        onQueryChange={setQuery}
        onSearch={search}
        isSearching={isSearching}
        parsedCriteria={hasSearched ? parsedCriteria : null}
        resultCount={filteredProperties.length}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {hasSearched ? 'Matching Properties' : 'Featured Properties'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasSearched
                ? `${filteredProperties.length} properties match your search`
                : 'Handpicked listings based on market trends'}
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/properties" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <PropertyGrid
          properties={filteredProperties}
          isLoading={isSearching}
          isFavorite={isFavorite}
          onToggleFavorite={handleFavorite}
          onContact={handleContact}
          columns={3}
        />
      </section>

      <KpiGrid metrics={realEstateKpis} isLoading={dashboardLoading} />

      <PropertyCategoriesWidget />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaChartWidget
            title="Price Index Trend"
            description="Average price per sqft across tracked localities"
            data={data?.revenueChart ?? []}
          />
        </div>
        <TrendingLocationsWidget />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickStatCard
          icon={Building2}
          label="Apartments"
          value="68"
          sub="Most popular category"
        />
        <QuickStatCard
          icon={Key}
          label="Rentals"
          value={String(stats.forRent)}
          sub="High demand in IT corridors"
        />
        <QuickStatCard
          icon={TrendingUp}
          label="Avg. Growth"
          value="+9.4%"
          sub="Across top localities"
        />
      </div>

      <ActivityFeed activities={data?.activities ?? []} isLoading={dashboardLoading} />

      <PropertyDetailModal
        property={selectedProperty}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}

function QuickStatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub: string
}) {
  return (
    <Card className="transition-shadow hover:shadow-elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <CardDescription>{label}</CardDescription>
        </div>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
