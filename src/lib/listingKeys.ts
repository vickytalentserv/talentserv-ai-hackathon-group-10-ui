export interface ListingKeyParts {
  listingKey: string
  propertyId?: number
}

export function toListingKey(propertyId: string): ListingKeyParts {
  if (propertyId.startsWith('api-')) {
    const id = Number(propertyId.slice(4))
    return { listingKey: `db:${id}`, propertyId: id }
  }

  return { listingKey: `mock:${propertyId}` }
}

export function fromListingKey(listingKey: string): string {
  if (listingKey.startsWith('db:')) {
    return `api-${listingKey.slice(3)}`
  }

  if (listingKey.startsWith('mock:')) {
    return listingKey.slice(5)
  }

  return listingKey
}

export function parseRoutePropertyId(routeId: string): { dbId?: number; mockId?: string } {
  if (routeId.startsWith('mock-')) {
    return { mockId: routeId.slice(5) }
  }

  const numeric = Number(routeId)
  if (!Number.isNaN(numeric) && numeric > 0) {
    return { dbId: numeric }
  }

  if (routeId.startsWith('api-')) {
    return { dbId: Number(routeId.slice(4)) }
  }

  if (routeId.startsWith('p-')) {
    return { mockId: routeId }
  }

  return { mockId: routeId }
}

export function toRoutePropertyId(propertyId: string): string {
  const { listingKey } = toListingKey(propertyId)
  if (listingKey.startsWith('db:')) {
    return listingKey.slice(3)
  }
  return `mock-${listingKey.slice(5)}`
}
