import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useMemo, useState } from 'react'
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
import { ContactInquiryModal } from '@/components/properties/ContactInquiryModal'
import {
  filterByParsedRequirement,
  getDashboardStats,
  paginateProperties,
} from '@/lib/propertyFilters'
import { mapMatchedItemToListing, mergeProperties } from '@/lib/propertyMapper'
import { toRoutePropertyId } from '@/lib/listingKeys'
import { resolveDisplayEmail, resolveDisplayName } from '@/utils/profile'
import { requirementToParsed } from '@/utils/requirements'
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
  const [page, setPage] = useState(1)
  const pageSize = 6

  const displayName = resolveDisplayName(profile?.name, user)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
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

        if (!cancelled) {
          setProfile(data)
          if (latest) {
            setParsedRequirement(requirementToParsed(latest))
          }
        }
      } catch {
        // Profile is optional for dashboard browsing
      } finally {
        if (!cancelled) {
          setLoadingProfile(false)
        }
      }
    }

    void loadData()
    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently, user, setParsedRequirement])

  useEffect(() => {
    let cancelled = false

    async function loadProperties() {
      try {
        const response = await fetchProperties(1, 50)
        if (!cancelled) {
          setProperties(mergeProperties(response.items))
        }
      } catch {
        // Fall back to mock data already in context
      } finally {
        if (!cancelled) {
          setLoadingCatalog(false)
        }
      }
    }

    void loadProperties()
    return () => {
      cancelled = true
    }
  }, [setProperties])

  useEffect(() => {
    if (!parsedRequirement) {
      setSearchResults([])
      setMatchSource(null)
      return
    }

    let cancelled = false

    async function runMatch() {
      setLoadingMatches(true)
      setPage(1)

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

        const fallback = filterByParsedRequirement(properties, parsedRequirement)
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
  }, [parsedRequirement?.raw_text, properties, setParsedRequirement])

  const displayedProperties = parsedRequirement ? searchResults : properties

  const paginated = useMemo(
    () => paginateProperties(displayedProperties, page, pageSize),
    [displayedProperties, page],
  )

  const stats = useMemo(() => getDashboardStats(properties), [properties])
  const priceIndexTrend = useMemo(() => getPriceIndexTrend(properties), [properties])
  const trendingLocations = useMemo(() => getTrendingLocations(properties), [properties])
  const priceInsights = useMemo(
    () => getPriceInsights(properties, priceIndexTrend),
    [properties, priceIndexTrend],
  )

  useEffect(() => {
    setPage(1)
  }, [parsedRequirement?.raw_text])

  const isSearchMode = Boolean(parsedRequirement)
  const resultsLabel = isSearchMode
    ? matchSource === 'database'
      ? `${displayedProperties.length} matches from database`
      : matchSource === 'fallback'
        ? `${displayedProperties.length} offline matches (API unavailable)`
        : `${displayedProperties.length} listings match your AI search`
    : `${displayedProperties.length} listings available now`

  return (
    <AppShell profileName={displayName} profilePicture={profile?.picture ?? user?.picture}>
      <div className="space-y-8">
        <AISearchSection
          initialText={parsedRequirement?.raw_text ?? ''}
          onSearch={setParsedRequirement}
        />

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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {isSearchMode ? 'Matching properties' : 'Featured properties'}
                  </h2>
                  <p className="text-sm text-muted-foreground">{resultsLabel}</p>
                </div>
                {isSearchMode && matchSource === 'database' && (
                  <Badge variant="success">Database matches</Badge>
                )}
                {isSearchMode && matchSource === 'fallback' && (
                  <Badge variant="warning">Offline fallback</Badge>
                )}
                {isSearchMode && !matchSource && loadingMatches && (
                  <Badge variant="secondary">Matching…</Badge>
                )}
              </div>

              <PropertyGrid
                properties={paginated.items}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                loading={loadingCatalog || loadingMatches}
                showMatchDetails={isSearchMode && matchSource === 'database'}
                onContactProperty={setContactProperty}
                onViewProperty={(property) => navigate(`/properties/${toRoutePropertyId(property.id)}`)}
                emptyTitle="No matching properties"
                emptyDescription="Try a different prompt — mention city, BHK, budget, or buy/rent intent."
              />

              <Pagination page={page} totalPages={paginated.totalPages} onPageChange={setPage} />
            </section>
          </div>

          <div className="space-y-6">
            <CategoryBreakdown stats={stats} />
            <RecentActivityPanel properties={properties} />
          </div>
        </div>

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
