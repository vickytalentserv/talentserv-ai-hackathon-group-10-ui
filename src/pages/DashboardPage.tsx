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

type MatchSource = 'database' | 'database+llm' | 'database+relaxed' | 'fallback' | null

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
  const [matchRelaxed, setMatchRelaxed] = useState(false)
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
      setMatchRelaxed(false)
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

        const mapped = response.items.map(mapMatchedItemToListing)
        setSearchResults(filterByParsedRequirement(mapped, response.parsed, { relaxed: response.relaxed }))
        setMatchRelaxed(Boolean(response.relaxed))
        setMatchSource(
          response.source === 'database+llm'
            ? 'database+llm'
            : response.source === 'database+relaxed'
              ? 'database+relaxed'
              : 'database',
        )
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
  const filteredSearchResults = useMemo(() => {
    if (!parsedRequirement) {
      return searchResults
    }
    return filterByParsedRequirement(searchResults, parsedRequirement, { relaxed: matchRelaxed })
  }, [searchResults, parsedRequirement, matchRelaxed])

  const resultsLabel = isSearchMode
    ? matchSource === 'database+llm'
      ? `${filteredSearchResults.length} AI-ranked matches from database`
      : matchSource === 'database+relaxed'
        ? `${filteredSearchResults.length} similar matches (no exact rent listings in database)`
      : matchSource === 'database'
      ? `${filteredSearchResults.length} matches from database`
      : matchSource === 'fallback'
        ? `${filteredSearchResults.length} offline matches (API unavailable)`
        : `${filteredSearchResults.length} listings match your AI search`
    : `${properties.length} listings available now`

  const paginated = useMemo(
    () => paginateProperties(properties, page, pageSize),
    [properties, page],
  )

  const searchPaginated = useMemo(
    () => paginateProperties(filteredSearchResults, searchPage, searchPageSize),
    [filteredSearchResults, searchPage],
  )

  const analyticsProperties = useMemo(
    () => (isSearchMode ? filteredSearchResults : properties),
    [isSearchMode, filteredSearchResults, properties],
  )

  const stats = useMemo(
    () => getDashboardStats(analyticsProperties, isSearchMode ? parsedRequirement?.city : null),
    [analyticsProperties, isSearchMode, parsedRequirement?.city],
  )
  const priceIndexTrend = useMemo(() => getPriceIndexTrend(analyticsProperties), [analyticsProperties])
  const trendingLocations = useMemo(
    () => getTrendingLocations(analyticsProperties, isSearchMode ? parsedRequirement?.city : null),
    [analyticsProperties, isSearchMode, parsedRequirement?.city],
  )
  const priceInsights = useMemo(
    () => getPriceInsights(analyticsProperties, priceIndexTrend),
    [analyticsProperties, priceIndexTrend],
  )

  const searchCityLabel = parsedRequirement?.city
    ? parsedRequirement.city.charAt(0).toUpperCase() + parsedRequirement.city.slice(1)
    : null

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

          {isSearchMode && parsedRequirement?.parser.includes('llm') && (
            <div className="flex flex-wrap items-center gap-2 px-1">
              <Badge variant="outline">OpenAI-enhanced search query</Badge>
            </div>
          )}

          {isSearchMode && (
            <Section
              title="Matching properties"
              description={resultsLabel}
              className="!space-y-4"
              action={
                <>
                  {matchSource === 'database+relaxed' && (
                    <Badge variant="warning">Similar matches — upload or scrape rent listings for exact results</Badge>
                  )}
                  {matchSource === 'database+llm' && <Badge variant="success">OpenAI-ranked matches</Badge>}
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
                showMatchDetails={matchSource === 'database' || matchSource === 'database+llm' || matchSource === 'database+relaxed'}
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

        <StatsWidgets stats={stats} searchContext={isSearchMode} />

        <section className="space-y-4">
          {isSearchMode && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Market insights from your search</Badge>
              {searchCityLabel && (
                <Badge variant="outline">Filtered for {searchCityLabel}</Badge>
              )}
            </div>
          )}
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <PriceIndexTrend
                data={priceIndexTrend}
                description={
                  isSearchMode
                    ? `Average price per sq.ft for ${analyticsProperties.length} matching listings`
                    : undefined
                }
              />
            </div>
            <div className="xl:col-span-4">
              <TrendingLocations
                locations={trendingLocations}
                description={
                  isSearchMode
                    ? searchCityLabel
                      ? `Localities in ${searchCityLabel} from your matching results`
                      : 'Localities in your matching results'
                    : undefined
                }
              />
            </div>
          </div>
          <PriceInsightCards
            topCategory={priceInsights.topCategory}
            topCategoryCount={priceInsights.topCategoryCount}
            rentals={priceInsights.rentals}
            avgGrowth={priceInsights.avgGrowth}
            searchContext={isSearchMode}
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
