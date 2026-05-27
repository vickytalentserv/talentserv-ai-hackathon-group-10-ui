import { useAuth0 } from '@auth0/auth0-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { addFavorite, fetchFavorites, removeFavorite, type ParsedRequirement } from '@/api/client'
import { auth0Audience } from '@/config'
import { MOCK_PROPERTIES } from '@/data/mockProperties'
import { mapFavoriteItemsToListings } from '@/lib/favoriteMapper'
import { fromListingKey, toListingKey } from '@/lib/listingKeys'
import type { PropertyListing } from '@/types/property'

interface PropertyContextValue {
  properties: PropertyListing[]
  setProperties: (properties: PropertyListing[]) => void
  favorites: Set<string>
  savedProperties: PropertyListing[]
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
  const [savedProperties, setSavedProperties] = useState<PropertyListing[]>([])
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const [parsedRequirement, setParsedRequirement] = useState<ParsedRequirement | null>(null)

  const findProperty = useCallback(
    (id: string) => {
      return (
        properties.find((property) => property.id === id) ??
        savedProperties.find((property) => property.id === id) ??
        MOCK_PROPERTIES.find((property) => property.id === id)
      )
    },
    [properties, savedProperties],
  )

  const loadFavoritesFromApi = useCallback(async () => {
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: auth0Audience },
    })
    const response = await fetchFavorites(token)
    setFavorites(new Set(response.items.map((item) => fromListingKey(item.listing_key))))
    setSavedProperties(mapFavoriteItemsToListings(response.items))
  }, [getAccessTokenSilently])

  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites(new Set())
      setSavedProperties([])
      setFavoritesLoaded(false)
      return
    }

    let cancelled = false

    async function loadFavorites() {
      try {
        await loadFavoritesFromApi()
      } catch {
        if (!cancelled) {
          setFavorites(new Set())
          setSavedProperties([])
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
  }, [isAuthenticated, loadFavoritesFromApi])

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        throw new Error('Sign in to shortlist properties')
      }

      const wasFavorite = favorites.has(propertyId)
      const property = findProperty(propertyId)
      const next = new Set(favorites)
      if (wasFavorite) {
        next.delete(propertyId)
        setSavedProperties((current) => current.filter((item) => item.id !== propertyId))
      } else {
        next.add(propertyId)
        if (property) {
          setSavedProperties((current) =>
            current.some((item) => item.id === propertyId) ? current : [...current, property],
          )
        }
      }
      setFavorites(next)

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
          if (property) {
            setSavedProperties((current) =>
              current.some((item) => item.id === propertyId) ? current : [...current, property],
            )
          } else {
            await loadFavoritesFromApi()
          }
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
        setSavedProperties((current) => {
          if (wasFavorite && property) {
            return current.some((item) => item.id === propertyId) ? current : [...current, property]
          }
          return current.filter((item) => item.id !== propertyId)
        })
        throw new Error('Could not update shortlist. Please try again.')
      }
    },
    [favorites, findProperty, getAccessTokenSilently, isAuthenticated, loadFavoritesFromApi],
  )

  const value = useMemo(
    () => ({
      properties,
      setProperties,
      favorites,
      savedProperties,
      favoritesLoaded,
      toggleFavorite,
      isFavorite: (id: string) => favorites.has(id),
      parsedRequirement,
      setParsedRequirement,
      findProperty,
    }),
    [properties, favorites, savedProperties, favoritesLoaded, toggleFavorite, parsedRequirement, findProperty],
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
