import { SlidersHorizontal, X } from 'lucide-react'
import { localities } from '@/constants/properties'
import type { PropertyFilters, FurnishingStatus, PropertyType, TransactionType } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchBar } from '@/components/shared/SearchBar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PropertyFiltersBarProps {
  filters: PropertyFilters
  onUpdate: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void
  onReset: () => void
  totalCount: number
  className?: string
  layout?: 'horizontal' | 'sidebar'
}

const BHK_OPTIONS = [1, 2, 3, 4, 5]
const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
]
const FURNISHING: { value: FurnishingStatus; label: string }[] = [
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
]

export function PropertyFiltersBar({
  filters,
  onUpdate,
  onReset,
  totalCount,
  className,
  layout = 'horizontal',
}: PropertyFiltersBarProps) {
  const activeFilterCount = [
    filters.localities.length > 0,
    filters.propertyTypes.length > 0,
    filters.bhk !== null,
    filters.furnishing !== null,
    filters.transactionType !== null,
    filters.priceMin !== null,
    filters.priceMax !== null,
  ].filter(Boolean).length

  const isSidebar = layout === 'sidebar'

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-soft',
        isSidebar ? 'space-y-5' : 'space-y-4',
        className,
      )}
    >
      <div className={cn('flex items-center justify-between', !isSidebar && 'flex-wrap gap-3')}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{totalCount} properties</span>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-7 gap-1 text-xs">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <SearchBar
        placeholder="Search by location, BHK, budget..."
        value={filters.search}
        onChange={(e) => onUpdate('search', e.target.value)}
        containerClassName={isSidebar ? 'w-full' : 'w-full lg:max-w-sm'}
      />

      <div
        className={cn(
          'gap-3',
          isSidebar ? 'flex flex-col' : 'grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6',
        )}
      >
        <FilterSelect
          label="Locality"
          value={filters.localities[0] ?? 'all'}
          onChange={(v) => onUpdate('localities', v === 'all' ? [] : [v])}
          options={[{ value: 'all', label: 'All Localities' }, ...localities.map((l) => ({ value: l, label: l }))]}
        />
        <FilterSelect
          label="BHK"
          value={filters.bhk?.toString() ?? 'all'}
          onChange={(v) => onUpdate('bhk', v === 'all' ? null : parseInt(v, 10))}
          options={[{ value: 'all', label: 'Any BHK' }, ...BHK_OPTIONS.map((b) => ({ value: String(b), label: `${b} BHK` }))]}
        />
        <FilterSelect
          label="Type"
          value={filters.propertyTypes[0] ?? 'all'}
          onChange={(v) => onUpdate('propertyTypes', v === 'all' ? [] : [v as PropertyType])}
          options={[{ value: 'all', label: 'All Types' }, ...PROPERTY_TYPES]}
        />
        <FilterSelect
          label="Furnishing"
          value={filters.furnishing ?? 'all'}
          onChange={(v) => onUpdate('furnishing', v === 'all' ? null : (v as FurnishingStatus))}
          options={[{ value: 'all', label: 'Any' }, ...FURNISHING]}
        />
        <FilterSelect
          label="Listing"
          value={filters.transactionType ?? 'all'}
          onChange={(v) => onUpdate('transactionType', v === 'all' ? null : (v as TransactionType))}
          options={[
            { value: 'all', label: 'Buy & Rent' },
            { value: 'buy', label: 'For Sale' },
            { value: 'rent', label: 'For Rent' },
          ]}
        />
        <FilterSelect
          label="Sort by"
          value={filters.sortBy}
          onChange={(v) => onUpdate('sortBy', v as PropertyFilters['sortBy'])}
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' },
            { value: 'rating', label: 'Top Rated' },
            { value: 'area', label: 'Largest Area' },
          ]}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
