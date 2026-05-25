import { useCallback, useMemo, useState } from 'react'
import { sampleProperties } from '@/constants/properties'
import {
  defaultPropertyFilters,
  filterPropertiesByCriteria,
  filterPropertiesByFilters,
  parseNaturalLanguageQuery,
} from '@/utils/property-search'
import type { ParsedSearchCriteria, PropertyFilters, PropertyListing } from '@/types'

const FAVORITES_KEY = 'propintel-favorites'

function loadFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

export function useProperties() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]))
      return next
    })
  }, [])

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites])

  return {
    properties: sampleProperties,
    favorites,
    toggleFavorite,
    isFavorite,
  }
}

export function usePropertySearch(initialQuery = '') {
  const { properties } = useProperties()
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [parsedCriteria, setParsedCriteria] = useState<ParsedSearchCriteria | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery)
      setIsSearching(true)
      setHasSearched(true)

      await new Promise((r) => setTimeout(r, 600))

      const criteria = parseNaturalLanguageQuery(searchQuery)
      setParsedCriteria(criteria)
      setIsSearching(false)
    },
    [],
  )

  const filteredProperties = useMemo(() => {
    if (!hasSearched || !query.trim()) {
      return properties.filter((p) => p.isFeatured || p.availability === 'available').slice(0, 6)
    }
    if (!parsedCriteria) return properties
    const results = filterPropertiesByCriteria(properties, parsedCriteria)
    return results.length > 0 ? results : properties.slice(0, 4)
  }, [properties, query, parsedCriteria, hasSearched])

  return {
    query,
    setQuery,
    search,
    isSearching,
    parsedCriteria,
    filteredProperties,
    hasSearched,
    totalCount: properties.length,
  }
}

export function usePropertyFilters() {
  const { properties } = useProperties()
  const [filters, setFilters] = useState<PropertyFilters>(defaultPropertyFilters)
  const [page, setPage] = useState(1)
  const pageSize = 9

  const filtered = useMemo(
    () => filterPropertiesByFilters(properties, filters),
    [properties, filters],
  )

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / pageSize)

  const updateFilter = useCallback(<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultPropertyFilters)
    setPage(1)
  }, [])

  return {
    filters,
    updateFilter,
    resetFilters,
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    pageSize,
    totalCount: filtered.length,
  }
}

export function usePropertyStats(properties: PropertyListing[]) {
  return useMemo(() => ({
    total: properties.length,
    available: properties.filter((p) => p.availability === 'available').length,
    sold: properties.filter((p) => p.availability === 'sold').length,
    rented: properties.filter((p) => p.availability === 'rented').length,
    forRent: properties.filter((p) => p.transactionType === 'rent').length,
    luxury: properties.filter((p) => p.isLuxury).length,
  }), [properties])
}
