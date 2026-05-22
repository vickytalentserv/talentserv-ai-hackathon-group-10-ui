# Real Estate Property Intelligence Dashboard — Frontend Skills & Standards

> **Source:** Agentic Programming Hackathon — Challenge 1 (Real Estate Property Intelligence)  
> **Stack:** React 19 + TypeScript + Vite (this repository)  
> **Use this file** when implementing UI, integrating APIs, or guiding AI-assisted development for this challenge.

---

# Project Overview

## Summary

Build a **real estate property intelligence dashboard** where a logged-in user enters a **natural-language property requirement**. The app ingests or loads property data (permitted sources or fallback datasets), normalizes and deduplicates listings, enriches them with builder reputation, public sentiment, and trend context, and presents a **comparative dashboard with ranked recommendations**.

## End-to-End Flow

```
User requirement → requirement parsing → data ingestion → cleanup/deduplication
→ enrichment → comparative dashboard → recommendation summary
```

## Core MVP Pillars (Hackathon)

| Pillar | Frontend responsibility |
|--------|-------------------------|
| Third-party authentication | Login/logout UI, protected routes, session display |
| Functional implementation | Requirement input, parsed criteria display, all dashboard widgets |
| Test cases | Unit/integration tests for parsing display, dashboard logic, auth guards |
| Deployment | Hosted demo (preferred) or local runnable with clear README |

## Problem Statement

Property buyers compare listings across portals, builder pages, locality discussions, YouTube reviews, price trends, and search-interest signals. The UI must provide **one comparative view** that evaluates properties against the user’s stated requirements.

## MVP Functional Areas (UI Must Support)

| Area | User-facing outcome |
|------|---------------------|
| Authentication | Third-party login/logout; dashboard only when authenticated |
| Requirement input | Free-text natural-language property search |
| Requirement parsing | Visible structured fields after submit |
| Data presentation | Matching properties, comparisons, enrichment panels |
| Dashboard | All required widgets (see UI/UX Standards) |
| Recommendations | Ranked top properties with explanations |

## Natural-Language Input Examples

- *"Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move."*
- *"Need a rental apartment near Whitefield Bangalore, 2 or 3 BHK, budget under 45k per month."*
- *"Compare new projects in Wakad and Baner for investment under 1.2 crore."*

## Parsed Requirement Fields (Display After Parse)

| Field | Example |
|-------|---------|
| `city` | Pune |
| `locality` | Hinjewadi |
| `transaction_type` | Buy |
| `bhk` | 2 |
| `budget_max` | 8000000 |
| `property_type` | Apartment |
| `status_preference` | Ready to Move |
| `preference_notes` | Near IT parks |

## Property Record Fields (List/Detail Views)

| Field | Example |
|-------|---------|
| `property_id` | PROP001 |
| `title` | 2 BHK Apartment in Hinjewadi |
| `source` | Housing / MagicBricks / NoBroker |
| `source_url` | Listing URL |
| `city` | Pune |
| `locality` | Hinjewadi |
| `property_type` | Apartment |
| `transaction_type` | Buy / Rent |
| `bhk` | 2 |
| `price` | 7800000 |
| `area_sqft` | 850 |
| `status` | Ready to Move |
| `builder_or_owner` | ABC Developers |
| `project_name` | Green Heights |

## Enrichment Data (Separate UI Sections)

| Enrichment | UI shows |
|------------|----------|
| Builder/project reputation | Builder name, project name, reputation score, completion track record, review summary, known risks |
| Sentiment/public opinion | Sentiment score, positive/negative themes, comment count, summary |
| Trend/demand context | Keyword, trend score, direction, compared localities, trend summary |

## Evaluation Weights (Frontend Impact)

| Area | Weight | Frontend focus |
|------|--------|------------------|
| Authentication & protected access | 10% | Auth provider integration, route guards |
| Functional implementation | 30% | Complete dashboard flow |
| Data collection, cleanup, deduplication | 15% | Show cleaned data, dedup indicators, source badges |
| Comparative dashboard usefulness | 15% | All widgets, clear comparisons |
| Builder/sentiment/trend enrichment | 10% | Dedicated panels per enrichment type |
| Test cases & validation | 10% | 5–10+ frontend/backend tests |
| Agentic programming evidence | 10% | Document AI usage in README |

## Out of Scope for Frontend (Backend/Data Team)

- Live scraping implementation (respect robots.txt, ToS, rate limits)
- Custom password storage (forbidden — use third-party auth only)
- Collecting private phone numbers or sensitive contact data

## Compliance (Surface in UI Copy / README)

- Show **source name and URL** on listings where available
- Demo must work with **fallback CSV/JSON** if live sources fail
- Submission must include a **compliance note** on data sources (README section)

---

# Frontend Architecture

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                      │
├─────────────────────────────────────────────────────────────┤
│  Routes: Public (Login) │ Protected (Dashboard, Detail)      │
├─────────────────────────────────────────────────────────────┤
│  Auth Layer: Auth0 / Clerk / Firebase / Supabase SDK        │
├─────────────────────────────────────────────────────────────┤
│  State: Server state (TanStack Query) + UI state (context)  │
├─────────────────────────────────────────────────────────────┤
│  API Client: Typed fetch/axios → Backend REST/GraphQL       │
├─────────────────────────────────────────────────────────────┤
│  Presentation: Pages → Feature modules → Shared components  │
└─────────────────────────────────────────────────────────────┘
```

## Route Structure

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | Third-party auth entry |
| `/` or `/dashboard` | Protected | Main comparative dashboard |
| `/properties/:id` | Protected | Optional property detail drill-down |
| `/callback` | Public | OAuth redirect handler (if required by provider) |

## Protected Route Pattern

- Wrap dashboard routes in an **auth guard** that redirects unauthenticated users to `/login`
- Show **loading** state while auth session is resolving
- Never render property data or requirement history until session is confirmed

## Feature Modules

| Module | Responsibility |
|--------|----------------|
| `auth` | Login/logout, session, user profile chip |
| `requirement` | NL input form, parse API call, parsed criteria card |
| `properties` | Matching list, filters, sort, dedup badges |
| `comparison` | Price/locality charts and tables |
| `enrichment` | Builder, sentiment, trend panels |
| `recommendations` | Ranked list with explanation text |

## Data Flow (Frontend)

1. User submits natural-language requirement → `POST /api/requirements/parse` (or equivalent)
2. Display parsed structured fields immediately (optimistic or after response)
3. Trigger search/analysis → `POST /api/properties/search` with parsed filters
4. Poll or await enrichment → `GET /api/analysis/:jobId` or single aggregated response
5. Render dashboard widgets from normalized **view models** (not raw API shapes in components)

## Separation of Concerns

| Layer | Rule |
|-------|------|
| **Pages** | Layout, route params, compose features |
| **Features** | Business UI for one domain (requirement, dashboard) |
| **Components** | Presentational, reusable, no direct API calls |
| **Hooks** | Data fetching, auth, form logic |
| **Services/API** | HTTP calls, types, error mapping |
| **Utils** | Formatting (INR, sqft, BHK labels), validators |

## Optional Runtime AI (Frontend)

Runtime AI is **optional but recommended** for:

- Requirement parsing preview (if backend delegates to AI)
- Sentiment summarization display
- Recommendation explanation rendering
- Query refinement follow-up questions (bonus)

Do not block MVP on client-side LLM calls; prefer **backend-mediated AI** with typed responses.

## Environment Configuration

```env
VITE_API_BASE_URL=
VITE_AUTH_DOMAIN=
VITE_AUTH_CLIENT_ID=
VITE_AUTH_AUDIENCE=
```

Never commit secrets; document setup in README **Auth configuration notes**.

---

# UI/UX Standards

## Dashboard Widgets (All Required for MVP)

| Widget | Purpose | Minimum content |
|--------|---------|-----------------|
| **Requirement Summary** | Show parsed user requirement | All extracted fields + original query |
| **Matching Properties** | List properties matching filters | Sortable table/cards with key fields |
| **Price Comparison** | Compare price and price/sqft | Chart or table by property/locality |
| **Locality Comparison** | Side-by-side localities | Metrics across selected areas |
| **Builder/Project Reputation** | Trust signals | Score or summary per builder/project |
| **Sentiment Summary** | Public opinion | Positive/negative themes, score |
| **Trend Context** | Demand/search interest | Trend score, direction, locality comparison |
| **Top Recommended Properties** | Ranked outcomes | Rank, property summary, **why recommended** |

## Layout Principles

- **Above the fold:** Requirement input (or summary) + top 3 recommendations
- **Progressive disclosure:** Summary cards → expand for full tables/charts
- **Mobile-first responsive:** Stack widgets vertically on small screens; 2-column grid on tablet+
- **Consistent hierarchy:** Page title → section headings → widget titles → data

## User Journey (Demo Script Alignment)

1. Login via third-party auth
2. Enter natural-language requirement
3. Show parsed requirement (editable optional for bonus)
4. Loading states while data loads
5. Show matching properties (post-cleanup/dedup)
6. Show enrichment sections (builder, sentiment, trend)
7. Show comparative dashboard + recommendation summary

## Loading, Empty, and Error States

| State | UX requirement |
|-------|----------------|
| Loading | Skeleton loaders per widget; global progress for long ingestion |
| Empty | Actionable copy: "Adjust your requirement" or "No matches in fallback dataset" |
| Error | User-safe message + retry; log technical detail to console only |
| Partial data | Show available widgets; badge incomplete records |

## Accessibility

- WCAG 2.1 AA target: color contrast, focus rings, keyboard navigation
- All icons with `aria-hidden` or `aria-label`
- Form fields linked to `<label>` or `aria-labelledby`
- Charts need text alternatives (table fallback or `aria-describedby` summary)
- Don’t rely on color alone for sentiment (use icons + labels)

## Data Display Conventions

| Data type | Display format |
|-----------|----------------|
| Price (buy) | `₹80 L`, `₹1.2 Cr` with full number in tooltip |
| Price (rent) | `₹45,000 / month` |
| Area | `850 sq.ft.` |
| BHK | `2 BHK` |
| Status | Ready to Move / Under Construction / Resale |
| Source | Badge + external link (opens `source_url` in new tab) |
| Dedup | "Also listed on …" or duplicate cluster indicator |

## Visual Identity

- Professional real-estate aesthetic: trustworthy blues/greens, neutral backgrounds
- High information density without clutter — use cards, tabs, or accordions for widgets
- Indian locale defaults: INR, lakh/crore shorthand, city/locality labels

---

# Component Standards

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component file | PascalCase | `RequirementSummary.tsx` |
| Component export | Named or default PascalCase | `export function RequirementSummary()` |
| Props interface | `ComponentNameProps` | `RequirementSummaryProps` |
| Hooks | `use` prefix | `useParsedRequirement.ts` |
| Test files | Same name + `.test.tsx` | `RequirementSummary.test.tsx` |

## Component Categories

### 1. UI Primitives (`components/ui/`)

Buttons, inputs, cards, badges, skeletons, tables — **no business logic**.

### 2. Domain Components (`components/domain/`)

`PropertyCard`, `ParsedRequirementChip`, `SourceBadge`, `SentimentThemeList`, `RecommendationCard`.

### 3. Widgets (`components/widgets/`)

One widget per dashboard section; receives typed props only.

### 4. Layout (`components/layout/`)

`AppShell`, `DashboardGrid`, `ProtectedLayout`, `HeaderUserMenu`.

## Component Rules

- **Single responsibility** — one widget ≈ one user-facing purpose
- **Props over context** for widget data; context only for auth/theme
- **No API calls inside presentational components** — use hooks/containers
- **Colocate styles** with component (CSS module or co-located CSS)
- Export **types** for all public props

## Required Domain Components (MVP)

```
RequirementInputForm
ParsedRequirementSummary
PropertyList / PropertyCard
PriceComparisonChart (or table)
LocalityComparisonPanel
BuilderReputationPanel
SentimentSummaryPanel
TrendContextPanel
TopRecommendationsList
RecommendationExplanation
AuthLoginButton / UserMenu
ProtectedRoute
LoadingSkeleton / EmptyState / ErrorBanner
```

## Container/Presentational Split (Recommended)

```tsx
// containers/RequirementSection.tsx — fetches data
// components/widgets/RequirementSummary.tsx — pure UI
```

## Props Documentation

Every shared component documents required props in JSDoc:

```tsx
/** Displays normalized parsed requirement fields from the parse API. */
export interface ParsedRequirementSummaryProps {
  requirement: ParsedRequirement;
  originalQuery: string;
  isLoading?: boolean;
}
```

---

# Styling Standards

## Approach

Prefer **CSS Modules** or **Tailwind CSS** (if added) — pick one and stay consistent. Current repo uses plain CSS; migrating to Tailwind is acceptable if documented in README.

## Design Tokens (Define in `:root` or theme file)

```css
:root {
  --color-primary: #1e40af;
  --color-success: #059669;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-surface: #f8fafc;
  --color-border: #e2e8f0;
  --radius-md: 8px;
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.1);
  --font-sans: system-ui, sans-serif;
}
```

## Spacing & Grid

- Base unit: **4px** (multiples: 4, 8, 12, 16, 24, 32)
- Dashboard grid: CSS Grid `repeat(auto-fit, minmax(320px, 1fr))`
- Max content width: **1280px** centered

## Component Styling Rules

- No inline styles except dynamic values (chart dimensions)
- BEM-like or module class names: `propertyCard`, `propertyCard__price`
- Responsive breakpoints: `640px`, `768px`, `1024px`, `1280px`
- Print-friendly optional for export bonus (future)

## Charts & Tables

- Tables: zebra rows, sticky header on scroll
- Charts: consistent palette; legend always visible; tooltips with full values

## Dark Mode

Optional for hackathon; if implemented, use CSS variables and `prefers-color-scheme`.

---

# Form Standards

## Primary Form: Natural-Language Requirement

| Field | Type | Validation |
|-------|------|------------|
| `query` | `textarea` | Required, min 10 chars, max 2000 chars |
| Submit | button | Disabled while loading or empty |

### UX

- Placeholder with example query from challenge brief
- Character count optional
- Submit on **Ctrl/Cmd + Enter** (document in UI hint)
- Clear button resets form and dashboard state

### Post-Submit

- Show parsed fields in read-only summary (editable = bonus)
- Allow **re-run** with modified query without full page reload

## Secondary Forms (Optional / Bonus)

- Filter refinements (BHK, budget slider, locality multi-select)
- Follow-up questions from AI query refinement

## Validation Strategy

| Layer | Responsibility |
|-------|----------------|
| Client | Required fields, length, basic format |
| Server | Authoritative parse result; display server validation errors |
| Display | Field-level errors under inputs; form-level `role="alert"` |

## Form State Management

- Use **React Hook Form** + **Zod** (recommended) or controlled `useState` for MVP
- Debounce optional for live parse preview (bonus)

## Error Messages (User-Facing)

| Code | Message |
|------|---------|
| Empty query | "Please describe the property you're looking for." |
| Parse failed | "We couldn't understand that requirement. Try adding city, BHK, and budget." |
| Network | "Connection issue. Please try again." |

---

# API & Data Handling

## Expected Backend Endpoints (Contract — Adapt to Actual API)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/session` | Optional session verify |
| `POST` | `/api/requirements/parse` | NL → structured requirement |
| `POST` | `/api/properties/search` | Search with parsed filters |
| `GET` | `/api/properties/:id` | Property detail |
| `GET` | `/api/analysis/dashboard` | Aggregated dashboard payload |
| `GET` | `/api/enrichment/builder/:projectId` | Builder reputation |
| `GET` | `/api/enrichment/sentiment` | Sentiment summary |
| `GET` | `/api/enrichment/trends` | Trend context |
| `GET` | `/api/recommendations` | Ranked list + explanations |

Frontend must use **typed interfaces** matching backend OpenAPI or shared types package.

## TypeScript Models (Frontend)

```typescript
export interface ParsedRequirement {
  city: string | null;
  locality: string | null;
  transaction_type: 'Buy' | 'Rent' | null;
  bhk: number | null;
  budget_max: number | null;
  property_type: string | null;
  status_preference: string | null;
  preference_notes: string | null;
}

export interface Property {
  property_id: string;
  title: string;
  source: string;
  source_url?: string;
  city: string;
  locality: string;
  property_type: string;
  transaction_type: 'Buy' | 'Rent';
  bhk: number;
  price: number;
  area_sqft: number;
  status: string;
  builder_or_owner?: string;
  project_name?: string;
  price_per_sqft?: number;
  is_duplicate?: boolean;
  duplicate_sources?: string[];
  is_incomplete?: boolean;
}

export interface Recommendation {
  rank: number;
  property_id: string;
  score: number;
  explanation: string;
  property: Property;
}
```

## Client Data Normalization (Display Layer)

Even if backend normalizes data, frontend utilities should handle:

| Input variants | Normalized display |
|----------------|-------------------|
| `Rs 80 L`, `80 Lac`, `0.8 Cr` | `₹80,00,000` |
| `850 sq.ft.` | `850 sq.ft.` |
| `2 BHK Flat` | `2 BHK` |
| `Hinjawadi` / `Hinjewadi` | Consistent label from API |

## Fetching Strategy

- **TanStack Query (React Query)** for caching, retries, loading/error states
- Stale time: 5 min for property lists; 0 for fresh search after new requirement
- Invalidate queries on new requirement submit

## Fallback / Offline Demo Mode

- If API unavailable, load `public/data/properties.sample.json` via `import` or `fetch`
- Environment flag: `VITE_USE_MOCK_DATA=true`
- UI shows banner: "Demo mode — sample dataset"

## Source Attribution

Every property row/card shows:

- `source` as badge
- Link to `source_url` when present (`rel="noopener noreferrer"`)

---

# Frontend Security

## Authentication

| Rule | Implementation |
|------|----------------|
| Third-party auth only | Auth0, Clerk, Firebase, Supabase, Azure Entra, Google — **no custom passwords** |
| No password storage | Never `localStorage` raw credentials |
| Token handling | Use provider SDK; prefer HTTP-only cookies if BFF pattern |
| Protected routes | Redirect unauthenticated users before data fetch |
| Logout | Clear session + invalidate React Query cache |

## Authorization

- Send **Bearer token** or session cookie per backend contract
- Do not expose API keys for backend services in frontend bundle
- Only `VITE_*` public env vars in client

## XSS & Content Safety

- Never `dangerouslySetInnerHTML` for user query or scraped listing text without sanitization
- Sanitize markdown/HTML in sentiment summaries (DOMPurify if rendering HTML)
- External links: `target="_blank"` + `rel="noopener noreferrer"`

## Data Privacy

- Do not display or collect personal phone numbers, private profiles, or sensitive contacts
- User identity: show only name/email from auth provider claims

## CORS & API

- Configure allowed origins on backend; frontend uses single `VITE_API_BASE_URL`

## Dependency Security

- Run `npm audit` before submission
- Pin major auth SDK versions in README

---

# Performance Standards

## Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 2s on 4G |
| Time to Interactive | < 4s |
| Dashboard render after data | < 500ms for 50 properties |
| Bundle size (initial) | < 300KB gzipped (excluding charts) |

## Techniques

- **Code splitting:** `React.lazy` for dashboard routes and chart libraries
- **Virtualization:** `react-window` / `@tanstack/react-virtual` for long property lists
- **Memoization:** `useMemo` for sorted/filtered lists; `React.memo` for `PropertyCard`
- **Debounce** search refinements (300ms)
- **Image optimization:** lazy load listing thumbnails; fixed aspect ratio placeholders

## Data Performance

- Paginate or virtualize tables beyond 25 rows
- Aggregate dashboard API preferred over 8 sequential calls
- Cache enrichment data per locality/project key

## Lighthouse (Submission Quality)

- Aim 80+ Performance, 90+ Accessibility on dashboard page

---

# Recommended Libraries

## Core (Already in Repo)

| Library | Use |
|---------|-----|
| React 19 | UI |
| TypeScript | Type safety |
| Vite | Build/dev |

## Strongly Recommended Additions

| Library | Purpose |
|---------|---------|
| `react-router-dom` | Routing, protected routes |
| `@auth0/auth0-react` or `@clerk/clerk-react` or `firebase/auth` or `@supabase/supabase-js` | Third-party auth (pick one) |
| `@tanstack/react-query` | Server state, caching |
| `react-hook-form` + `zod` | Forms + validation |
| `recharts` or `chart.js` + `react-chartjs-2` | Price/locality comparisons |
| `@tanstack/react-table` | Sortable property tables |
| `date-fns` | Date formatting if needed |
| `clsx` | Conditional class names |

## Optional (Bonus / Quality)

| Library | Purpose |
|---------|---------|
| `dompurify` | Sanitize HTML summaries |
| `@tanstack/react-virtual` | List virtualization |
| `jspdf` / `html2canvas` | Export report bonus |
| `playwright` or `cypress` | E2E tests |
| `vitest` + `@testing-library/react` | Unit/integration tests |
| `msw` | API mocking in tests and demo |

## Avoid

- Custom auth/password libraries
- Heavy UI kits that bloat bundle unless time-boxed
- Client-side scraping libraries (compliance risk; data comes from backend)

---

# AI Coding Rules

## Agentic Programming Expectations (Hackathon)

AI tools (Cursor, Copilot, Claude, etc.) are **required** in the development workflow. Document evidence in README.

| Stage | Expected AI-assisted work |
|-------|---------------------------|
| Requirement breakdown | Scope, user stories, assumptions |
| Architecture | Data model, ingestion flow, **dashboard layout** |
| Implementation | Components, hooks, API client, refactors |
| Data cleanup UI | Display logic for dedup/incomplete flags |
| Testing | Generate test cases for parsing display, dashboard |
| Review | AI-assisted review and at least **one iteration** from feedback |

## Rules for AI Agents Working This Repo

1. **Read `skills.md` first** before implementing features.
2. **Implement MVP widgets** before bonus features.
3. **Never** implement custom password auth or credential storage.
4. **Never** add client-side scraping of MagicBricks/Housing/etc.; consume backend API or mock JSON.
5. **Match types** in API & Data Handling section; ask before inventing field names.
6. **Every widget** from UI/UX Standards must exist before polish.
7. **Minimize scope** — small focused PRs; no unrelated refactors.
8. **Follow folder structure** below strictly.
9. **Include tests** when adding parsing display logic, formatters, dashboard selectors, auth guard.
10. **Document** env vars and auth setup in README when adding dependencies.
11. **Prefer** existing patterns in codebase over new abstractions.
12. **Show source attribution** on all property UIs.
13. **Handle** loading, empty, error states for every async widget.
14. **Use** Indian currency and real-estate formatting utilities consistently.
15. **Capture** agentic evidence: prompt summaries, what AI generated vs human-edited.

## Prompt Templates for AI

### Dashboard layout

> "Create a responsive dashboard grid with widgets: Requirement Summary, Matching Properties, Price Comparison, Locality Comparison, Builder Reputation, Sentiment Summary, Trend Context, Top Recommendations. Use TypeScript, CSS modules, and props from skills.md types."

### Component generation

> "Build PropertyCard showing title, BHK, price (INR lakh format), area, status, source badge with external link, and duplicate indicator. No API calls — props only."

### Test generation

> "Write vitest tests for formatPrice, formatBhk, and dashboard recommendation sort order per skills.md."

## Runtime AI (Optional)

If integrating runtime AI in frontend:

- Call backend endpoints only; never embed LLM API keys
- Show streaming explanation text in `RecommendationExplanation`
- Fallback to static explanation if AI unavailable

---

# Folder Structure

## Target Structure

```
talentserv-ai-hackathon-group-10-ui/
├── public/
│   ├── data/                          # Fallback sample datasets
│   │   ├── properties.sample.json
│   │   ├── sentiment.sample.json
│   │   └── trends.sample.json
│   └── icons.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx                  # Route definitions
│   │   ├── ProtectedRoute.tsx
│   │   ├── LoginPage.tsx
│   │   └── DashboardPage.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── useAuth.ts
│   │   ├── requirement/
│   │   │   ├── RequirementInputForm.tsx
│   │   │   └── useParseRequirement.ts
│   │   ├── dashboard/
│   │   │   └── DashboardPageContent.tsx
│   │   ├── properties/
│   │   │   ├── PropertyList.tsx
│   │   │   └── PropertyCard.tsx
│   │   ├── recommendations/
│   │   │   └── TopRecommendationsList.tsx
│   │   └── enrichment/
│   │       ├── BuilderReputationPanel.tsx
│   │       ├── SentimentSummaryPanel.tsx
│   │       └── TrendContextPanel.tsx
│   ├── components/
│   │   ├── ui/                        # Primitives
│   │   ├── layout/                    # AppShell, Header
│   │   └── widgets/                   # Dashboard widgets
│   ├── hooks/
│   │   └── useDashboardData.ts
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── requirementApi.ts
│   │   ├── propertyApi.ts
│   │   └── dashboardApi.ts
│   ├── types/
│   │   ├── requirement.ts
│   │   ├── property.ts
│   │   ├── enrichment.ts
│   │   └── recommendation.ts
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── formatProperty.ts
│   │   └── normalizeDisplay.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   └── global.css
│   └── test/
│       ├── setup.ts
│       └── mocks/
├── skills.md                          # This file
├── README.md                          # Setup, auth, demo, compliance
├── .env.example
└── package.json
```

## File Placement Rules

| What | Where |
|------|-------|
| Route pages | `src/routes/` |
| Feature-specific logic | `src/features/<domain>/` |
| Reusable dumb UI | `src/components/` |
| API calls | `src/services/` only |
| Shared types | `src/types/` |
| Pure functions | `src/utils/` |

---

# Testing Standards

## Minimum Requirement

**At least 5–10 test cases or validation checks** covering:

- Requirement parsing **display** mapping
- Price/area/BHK **formatting** utilities
- Dashboard **recommendation ordering**
- **Deduplication** indicators in UI
- **Auth guard** behavior (redirect when logged out)
- **Empty/loading** state rendering

## Test Stack (Recommended)

| Tool | Use |
|------|-----|
| Vitest | Unit tests (Vite-native) |
| `@testing-library/react` | Component tests |
| `@testing-library/user-event` | Interaction tests |
| MSW | Mock API |
| Playwright (bonus) | E2E demo flow |

## Required Test Files (Examples)

```
src/utils/formatCurrency.test.ts
src/utils/formatProperty.test.ts
src/features/requirement/RequirementInputForm.test.tsx
src/components/widgets/ParsedRequirementSummary.test.tsx
src/routes/ProtectedRoute.test.tsx
src/features/recommendations/topRecommendations.test.ts
```

## Test Cases to Implement

| # | Test | Assert |
|---|------|--------|
| 1 | `formatPrice(8000000)` | Displays lakh/crore correctly |
| 2 | `formatPrice` rent | Per-month label |
| 3 | Parse response → summary | All fields rendered |
| 4 | Empty query submit | Validation error shown |
| 5 | Property list sort by price | Correct order |
| 6 | `price_per_sqft` display | Calculated or from API |
| 7 | Duplicate property card | Shows duplicate badge |
| 8 | Incomplete record | Shows incomplete flag |
| 9 | Protected route | Redirects when no session |
| 10 | Recommendations | Sorted by rank ascending |

## E2E Demo Path (Playwright — Bonus)

1. Visit login → authenticate (mock or test user)
2. Submit requirement string
3. Assert parsed city/BHK visible
4. Assert ≥1 property card
5. Assert recommendation section visible

## CI (Bonus)

- GitHub Action: `lint` → `test` → `build` on PR

## Manual Validation Checklist

- [ ] Login/logout works
- [ ] Dashboard blocked when logged out
- [ ] User email/name visible in header
- [ ] NL requirement parses and displays
- [ ] All 8 dashboard widgets render with sample data
- [ ] Source URLs open correctly
- [ ] Fallback JSON works without backend
- [ ] README has auth + local run steps

---

# Deliverable Requirements

## Submission Checklist (Maps to Frontend Repo)

| Item | Required | Owner notes |
|------|----------|-------------|
| Git repository link | Yes | This repo |
| README with setup steps | Yes | `npm install`, `npm run dev`, env vars |
| Auth configuration notes | Yes | Provider, callback URLs, env keys |
| Demo URL or local run instructions | Yes | Vercel/Netlify preferred |
| Sample property dataset | Yes | `public/data/properties.sample.json` |
| Sample sentiment dataset | Yes | `public/data/sentiment.sample.json` |
| Sample trend dataset | Yes | `public/data/trends.sample.json` |
| Test cases / evidence | Yes | `npm test` output or CI link |
| Agentic programming evidence | Yes | README section: tools, prompts, iterations |
| Known limitations | Yes | README |
| Compliance note on data sources | Yes | README: sources, fallback, no scraping in FE |
| Screenshots or demo video | Recommended | `/docs` or README embed |

## README Sections to Include

1. Project title and one-line description  
2. Architecture diagram (optional mermaid)  
3. Prerequisites (Node version)  
4. Environment variables (`.env.example`)  
5. Auth setup (step-by-step for chosen provider)  
6. Running locally  
7. Running tests  
8. Deployment steps  
9. Demo script (matches section 14 of challenge)  
10. Data sources & compliance  
11. Agentic programming evidence  
12. Known limitations  
13. Team / hackathon group info  

## Demo Script (Frontend Must Support)

1. Login using third-party authentication  
2. Enter natural-language property requirement  
3. Show parsed requirement  
4. Load/collect property data (via API or fallback)  
5. Show cleaned/deduplicated presentation  
6. Show builder/project enrichment panel  
7. Show sentiment analysis panel  
8. Show trend/demand panel  
9. Show comparative dashboard + recommendations  
10. Show tests or validation evidence (`npm test`)  
11. Explain agentic programming usage (verbal + README)  

## Deployment

| Platform | Notes |
|----------|-------|
| Vercel / Netlify | Preferred; set env vars in dashboard |
| Render / Railway | Full-stack if API hosted together |
| Azure Static Web Apps | Good for enterprise auth (Entra) |

Configure SPA fallback to `index.html` for client-side routing.

## Success Criteria (Frontend Verification)

| Criterion | Required |
|-----------|----------|
| Third-party auth, login/logout, protected dashboard | Yes |
| NL requirement input + parsed criteria visible | Yes |
| Property data shown from API or sample | Yes |
| Cleanup/dedup visible in UI | Yes |
| Builder, sentiment, trend panels | Yes |
| Comparative dashboard + recommendations | Yes |
| 5–10 tests | Yes |
| Deployed or locally runnable | Yes |
| Agentic evidence documented | Yes |
| Compliance note in README | Yes |

## Bonus Extensions (If Time Permits)

- Multi-source comparison badges (MagicBricks + Housing + NoBroker)  
- NL query refinement (follow-up questions UI)  
- AI recommendation explanation (streaming text)  
- Advanced dedup UI (fuzzy match clusters)  
- Location scoring display (commute, schools, metro)  
- Investment score composite widget  
- Export report (PDF/Markdown/CSV)  
- Playwright E2E + CI pipeline  

---

## Quick Reference: Dashboard Widget → Data Source

| Widget | Primary API / file |
|--------|-------------------|
| Requirement Summary | Parse API response |
| Matching Properties | Search API / `properties.sample.json` |
| Price Comparison | Properties + `price_per_sqft` |
| Locality Comparison | Aggregated by locality |
| Builder Reputation | Enrichment API / sample |
| Sentiment Summary | `sentiment.sample.json` |
| Trend Context | `trends.sample.json` |
| Top Recommendations | Recommendations API |

---

*Last updated from Challenge 1 brief — Real Estate Property Intelligence Dashboard (Agentic Programming Hackathon).*
