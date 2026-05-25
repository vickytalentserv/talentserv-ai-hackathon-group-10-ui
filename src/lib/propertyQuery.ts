import type { PropertyFilters } from '@/types/property'

export interface PropertyQueryParams {
  page?: number
  pageSize?: number
  search?: string
  city?: string
  propertyType?: string
  listingStatus?: string
  sort?: PropertyFilters['sort']
}

export function filtersToQueryParams(
  filters: PropertyFilters,
  page: number,
  pageSize: number,
): PropertyQueryParams {
  return {
    page,
    pageSize,
    search: filters.search.trim() || undefined,
    city: filters.city !== 'all' ? filters.city : undefined,
    propertyType: filters.propertyType !== 'all' ? filters.propertyType : undefined,
    listingStatus: filters.listingStatus !== 'all' ? filters.listingStatus : undefined,
    sort: filters.sort,
  }
}

export function buildPropertiesUrl(baseUrl: string, params: PropertyQueryParams): string {
  const query = new URLSearchParams()
  query.set('page', String(params.page ?? 1))
  query.set('page_size', String(params.pageSize ?? 20))

  if (params.search) {
    query.set('search', params.search)
  }
  if (params.city) {
    query.set('city', params.city)
  }
  if (params.propertyType) {
    query.set('property_type', params.propertyType)
  }
  if (params.listingStatus) {
    query.set('intent', params.listingStatus)
  }
  if (params.sort && params.sort !== 'rating-desc') {
    query.set('sort', params.sort)
  }

  return `${baseUrl}/api/v1/properties?${query.toString()}`
}
