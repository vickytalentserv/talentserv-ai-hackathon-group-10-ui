import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { Section } from '@/components/layout/Section'
import { PageHeader } from '@/components/layout/PageHeader'
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
import { Button } from '@/components/ui/button'
import type { PropertyListing } from '@/types/property'

type MatchSource = 'database' | 'fallback' | null

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = useAuth0()
  const { properties, setProperties, favorites, toggleFavorite, parsedRequirement, setParsedRequirement } =
    usePropertyContext()

  const [profile, setProfile] = useState<MeResponse | null>(null)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [searchResults, setSearchResults] = useState<PropertyListing[]>([])
  const [matchSource, setMatchSource] = useState<MatchSource>(null)
  const [contactProperty, setContactProperty] = useState<PropertyListing | null>(null)
  const [savedSearchText, setSavedSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [searchPage, setSearchPage] = useState(1)
  const pageSize = 8
  const searchPageSize = 12
  const propertiesRef = useRef(properties)
  propertiesRef.current = properties

  const displayName = resolveDisplayName(profile?.name, user)

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      const catalogPromise = fetchProperties(1, 24)
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
        <PageHeader
          size="compact"
          eyebrow="Overview"
          title={displayName ? `Welcome back, ${displayName.split(' ')[0]}` : 'Dashboard'}
          description="Search with AI, track market trends, and explore featured listings."
        />

        <div className="space-y-5">
          <AISearchSection
            initialText={savedSearchText || parsedRequirement?.raw_text || ''}
            onSearch={setParsedRequirement}
          />

          {isSearchMode && (
            <Section
              title="Matching properties"
              description={resultsLabel}
              className="!space-y-4"
              action={
                <>
                  {matchSource === 'database' && <Badge variant="success">Database matches</Badge>}
                  {matchSource === 'fallback' && <Badge variant="warning">Offline fallback</Badge>}
                  {loadingMatches && <Badge variant="secondary">Matching…</Badge>}
                </>
              }
            >
              <PropertyGrid
                properties={searchPaginated.items}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                loading={loadingMatches}
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
            </Section>
          )}
        </div>

        <CompareSelectionBanner />

        <StatsWidgets stats={stats} />

        <section className="space-y-4">
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <PriceIndexTrend data={priceIndexTrend} />
            </div>
            <div className="xl:col-span-4">
              <TrendingLocations locations={trendingLocations} />
            </div>
          </div>
          <PriceInsightCards
            topCategory={priceInsights.topCategory}
            topCategoryCount={priceInsights.topCategoryCount}
            rentals={priceInsights.rentals}
            avgGrowth={priceInsights.avgGrowth}
          />
        </section>

        {!isSearchMode && (
          <>
            <Section
              title="Featured properties"
              description="Handpicked listings based on market trends"
              action={
                <Button variant="ghost" size="sm" className="text-highlight" asChild>
                  <Link to="/properties">View all →</Link>
                </Button>
              }
            >
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
            </Section>

            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryBreakdown stats={stats} />
              <RecentActivityPanel properties={properties} />
            </div>
          </>
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
