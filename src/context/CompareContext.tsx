import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MAX_COMPARE_COUNT } from '@/lib/propertyCompare'
import type { PropertyListing } from '@/types/property'

const STORAGE_KEY = 'realestate-compare-list'

interface CompareContextValue {
  compareList: PropertyListing[]
  compareCount: number
  isInCompare: (id: string) => boolean
  canAddToCompare: boolean
  toggleCompare: (property: PropertyListing) => void
  addToCompare: (property: PropertyListing) => boolean
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  limitMessage: string | null
  clearLimitMessage: () => void
}

const CompareContext = createContext<CompareContextValue | null>(null)

function readStoredCompareList(): PropertyListing[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as PropertyListing[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE_COUNT) : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<PropertyListing[]>(() => readStoredCompareList())
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList))
  }, [compareList])

  const isInCompare = useCallback(
    (id: string) => compareList.some((property) => property.id === id),
    [compareList],
  )

  const canAddToCompare = compareList.length < MAX_COMPARE_COUNT

  const addToCompare = useCallback((property: PropertyListing) => {
    let added = false

    setCompareList((current) => {
      if (current.some((item) => item.id === property.id)) {
        setLimitMessage(null)
        return current
      }

      if (current.length >= MAX_COMPARE_COUNT) {
        setLimitMessage(
          `You can compare up to ${MAX_COMPARE_COUNT} properties. Remove one from the Compare tab to add another.`,
        )
        return current
      }

      added = true
      setLimitMessage(null)
      return [...current, property]
    })

    return added
  }, [])

  const toggleCompare = useCallback((property: PropertyListing) => {
    setCompareList((current) => {
      const exists = current.some((item) => item.id === property.id)
      if (exists) {
        setLimitMessage(null)
        return current.filter((item) => item.id !== property.id)
      }

      if (current.length >= MAX_COMPARE_COUNT) {
        setLimitMessage(
          `You can compare up to ${MAX_COMPARE_COUNT} properties. Remove one from the Compare tab to add another.`,
        )
        return current
      }

      setLimitMessage(null)
      return [...current, property]
    })
  }, [])

  const removeFromCompare = useCallback((id: string) => {
    setCompareList((current) => current.filter((item) => item.id !== id))
    setLimitMessage(null)
  }, [])

  const clearCompare = useCallback(() => {
    setCompareList([])
    setLimitMessage(null)
  }, [])

  const clearLimitMessage = useCallback(() => setLimitMessage(null), [])

  const value = useMemo(
    () => ({
      compareList,
      compareCount: compareList.length,
      isInCompare,
      canAddToCompare,
      toggleCompare,
      addToCompare,
      removeFromCompare,
      clearCompare,
      limitMessage,
      clearLimitMessage,
    }),
    [
      compareList,
      isInCompare,
      canAddToCompare,
      toggleCompare,
      addToCompare,
      removeFromCompare,
      clearCompare,
      limitMessage,
      clearLimitMessage,
    ],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompareContext() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompareContext must be used within CompareProvider')
  }
  return context
}
