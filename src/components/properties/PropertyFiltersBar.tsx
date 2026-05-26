import { SlidersHorizontal } from 'lucide-react'
import type { PropertyFilters } from '@/types/property'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PropertyFiltersBarProps {
  filters: PropertyFilters
  cities: string[]
  onChange: (filters: PropertyFilters) => void
}

const selectClassName =
  'h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground shadow-soft outline-none transition-all duration-200 hover:border-border focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/30'

export function PropertyFiltersBar({ filters, cities, onChange }: PropertyFiltersBarProps) {
  function update<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </span>
          Filters & sorting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder="Search title or location…"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            className="lg:col-span-2"
          />

          <select
            className={selectClassName}
            value={filters.city}
            onChange={(event) => update('city', event.target.value)}
          >
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            className={selectClassName}
            value={filters.propertyType}
            onChange={(event) => update('propertyType', event.target.value)}
          >
            <option value="all">All types</option>
            <option value="apartment">Apartment / Flat</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
          </select>

          <select
            className={selectClassName}
            value={filters.furnishing}
            onChange={(event) => update('furnishing', event.target.value)}
          >
            <option value="all">Any furnishing</option>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>

          <select
            className={selectClassName}
            value={filters.listingStatus}
            onChange={(event) => update('listingStatus', event.target.value)}
          >
            <option value="all">Buy or rent</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>

          <select
            className={selectClassName}
            value={filters.sort}
            onChange={(event) => update('sort', event.target.value as PropertyFilters['sort'])}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="rating-desc">Top rated</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
