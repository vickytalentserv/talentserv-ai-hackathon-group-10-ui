import { useAuth0 } from '@auth0/auth0-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { addFavorite, fetchFavorites, removeFavorite, type ParsedRequirement } from '@/api/client'
import { auth0Audience } from '@/config'
import { MOCK_PROPERTIES } from '@/data/mockProperties'
import { fromListingKey, toListingKey } from '@/lib/listingKeys'
import type { PropertyListing } from '@/types/property'

interface PropertyContextValue {
  properties: PropertyListing[]
  setProperties: (properties: PropertyListing[]) => void
  favorites: Set<string>
  favoritesLoaded: boolean
  toggleFavorite: (id: string) => Promise<void>
  isFavorite: (id: string) => boolean
  parsedRequirement: ParsedRequirement | null
  setParsedRequirement: (parsed: ParsedRequirement | null) => void
  findProperty: (id: string) => PropertyListing | undefined
}

const PropertyContext = createContext<PropertyContextValue | null>(null)

export function PropertyProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [properties, setProperties] = useState<PropertyListing[]>(MOCK_PROPERTIES)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)

  const [parsedRequirement, setParsedRequirement] = useState<ParsedRequirement | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites(new Set())
      setFavoritesLoaded(false)
      return
    }

    let cancelled = false

    async function loadFavorites() {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: auth0Audience },
        })
        const response = await fetchFavorites(token)
        if (cancelled) {
          return
        }

        setFavorites(new Set(response.items.map((item) => fromListingKey(item.listing_key))))
      } catch {
        if (!cancelled) {
          setFavorites(new Set())
        }
      } finally {
        if (!cancelled) {
          setFavoritesLoaded(true)
        }
      }
    }

    void loadFavorites()
    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently, isAuthenticated])

  const findProperty = useCallback(
    (id: string) => {
      return properties.find((property) => property.id === id) ?? MOCK_PROPERTIES.find((p) => p.id === id)
    },
    [properties],
  )

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      const wasFavorite = favorites.has(propertyId)
      const next = new Set(favorites)
      if (wasFavorite) {
        next.delete(propertyId)
      } else {
        next.add(propertyId)
      }
      setFavorites(next)

      if (!isAuthenticated) {
        return
      }

      const { listingKey, propertyId: dbPropertyId } = toListingKey(propertyId)

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: auth0Audience },
        })

        if (wasFavorite) {
          await removeFavorite(token, listingKey)
        } else {
          await addFavorite(token, {
            listing_key: listingKey,
            property_id: dbPropertyId,
          })
        }
      } catch {
        setFavorites((current) => {
          const reverted = new Set(current)
          if (wasFavorite) {
            reverted.add(propertyId)
          } else {
            reverted.delete(propertyId)
          }
          return reverted
        })
      }
    },
    [favorites, getAccessTokenSilently, isAuthenticated],
  )

  const value = useMemo(
    () => ({
      properties,
      setProperties,
      favorites,
      favoritesLoaded,
      toggleFavorite,
      isFavorite: (id: string) => favorites.has(id),
      parsedRequirement,
      setParsedRequirement,
      findProperty,
    }),
    [properties, favorites, favoritesLoaded, toggleFavorite, parsedRequirement, findProperty],
  )

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>
}

export function usePropertyContext() {
  const context = useContext(PropertyContext)
  if (!context) {
    throw new Error('usePropertyContext must be used within PropertyProvider')
  }
  return context
}
