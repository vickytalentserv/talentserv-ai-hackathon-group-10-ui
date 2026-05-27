import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppShell } from '@/components/layout/AppShell'
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import { CompareSelectionBanner } from '@/components/properties/CompareSelectionBanner'
import { PropertyFiltersBar } from '@/components/properties/PropertyFiltersBar'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { filterProperties } from '@/lib/propertyFilters'
import { filtersToQueryParams } from '@/lib/propertyQuery'
import { toRoutePropertyId } from '@/lib/listingKeys'
import { mapApiPropertyToListing } from '@/lib/propertyMapper'
import type { PropertyFilters, PropertyListing } from '@/types/property'
import { Pagination } from '@/components/ui/pagination'
import { LoadMoreButton } from '@/components/ui/load-more'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProperties } from '@/api/client'
import { usePropertyContext } from '@/context/PropertyContext'

const defaultFilters: PropertyFilters = {
  search: '',
  city: 'all',
  propertyType: 'all',
  furnishing: 'all',
  listingStatus: 'all',
  sort: 'newest',
}

const PAGE_SIZE = 9
const DEFAULT_CITIES = ['Bengaluru', 'Mumbai', 'Pune']

function applyLocalFilters(items: PropertyListing[], filters: PropertyFilters): PropertyListing[] {
  let result = [...items]

  if (filters.furnishing !== 'all') {
    result = result.filter((property) => property.furnishing === filters.furnishing)
  }

  if (filters.sort === 'rating-desc') {
    result.sort((a, b) => b.rating - a.rating)
  }

  return result
}

export function PropertiesPage() {
  const navigate = useNavigate()
  const { properties: catalogProperties, favorites, toggleFavorite } = usePropertyContext()
  const catalogRef = useRef(catalogProperties)
  catalogRef.current = catalogProperties
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [appendResults, setAppendResults] = useState(false)
  const [listings, setListings] = useState<PropertyListing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [useServer, setUseServer] = useState(true)
  const [contactProperty, setContactProperty] = useState<PropertyListing | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [filters.search])

  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  )

  useEffect(() => {
    setAppendResults(false)
    setPage(1)
  }, [
    activeFilters.city,
    activeFilters.propertyType,
    activeFilters.listingStatus,
    activeFilters.sort,
    activeFilters.search,
    activeFilters.furnishing,
  ])

  useEffect(() => {
    let cancelled = false

    async function loadPage() {
      if (page === 1 && !appendResults) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        const query = filtersToQueryParams(activeFilters, page, PAGE_SIZE)
        const response = await fetchProperties(page, PAGE_SIZE, query)
        const mapped = response.items.map((item, index) => mapApiPropertyToListing(item, index))
        const refined = applyLocalFilters(mapped, activeFilters)

        if (cancelled) {
          return
        }

        setUseServer(true)
        setTotal(response.total)
        setListings((prev) => (appendResults && page > 1 ? [...prev, ...refined] : refined))
      } catch {
        if (cancelled) {
          return
        }

        setUseServer(false)
        const fallback = applyLocalFilters(
          filterProperties(catalogRef.current, activeFilters),
          activeFilters,
        )
        setTotal(fallback.length)
        const sliceEnd = page * PAGE_SIZE
        setListings(fallback.slice(0, sliceEnd))
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }

    void loadPage()
    return () => {
      cancelled = true
    }
  }, [activeFilters, appendResults, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasMore = page < totalPages

  const cityOptions = useMemo(() => {
    const cities = new Set(DEFAULT_CITIES)
    listings.forEach((property) => cities.add(property.city))
    return [...cities].sort()
  }, [listings])

  function handleLoadMore() {
    setAppendResults(true)
    setPage((current) => current + 1)
  }

  function handlePageChange(nextPage: number) {
    setAppendResults(false)
    setPage(nextPage)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow={
            useServer ? (
              <Badge variant="success">Live database</Badge>
            ) : (
              <Badge variant="warning">Offline catalog</Badge>
            )
          }
          title="All properties"
          description={
            useServer
              ? `${total} listings with server-side filters and pagination`
              : `${total} listings in offline catalog mode`
          }
        />

        <PropertyFiltersBar filters={filters} cities={cityOptions} onChange={setFilters} />

        <CompareSelectionBanner />

        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3 text-sm shadow-soft">
          <span className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{listings.length}</span> of{' '}
            <span className="font-semibold text-foreground">{total}</span> results
          </span>
        </div>

        <PropertyGrid
          properties={listings}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          loading={loading && page === 1}
          showCompareAction
          onContactProperty={setContactProperty}
          onViewProperty={(property) => navigate(`/properties/${toRoutePropertyId(property.id)}`)}
        />

        <LoadMoreButton loading={loadingMore} hasMore={hasMore} onLoadMore={handleLoadMore} />

        <div className="hidden sm:block">
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      <ContactInquiryModal
        property={contactProperty}
        open={contactProperty != null}
        onOpenChange={(open) => {
          if (!open) {
            setContactProperty(null)
          }
        }}
      />
    </AppShell>
  )
}
