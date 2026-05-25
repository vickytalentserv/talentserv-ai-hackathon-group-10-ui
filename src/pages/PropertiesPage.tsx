import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProperties } from '@/api/client'
import { usePropertyContext } from '@/context/PropertyContext'
import { AppShell } from '@/components/layout/AppShell'
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import { PropertyFiltersBar } from '@/components/properties/PropertyFiltersBar'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { filterProperties } from '@/lib/propertyFilters'
import { filtersToQueryParams } from '@/lib/propertyQuery'
import { toRoutePropertyId } from '@/lib/listingKeys'
import { mapApiPropertyToListing } from '@/lib/propertyMapper'
import type { PropertyFilters, PropertyListing } from '@/types/property'
import { Pagination } from '@/components/ui/pagination'
import { LoadMoreButton } from '@/components/ui/load-more'
import { Badge } from '@/components/ui/badge'

const defaultFilters: PropertyFilters = {
  search: '',
  city: 'all',
  propertyType: 'all',
  furnishing: 'all',
  listingStatus: 'all',
  sort: 'newest',
}

const PAGE_SIZE = 9

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
        const fallback = applyLocalFilters(filterProperties(catalogProperties, activeFilters), activeFilters)
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
  }, [activeFilters, appendResults, page, catalogProperties])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasMore = page < totalPages

  const cityOptions = useMemo(() => {
    const cities = new Set(catalogProperties.map((property) => property.city))
    listings.forEach((property) => cities.add(property.city))
    return [...cities].sort()
  }, [catalogProperties, listings])

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">All properties</h1>
            <p className="mt-1 text-muted-foreground">
              {useServer
                ? `${total} listings from database with server-side filters`
                : `${total} listings (offline catalog mode)`}
            </p>
          </div>
          {useServer ? (
            <Badge variant="success">Server pagination</Badge>
          ) : (
            <Badge variant="warning">Offline fallback</Badge>
          )}
        </div>

        <PropertyFiltersBar filters={filters} cities={cityOptions} onChange={setFilters} />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {listings.length} of {total} results
          </span>
        </div>

        <PropertyGrid
          properties={listings}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          loading={loading && page === 1}
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
