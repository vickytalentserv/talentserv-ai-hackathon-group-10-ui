import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchLatestRequirement,
  fetchMe,
  fetchProperties,
  matchProperties,
  syncProfile,
  type MeResponse,
} from '@/api/client'
import { auth0Audience } from '@/config'
import { usePropertyContext } from '@/context/PropertyContext'
import { AppShell } from '@/components/layout/AppShell'
import { AISearchSection } from '@/components/search/AISearchSection'
import {
  getPriceIndexTrend,
  getPriceInsights,
  getTrendingLocations,
} from '@/lib/priceIndex'
import {
  CategoryBreakdown,
  RecentActivityPanel,
  StatsWidgets,
} from '@/components/dashboard/StatsWidgets'
import { PriceIndexTrend } from '@/components/dashboard/PriceIndexTrend'
import { PriceInsightCards, TrendingLocations } from '@/components/dashboard/TrendingLocations'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { CompareSelectionBanner } from '@/components/properties/CompareSelectionBanner'
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import {
  filterByParsedRequirement,
  getDashboardStats,
  paginateProperties,
} from '@/lib/propertyFilters'
import { mapMatchedItemToListing, mergeProperties } from '@/lib/propertyMapper'
import { toRoutePropertyId } from '@/lib/listingKeys'
import { resolveDisplayEmail, resolveDisplayName } from '@/utils/profile'
import { Pagination } from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import type { PropertyListing } from '@/types/property'

type MatchSource = 'database' | 'fallback' | null

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = useAuth0()
  const { properties, setProperties, favorites, toggleFavorite, parsedRequirement, setParsedRequirement } =
    usePropertyContext()

  const [profile, setProfile] = useState<MeResponse | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [searchResults, setSearchResults] = useState<PropertyListing[]>([])
  const [matchSource, setMatchSource] = useState<MatchSource>(null)
  const [contactProperty, setContactProperty] = useState<PropertyListing | null>(null)
  const [savedSearchText, setSavedSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const pageSize = 6
  const searchPageSize = 4
  const propertiesRef = useRef(properties)
  propertiesRef.current = properties

  const displayName = resolveDisplayName(profile?.name, user)

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      const catalogPromise = fetchProperties(1, 12)
        .then((response) => mergeProperties(response.items))
        .catch(() => null)

      async function loadProfile() {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: auth0Audience },
        })

        let data = await fetchMe(token)
        const resolvedName = resolveDisplayName(data.name, user)
        const resolvedEmail = resolveDisplayEmail(data.email, user)
        const needsSync =
          (resolvedEmail && data.email !== resolvedEmail) ||
          (resolvedName && data.name !== resolvedName)

        if (needsSync) {
          data = await syncProfile(token, {
            email: resolvedEmail,
            name: resolvedName,
            picture: data.picture ?? undefined,
          })
        }

        const latest = await fetchLatestRequirement(token)
        return { data, latest }
      }

      const [catalog, profileResult] = await Promise.allSettled([catalogPromise, loadProfile()])

      if (cancelled) {
        return
      }

      if (catalog.status === 'fulfilled' && catalog.value) {
        setProperties(catalog.value)
      }

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value.data)
        if (profileResult.value.latest) {
          setSavedSearchText(profileResult.value.latest.raw_text)
        }
      }

      setLoadingCatalog(false)
      setLoadingProfile(false)
    }

    void loadDashboardData()
    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently, user, setProperties])

  useEffect(() => {
    if (!parsedRequirement) {
      setSearchResults([])
      setMatchSource(null)
      return
    }

    let cancelled = false

    async function runMatch() {
      setLoadingMatches(true)
      setSearchPage(1)

      try {
        const response = await matchProperties({ text: parsedRequirement!.raw_text })
        if (cancelled) {
          return
        }

        setSearchResults(response.items.map(mapMatchedItemToListing))
        setMatchSource('database')
        setParsedRequirement(response.parsed)
      } catch {
        if (cancelled) {
          return
        }

        const fallback = filterByParsedRequirement(propertiesRef.current, parsedRequirement)
        setSearchResults(fallback)
        setMatchSource('fallback')
      } finally {
        if (!cancelled) {
          setLoadingMatches(false)
        }
      }
    }

    void runMatch()
    return () => {
      cancelled = true
    }
  }, [parsedRequirement?.raw_text, setParsedRequirement])

  const isSearchMode = Boolean(parsedRequirement)
  const resultsLabel = isSearchMode
    ? matchSource === 'database'
      ? `${searchResults.length} matches from database`
      : matchSource === 'fallback'
        ? `${searchResults.length} offline matches (API unavailable)`
        : `${searchResults.length} listings match your AI search`
    : `${properties.length} listings available now`

  const paginated = useMemo(
    () => paginateProperties(properties, page, pageSize),
    [properties, page],
  )

  const searchPaginated = useMemo(
    () => paginateProperties(searchResults, searchPage, searchPageSize),
    [searchResults, searchPage],
  )

  const stats = useMemo(() => getDashboardStats(properties), [properties])
  const priceIndexTrend = useMemo(() => getPriceIndexTrend(properties), [properties])
  const trendingLocations = useMemo(() => getTrendingLocations(properties), [properties])
  const priceInsights = useMemo(
    () => getPriceInsights(properties, priceIndexTrend),
    [properties, priceIndexTrend],
  )

  useEffect(() => {
    setSearchPage(1)
  }, [parsedRequirement?.raw_text])

  return (
    <AppShell profileName={displayName} profilePicture={profile?.picture ?? user?.picture}>
      <div className="space-y-8">
        <AISearchSection
          initialText={savedSearchText || parsedRequirement?.raw_text || ''}
          onSearch={setParsedRequirement}
        />

        <CompareSelectionBanner />

        {isSearchMode && (
          <section className="space-y-5 rounded-2xl border border-border bg-card/50 p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Matching properties</h2>
                <p className="mt-1 text-muted-foreground">{resultsLabel}</p>
              </div>
              {matchSource === 'database' && <Badge variant="success">Database matches</Badge>}
              {matchSource === 'fallback' && <Badge variant="warning">Offline fallback</Badge>}
              {!matchSource && loadingMatches && <Badge variant="secondary">Matching…</Badge>}
            </div>

            <PropertyGrid
              properties={searchPaginated.items}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              loading={loadingMatches}
              variant="large"
              showCompareAction
              showMatchDetails={matchSource === 'database'}
              onContactProperty={setContactProperty}
              onViewProperty={(property) => navigate(`/properties/${toRoutePropertyId(property.id)}`)}
              emptyTitle="No matching properties"
              emptyDescription="Try a different prompt — mention city, BHK, budget, or buy/rent intent."
            />

            {searchPaginated.totalPages > 1 && (
              <Pagination
                page={searchPage}
                totalPages={searchPaginated.totalPages}
                onPageChange={setSearchPage}
              />
            )}
          </section>
        )}

        <StatsWidgets stats={stats} />

        <section className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PriceIndexTrend data={priceIndexTrend} />
            </div>
            <TrendingLocations locations={trendingLocations} />
          </div>
          <PriceInsightCards
            topCategory={priceInsights.topCategory}
            topCategoryCount={priceInsights.topCategoryCount}
            rentals={priceInsights.rentals}
            avgGrowth={priceInsights.avgGrowth}
          />
        </section>

        {!isSearchMode && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Featured properties</h2>
                    <p className="text-sm text-muted-foreground">{resultsLabel}</p>
                  </div>
                </div>

                <PropertyGrid
                  properties={paginated.items}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  loading={loadingCatalog}
                  showCompareAction
                  onContactProperty={setContactProperty}
                  onViewProperty={(property) => navigate(`/properties/${toRoutePropertyId(property.id)}`)}
                />

                <Pagination page={page} totalPages={paginated.totalPages} onPageChange={setPage} />
              </section>
            </div>

            <div className="space-y-6">
              <CategoryBreakdown stats={stats} />
              <RecentActivityPanel properties={properties} />
            </div>
          </div>
        )}

        {!loadingProfile && profile && (
          <section className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{displayName ?? 'User'}</span>
          </section>
        )}
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
