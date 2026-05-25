import { type ReactNode, useEffect, useMemo, useState } from 'react'
import './App.css'
import buildersJson from './data/builders.json'
import propertiesJson from './data/properties.json'
import sentimentJson from './data/sentiment.json'
import trendsJson from './data/trends.json'
import {
  createDemoUser,
  getStoredDemoUser,
  getSupabaseClient,
  isSupabaseConfigured,
  mapSupabaseUser,
  signInWithGoogle,
  signOut,
  type AppUser,
} from './lib/auth'
import { buildDashboardModel } from './lib/intelligence'
import { parseRequirement } from './lib/requirementParser'
import type {
  BuilderProfile,
  DashboardModel,
  EnrichedProperty,
  ParsedRequirement,
  RawPropertyListing,
  SentimentInsight,
  TrendInsight,
} from './types'

const properties = propertiesJson as RawPropertyListing[]
const builders = buildersJson as BuilderProfile[]
const sentiments = sentimentJson as SentimentInsight[]
const trends = trendsJson as TrendInsight[]

const exampleQueries = [
  'Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move. Near IT parks.',
  'Need a rental apartment near Whitefield Bangalore, 2 or 3 BHK, budget under 45k per month.',
  'Compare new projects in Wakad and Baner for investment under 1.2 crore.',
]

function App() {
  const [user, setUser] = useState<AppUser | null>(() => getStoredDemoUser())
  const [isCheckingAuth, setIsCheckingAuth] = useState(isSupabaseConfigured)
  const [query, setQuery] = useState(exampleQueries[0])
  const [dashboard, setDashboard] = useState<DashboardModel>(() =>
    buildDashboardModel(parseRequirement(exampleQueries[0]), properties, builders, sentiments, trends),
  )

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return undefined
    }

    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return
      }
      if (data.session?.user) {
        setUser(mapSupabaseUser(data.session.user))
      }
      setIsCheckingAuth(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : getStoredDemoUser())
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const stats = useMemo(
    () => ({
      cleaned: dashboard.cleanedProperties.length,
      duplicates: dashboard.duplicateGroups.reduce((total, group) => total + group.propertyIds.length - 1, 0),
      matches: dashboard.matchingProperties.length,
      confidence: dashboard.requirement.confidence,
    }),
    [dashboard],
  )

  function handleAnalyze() {
    setDashboard(buildDashboardModel(parseRequirement(query), properties, builders, sentiments, trends))
  }

  async function handleLogout() {
    await signOut()
    setUser(null)
  }

  if (isCheckingAuth) {
    return <main className="auth-shell">Checking protected dashboard access...</main>
  }

  if (!user) {
    return <LoginScreen onDemoLogin={() => setUser(createDemoUser())} />
  }

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <nav className="topbar" aria-label="Application">
          <span className="brand">EstateIntel Agent</span>
          <div className="user-chip">
            <span>{user.name}</span>
            <small>{user.email}</small>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="hero-grid">
          <div>
            <p className="eyebrow">Agentic Programming Hackathon MVP</p>
            <h1>Real Estate Property Intelligence Dashboard</h1>
            <p className="hero-copy">
              Parse natural-language requirements, clean and deduplicate listings, enrich them with builder,
              sentiment, and trend context, then rank recommended properties.
            </p>
          </div>
          <div className="auth-note">
            <strong>Protected dashboard</strong>
            <span>Signed in with {user.provider}. Supabase Google OAuth is used when configured.</span>
          </div>
        </div>
      </header>

      <section className="query-panel" aria-labelledby="query-title">
        <div>
          <p className="eyebrow">Requirement input</p>
          <h2 id="query-title">Tell the agent what you need</h2>
        </div>
        <textarea value={query} onChange={(event) => setQuery(event.target.value)} rows={4} />
        <div className="query-actions">
          <button type="button" className="primary" onClick={handleAnalyze}>
            Analyze requirement
          </button>
          <div className="example-buttons" aria-label="Example requirements">
            {exampleQueries.map((example) => (
              <button key={example} type="button" onClick={() => setQuery(example)}>
                Use example
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="metric-grid" aria-label="Pipeline metrics">
        <MetricCard label="Parser confidence" value={`${stats.confidence}%`} />
        <MetricCard label="Cleaned listings" value={stats.cleaned.toString()} />
        <MetricCard label="Duplicate records removed" value={stats.duplicates.toString()} />
        <MetricCard label="Matching properties" value={stats.matches.toString()} />
      </section>

      <section className="dashboard-grid">
        <Widget title="Requirement Summary">
          <RequirementSummary requirement={dashboard.requirement} />
        </Widget>

        <Widget title="Recommendation Summary">
          <p>{dashboard.recommendationSummary}</p>
          <ol className="recommendation-list">
            {dashboard.matchingProperties.slice(0, 3).map((property) => (
              <li key={property.propertyId}>
                <strong>{property.title}</strong>
                <ScoreBadge score={property.recommendationScore} />
                <span>{property.recommendationReasons.slice(0, 2).join(' ')}</span>
              </li>
            ))}
          </ol>
        </Widget>

        <Widget title="Price Comparison" wide>
          <PropertyTable properties={dashboard.matchingProperties} />
        </Widget>

        <Widget title="Locality Comparison">
          <div className="comparison-list">
            {dashboard.localityComparison.map((locality) => (
              <article key={locality.locality} className="mini-card">
                <strong>{locality.locality}</strong>
                <span>{locality.matches} matched listing(s)</span>
                <span>Avg price: {formatCurrency(locality.averagePrice)}</span>
                <span>Avg psf: {formatCurrency(locality.averagePricePerSqft)}</span>
                <span>Trend: {locality.averageTrendScore}/100</span>
              </article>
            ))}
          </div>
        </Widget>

        <Widget title="Builder / Project Reputation">
          <InsightCards properties={dashboard.matchingProperties} mode="builder" />
        </Widget>

        <Widget title="Sentiment Summary">
          <InsightCards properties={dashboard.matchingProperties} mode="sentiment" />
        </Widget>

        <Widget title="Trend Context">
          <InsightCards properties={dashboard.matchingProperties} mode="trend" />
        </Widget>

        <Widget title="Cleanup and Deduplication Evidence">
          <div className="evidence-list">
            <p>
              {dashboard.cleanedProperties.length} normalized canonical listings are available from {properties.length}{' '}
              source records.
            </p>
            {dashboard.duplicateGroups.map((group) => (
              <article key={group.groupId} className="mini-card">
                <strong>{group.groupId}</strong>
                <span>Canonical: {group.canonicalPropertyId}</span>
                <span>Records: {group.propertyIds.join(', ')}</span>
                <span>{group.reason}</span>
              </article>
            ))}
          </div>
        </Widget>
      </section>
    </main>
  )
}

function LoginScreen({ onDemoLogin }: { onDemoLogin: () => void }) {
  const [authError, setAuthError] = useState<string | null>(null)

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to start Google sign-in.')
    }
  }

  return (
    <main className="auth-shell">
      <section className="login-card">
        <p className="eyebrow">Third-party authentication</p>
        <h1>Sign in to view the property intelligence dashboard</h1>
        <p>
          The dashboard route is protected. Configure Supabase Auth with Google OAuth for production demos, or use
          the no-password local demo identity for offline judging.
        </p>
        <div className="login-actions">
          <button type="button" className="primary" onClick={handleGoogleLogin} disabled={!isSupabaseConfigured}>
            Continue with Google via Supabase
          </button>
          <button type="button" onClick={onDemoLogin}>
            Use local demo identity
          </button>
        </div>
        {!isSupabaseConfigured && (
          <p className="warning">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable third-party OAuth in this environment.
          </p>
        )}
        {authError && <p className="warning">{authError}</p>}
      </section>
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function Widget({ title, wide = false, children }: { title: string; wide?: boolean; children: ReactNode }) {
  return (
    <section className={`widget${wide ? ' wide' : ''}`}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function RequirementSummary({ requirement }: { requirement: ParsedRequirement }) {
  const rows = [
    ['City', requirement.city ?? 'Not specified'],
    ['Locality', requirement.localities.join(', ') || 'Not specified'],
    ['Transaction', requirement.transactionType ?? 'Not specified'],
    ['BHK', requirement.bhk.join(' or ') || 'Not specified'],
    ['Budget max', requirement.budgetMax ? formatCurrency(requirement.budgetMax) : 'Not specified'],
    ['Property type', requirement.propertyType ?? 'Not specified'],
    ['Status preference', requirement.statusPreference ?? 'Not specified'],
    ['Notes', requirement.preferenceNotes.join(', ') || 'None'],
  ]

  return (
    <dl className="summary-list">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function PropertyTable({ properties }: { properties: EnrichedProperty[] }) {
  if (properties.length === 0) {
    return <p>No matching properties. Try broadening the filters.</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Locality</th>
            <th>Price</th>
            <th>Area</th>
            <th>PSF</th>
            <th>Builder</th>
            <th>Fit</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.propertyId}>
              <td>
                <strong>{property.title}</strong>
                <span>{property.source}</span>
              </td>
              <td>{property.locality}</td>
              <td>{formatCurrency(property.price)}</td>
              <td>{formatNumber(property.areaSqft)} sqft</td>
              <td>{formatCurrency(property.pricePerSqft)}</td>
              <td>{property.builderOrOwner}</td>
              <td>
                <ScoreBadge score={property.recommendationScore} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InsightCards({ properties, mode }: { properties: EnrichedProperty[]; mode: 'builder' | 'sentiment' | 'trend' }) {
  const uniqueProjects = dedupeByProject(properties).slice(0, 4)
  if (uniqueProjects.length === 0) {
    return <p>No insight cards are available for the current filter set.</p>
  }

  return (
    <div className="comparison-list">
      {uniqueProjects.map((property) => (
        <article key={`${mode}-${property.propertyId}`} className="mini-card">
          {mode === 'builder' && (
            <>
              <strong>{property.builderProfile?.builderOrOwner ?? property.builderOrOwner}</strong>
              <span>{property.projectName}</span>
              <span>Reputation: {property.builderProfile?.reputationScore ?? 'N/A'}/100</span>
              <span>{property.builderProfile?.reviewSummary ?? 'No profile available.'}</span>
            </>
          )}
          {mode === 'sentiment' && (
            <>
              <strong>{property.projectName}</strong>
              <span>Sentiment: {property.sentiment?.sentimentScore ?? 'N/A'}/100</span>
              <span>{property.sentiment?.sentimentSummary ?? 'No sentiment sample available.'}</span>
              <span>Positive: {property.sentiment?.positiveThemes.join(', ') ?? 'N/A'}</span>
            </>
          )}
          {mode === 'trend' && (
            <>
              <strong>{property.locality}</strong>
              <span>{property.trend?.keyword ?? 'Trend keyword unavailable'}</span>
              <span>
                Score: {property.trend?.trendScore ?? 'N/A'}/100 {property.trend?.trendDirection ?? ''}
              </span>
              <span>{property.trend?.trendSummary ?? 'No trend sample available.'}</span>
            </>
          )}
        </article>
      ))}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  return <span className="score-badge">{score}/100</span>
}

function dedupeByProject(properties: EnrichedProperty[]): EnrichedProperty[] {
  const seen = new Set<string>()
  return properties.filter((property) => {
    const key = `${property.projectName}-${property.locality}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export default App
