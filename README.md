# Realist — Property Intelligence Dashboard (UI)

**TalentServ AI Hackathon — Group 10**

Enterprise-style React single-page application for discovering, evaluating, and acting on residential property listings in India. Authenticated users search in natural language, browse a unified catalog, shortlist favorites, compare up to four properties, submit contact inquiries, and upload or scrape listing data.

| | |
|---|---|
| **Product name** | Realist |
| **Repository** | `talentserv-ai-hackathon-group-10-ui` |
| **Backend (companion)** | `talentserv-ai-hackathon-group-10-backend` (FastAPI + MySQL) |
| **Default local URL** | http://localhost:5173 |

---

## Table of contents

1. [Project overview](#project-overview)
2. [Tech stack](#tech-stack)
3. [UI libraries and frameworks](#ui-libraries-and-frameworks)
4. [Project structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation and setup](#installation-and-setup)
7. [Environment variables](#environment-variables)
8. [Run locally](#run-locally)
9. [Build and production deployment](#build-and-production-deployment)
10. [Available scripts](#available-scripts)
11. [Routing and navigation](#routing-and-navigation)
12. [State management](#state-management)
13. [API integration](#api-integration)
14. [Component architecture](#component-architecture)
15. [Styling and theming](#styling-and-theming)
16. [Responsive design](#responsive-design)
17. [Charts, animations, and utilities](#charts-animations-and-utilities)
18. [Authentication and authorization](#authentication-and-authorization)
19. [Error handling and loading states](#error-handling-and-loading-states)
20. [Code standards and conventions](#code-standards-and-conventions)
21. [Git workflow](#git-workflow)
22. [Linting and formatting](#linting-and-formatting)
23. [Performance](#performance)
24. [Future scalability](#future-scalability)
25. [Troubleshooting](#troubleshooting)
26. [Screenshots and UI preview](#screenshots-and-ui-preview)
27. [Contributing](#contributing)
28. [Notes for developers](#notes-for-developers)
29. [Further reading](#further-reading)

---

## Project overview

### Purpose

Realist helps home seekers and agents move from **natural-language requirements** to **actionable property shortlists**:

- Describe needs in plain English (e.g. *“2 BHK flat for rent in Pune under ₹35,000”*).
- Receive ranked matches with scores and human-readable reasons.
- Browse, filter, and paginate the full catalog.
- Shortlist favorites, compare 2–4 listings side by side, and contact agents via an inquiry form.
- Operators can extend data through **CSV/XLSX upload** or **live portal scrape** (backend-driven).

### What this repository contains

This repo is the **frontend only**. It communicates with the Group 10 FastAPI backend via REST. Auth0 handles identity; the API validates JWTs on protected routes.

### Key user flows

| Flow | Route(s) | Backend |
|------|----------|---------|
| Sign in / sign up | `/` → Auth0 → `/dashboard` | `GET/PATCH /api/v1/me` |
| AI property search | `/dashboard` | parse, save, match requirements |
| Browse catalog | `/properties` | `GET /api/v1/properties` |
| Property detail | `/properties/:id` | `GET /api/v1/properties/{id}` |
| Shortlist | `/saved` | favorites CRUD |
| Compare | `/compare` | client-only (`localStorage`) |
| Data upload / scrape | `/upload` | upload + scrape endpoints |

When the API is unavailable, the UI falls back to a **mock catalog** (`src/data/mockProperties.ts`) so demos remain usable.

---

## Tech stack

| Layer | Technology | Version (approx.) |
|-------|------------|-------------------|
| Runtime | Node.js | 18+ (20+ recommended) |
| Framework | React | 19.x |
| Language | TypeScript | 6.x |
| Build tool | Vite | 8.x |
| Routing | React Router | 7.x |
| Styling | Tailwind CSS | 4.x (`@tailwindcss/vite`) |
| Auth | Auth0 (`@auth0/auth0-react`) | 2.x |
| HTTP | Native `fetch` | — |
| Charts | Recharts | 3.x |
| Motion | Framer Motion | 12.x |
| Icons | Lucide React | 1.x |

---

## UI libraries and frameworks

| Package | Role in this project |
|---------|---------------------|
| **Radix UI** (`@radix-ui/react-dialog`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`) | Accessible primitives for dialogs and composition; shadcn-inspired patterns |
| **class-variance-authority (CVA)** | Variant APIs for buttons and similar UI (`button.tsx`) |
| **clsx** + **tailwind-merge** | Conditional classes via `cn()` in `src/lib/utils.ts` |
| **Recharts** | Compare charts and dashboard trend visualizations |
| **Framer Motion** | Route transitions (`PageTransition`) and subtle UI motion |
| **Lucide React** | Consistent icon set across layout and property UI |

> **Note:** `@radix-ui/react-select` is listed in `package.json` but is not currently used in `src/`. Prefer existing `input` / filter patterns when adding selects.

---

## Project structure

```
talentserv-ai-hackathon-group-10-ui/
├── public/                      # Static assets (favicon, sample CSV)
├── docs/                        # Hackathon submission documents (7 files)
├── src/
│   ├── api/
│   │   └── client.ts            # Central REST client + TypeScript types
│   ├── auth/
│   │   └── Auth0ProviderWithNavigate.tsx
│   ├── components/
│   │   ├── layout/              # AppShell, PageHeader, BrandLogo, Section
│   │   ├── search/              # AISearchSection
│   │   ├── properties/          # Cards, grid, filters, modals
│   │   ├── compare/             # Tables and charts
│   │   ├── dashboard/           # Stats, trends (client-computed)
│   │   ├── requirements/        # ParsedFiltersPanel (not wired in UI)
│   │   └── ui/                  # Reusable primitives (button, card, dialog, …)
│   ├── context/
│   │   ├── PropertyContext.tsx  # Catalog, favorites, parsed requirement
│   │   └── CompareContext.tsx   # Compare queue (localStorage)
│   ├── data/
│   │   ├── mockProperties.ts    # Offline fallback listings
│   │   └── uploadTemplates.ts   # Upload column fallback
│   ├── lib/                     # Mappers, filters, compare logic, price index
│   ├── pages/                   # Route-level screens
│   ├── types/                   # Shared TypeScript models
│   ├── utils/                   # Profile and requirement helpers
│   ├── App.tsx                  # Routes + Auth0 loading gate
│   ├── main.tsx                 # Provider tree
│   ├── config.ts                # Env validation
│   ├── index.css                # Design tokens + Tailwind theme
│   └── vite-env.d.ts            # `ImportMetaEnv` types
├── index.html
├── package.json
├── vite.config.ts               # `@/` alias, port 5173
├── vercel.json                  # SPA rewrites for client-side routing
├── tsconfig.app.json
└── README.md
```

### Path alias

Imports use `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

Example:

```ts
import { PropertyGrid } from '@/components/properties/PropertyGrid'
```

---

## Prerequisites

Before cloning and running the UI, ensure you have:

| Requirement | Details |
|-------------|---------|
| **Node.js** | v18 or newer (LTS v20+ recommended) |
| **npm** | Comes with Node (or use compatible package manager) |
| **Git** | To clone the repository |
| **Auth0 account** | SPA application + API audience matching the backend |
| **Backend API** | FastAPI service running (default `http://localhost:8000`) |
| **MySQL** | Used by the backend (Railway or local); not required inside the UI repo |

Optional but useful:

- [Vercel](https://vercel.com) account for frontend deployment
- Backend repo README for ingest, migrations, and scrape setup

---

## Installation and setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd talentserv-ai-hackathon-group-10-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your real Auth0 and API values (see [Environment variables](#environment-variables)).

### 4. Start the backend

From the backend repository:

```bash
cd ../talentserv-ai-hackathon-group-10-backend   # adjust path if needed
source venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Seed data (optional):

```bash
curl -X POST http://localhost:8000/api/v1/data/ingest
```

### 5. Start the frontend

```bash
cd talentserv-ai-hackathon-group-10-ui
npm run dev
```

Open **http://localhost:5173**.

---

## Environment variables

All client-side variables must be prefixed with `VITE_` so Vite exposes them at build time.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_AUTH0_DOMAIN` | Yes | Auth0 tenant domain | `dev-xxxxx.us.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Yes | Auth0 SPA client ID | `abc123...` |
| `VITE_AUTH0_AUDIENCE` | Yes | API identifier (must match backend `AUTH0_API_AUDIENCE`) | `https://api.realestate-hackathon` |
| `VITE_AUTH0_REDIRECT_URI` | Yes | OAuth callback URL | `http://localhost:5173` (add production URL on deploy) |
| `VITE_API_BASE_URL` | Yes | Backend base URL, **no trailing slash** | `http://localhost:8000` |

### Example `.env` (local)

```env
VITE_AUTH0_DOMAIN=dev-your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_spa_client_id
VITE_AUTH0_AUDIENCE=https://api.realestate-hackathon
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000
```

### Validation

`src/config.ts` throws at startup if:

- A required variable is missing, or
- A value still contains placeholder patterns (`your-tenant`, `your_spa_client_id`, etc.).

### Auth0 SPA settings (local)

In the Auth0 dashboard, configure your SPA application:

- **Allowed Callback URLs:** `http://localhost:5173`
- **Allowed Logout URLs:** `http://localhost:5173`
- **Allowed Web Origins:** `http://localhost:5173`

Ensure the SPA requests the same **audience** as the backend API.

---

## Run locally

```bash
npm run dev
```

| Item | Value |
|------|--------|
| Dev server | http://localhost:5173 |
| Port | Fixed to `5173` (`strictPort: true` in Vite) |
| Hot reload | Enabled via Vite |

### Verify the setup

1. Open http://localhost:5173 — landing page loads.
2. Click **Get started** / **Sign in** — Auth0 login completes and redirects to `/dashboard`.
3. Confirm network calls to `VITE_API_BASE_URL` succeed (e.g. `/api/v1/properties`, `/api/v1/me`).
4. Run `npm run build` to confirm TypeScript and production build pass.

---

## Build and production deployment

### Production build (local)

```bash
npm run build
```

Output is written to `dist/`. Preview locally:

```bash
npm run preview
```

### Deploy to Vercel (recommended)

1. Import the Git repository in Vercel.
2. Set **Root Directory** to `talentserv-ai-hackathon-group-10-ui` if the repo is a monorepo parent.
3. Configure **Environment Variables** (all `VITE_*` keys above).
4. Set `VITE_API_BASE_URL` to your deployed backend URL (e.g. Railway).
5. Set `VITE_AUTH0_REDIRECT_URI` to your Vercel URL.

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

`vercel.json` rewrites all routes to `index.html` for client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Post-deploy checklist

- [ ] Auth0 callback, logout, and web origins include the Vercel URL  
- [ ] Backend `CORS_ORIGINS` includes the Vercel frontend URL  
- [ ] `VITE_AUTH0_AUDIENCE` matches backend `AUTH0_API_AUDIENCE`  
- [ ] Backend health: `GET <api-url>/health`  

---

## Available scripts

| Script | Command | Description |
|--------|---------|-------------|
| **dev** | `npm run dev` | Start Vite dev server on port 5173 |
| **build** | `npm run build` | Type-check (`tsc -b`) + production bundle to `dist/` |
| **preview** | `npm run preview` | Serve the production build locally |

There is no `npm test` or `npm run lint` script in `package.json` at present.

---

## Routing and navigation

Routing is defined in `src/App.tsx` using **React Router 7**.

| Path | Protection | Page | Description |
|------|------------|------|-------------|
| `/` | Public | `HomePage` or redirect | Landing; authenticated users → `/dashboard` |
| `/dashboard` | Protected | `DashboardPage` | AI search, matches, featured listings, widgets |
| `/properties` | Protected | `PropertiesPage` | Catalog browse, filters, pagination |
| `/properties/:propertyId` | Protected | `PropertyDetailPage` | Single listing detail |
| `/saved` | Protected | `SavedPage` | Favorites / shortlist |
| `/compare` | Protected | `ComparePage` | Side-by-side compare (2–4 items) |
| `/upload` | Protected | `DataUploadPage` | CSV upload + live scrape UI |
| `*` | — | Redirect to `/` | Unknown paths |

### Layout shell

Authenticated pages use `AppShell` (`src/components/layout/AppShell.tsx`):

- Desktop: unified top bar (brand + nav), sidebar below  
- Mobile: sticky header + slide-out drawer navigation  

### Route transitions

`AnimatePresence` + `PageTransition` wrap routes for enter/exit animations between pages.

---

## State management

The app uses **React Context** and local component state — no Redux or React Query.

```text
BrowserRouter
  └── Auth0ProviderWithNavigate
        └── PropertyProvider
              └── CompareProvider
                    └── App
```

### PropertyContext (`src/context/PropertyContext.tsx`)

| State | Purpose |
|-------|---------|
| `properties` | Shared catalog (API + mock merge) |
| `favorites` / `savedProperties` | Shortlist from `GET /api/v1/favorites` |
| `parsedRequirement` | Latest parsed NL search (in-memory) |
| `toggleFavorite` | Optimistic favorite add/remove via API |

Loads favorites when the user authenticates; clears on logout.

### CompareContext (`src/context/CompareContext.tsx`)

| State | Purpose |
|-------|---------|
| `compareList` | Up to **4** properties (`MAX_COMPARE_COUNT`) |
| Persistence | `localStorage` key `realestate-compare-list` |
| `limitMessage` | Shown when user exceeds compare limit |

Compare is **not** synced to the server.

### Dark mode

Toggled in `AppShell` by adding/removing the `.dark` class on `<html>`. **Not persisted** across reloads (no `ThemeContext`).

### Page-level data fetching

Pages use `useEffect` + `useState` to call `src/api/client.ts`. Loading and error UI are handled per page (skeletons, badges, empty states).

---

## API integration

### Central client

All HTTP calls live in **`src/api/client.ts`**. Base URL comes from `VITE_API_BASE_URL` via `src/config.ts`.

### Endpoints used by the UI

| Function | Method | Path | Auth |
|----------|--------|------|------|
| `fetchMe` | GET | `/api/v1/me` | Bearer |
| `syncProfile` | PATCH | `/api/v1/me` | Bearer |
| `parseRequirement` | POST | `/api/v1/requirements/parse` | No |
| `saveRequirement` | POST | `/api/v1/requirements` | Bearer |
| `fetchLatestRequirement` | GET | `/api/v1/requirements/latest` | Bearer |
| `fetchProperties` | GET | `/api/v1/properties` | No |
| `matchProperties` | POST | `/api/v1/properties/match` | No |
| `fetchProperty` | GET | `/api/v1/properties/{id}` | No |
| `fetchFavorites` | GET | `/api/v1/favorites` | Bearer |
| `addFavorite` | POST | `/api/v1/favorites` | Bearer |
| `removeFavorite` | DELETE | `/api/v1/favorites?listing_key=` | Bearer |
| `createInquiry` | POST | `/api/v1/inquiries` | Bearer |
| `fetchUploadTemplate` | GET | `/api/v1/data/upload/templates/{type}` | No |
| `uploadDataset` | POST | `/api/v1/data/upload` | Bearer |
| `scrapeListings` | POST | `/api/v1/data/scrape` | Bearer |

Protected calls obtain a token via:

```ts
const token = await getAccessTokenSilently({
  authorizationParams: { audience: auth0Audience },
})
```

### Offline / fallback behavior

| Scenario | Behavior |
|----------|----------|
| Property list fetch fails | Merge or fall back to `MOCK_PROPERTIES`; badge shows “Offline catalog” |
| Match API fails | Client-side filter on cached catalog; badge shows “Offline fallback” |
| Upload template 404 | Fallback columns from `src/data/uploadTemplates.ts` |
| Detail fetch fails | Resolve from `PropertyContext.findProperty()` |

Mapping and enrichment: `src/lib/propertyMapper.ts`.

---

## Component architecture

### Layering convention

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Pages** | `src/pages/` | Route composition, data loading, page-level state |
| **Feature** | `src/components/{feature}/` | Domain UI (properties, compare, dashboard) |
| **Layout** | `src/components/layout/` | Shell, headers, sections |
| **UI primitives** | `src/components/ui/` | Reusable, styled building blocks |
| **Lib** | `src/lib/` | Pure functions (filters, compare metrics, mappers) |
| **API** | `src/api/` | Network layer |

### Reusable UI primitives (`src/components/ui/`)

| Component | Usage |
|-----------|--------|
| `button` | CVA variants (default, outline, ghost, highlight, …) |
| `card` | Content surfaces |
| `dialog` | Modals (e.g. contact inquiry) |
| `input` | Forms and filters |
| `badge`, `status-badge` | Labels and status chips |
| `skeleton` | Loading placeholders |
| `pagination`, `load-more` | List navigation |

### Feature highlights

| Component | Role |
|-----------|------|
| `PropertyGrid` | Responsive grid; exports `PROPERTY_GRID_CLASS` |
| `PropertyCard` / `PropertyCardSkeleton` | Listing card and loading state |
| `PropertyFiltersBar` | Search, city, type, status, furnishing, sort |
| `AISearchSection` | Natural-language search with example chips |
| `ContactInquiryModal` | Agent contact form |
| `CompareSelectionBanner` | Floating compare queue summary |
| `PropertyCompareTable` / `PropertyCompareCharts` | Compare page visuals |

### Unused / internal-only

- `ParsedFiltersPanel.tsx` — implemented but **not rendered** in the current UI.
- `tabs.tsx` — Radix tabs wrapper; not imported elsewhere yet.

---

## Styling and theming

### Approach

- **Tailwind CSS v4** with `@import 'tailwindcss'` in `src/index.css`
- **CSS custom properties** (HSL tokens) for semantic colors
- **`@theme`** block maps tokens to Tailwind utilities (`bg-primary`, `text-muted-foreground`, etc.)
- **Dark mode:** `@custom-variant dark (&:is(.dark *))` — toggle `.dark` on `<html>`

### Brand palette (documented in `index.css`)

| Token role | Intent |
|------------|--------|
| Navy / foreground | Structure and text |
| Orange (`primary`) | Primary CTAs |
| Blue (`highlight`, ~#003865 family) | Accent, links, active nav |
| Cream / muted | Surfaces and secondary text |

### Typography

**Inter** loaded from Google Fonts in `index.html`.

### Utilities

Custom utilities in `index.css`: `shadow-soft`, `shadow-card`, `hero-gradient`, `btn-gradient-primary`, `nav-active-indicator`, icon tile helpers.

### Composing classes

```ts
import { cn } from '@/lib/utils'

<div className={cn('rounded-xl border', isActive && 'border-highlight')} />
```

---

## Responsive design

The UI is **mobile-first** using Tailwind breakpoints (`sm:`, `lg:`).

| Area | Implementation |
|------|----------------|
| **Property grid** | 1 col → `sm:grid-cols-2` → `lg:grid-cols-3` (`PROPERTY_GRID_CLASS`) |
| **App shell** | Mobile drawer nav; desktop sidebar + unified top bar |
| **Cards** | `aspect-[16/10]` images; tighter padding on small screens |
| **Compare page** | Scrollable table; charts stack on narrow viewports |
| **Touch targets** | Buttons use `h-10` / `h-11` default sizes |

Test at widths: 375px (mobile), 768px (tablet), 1280px+ (desktop).

---

## Charts, animations, and utilities

| Tool | Package | Used for |
|------|---------|----------|
| **Recharts** | `recharts` | Compare bar/line charts, dashboard price index |
| **Framer Motion** | `framer-motion` | `PageTransition`, `AnimatePresence` on route change |
| **Lucide** | `lucide-react` | Icons (search, heart, layout, loaders) |

### Client-side analytics

Dashboard widgets (`StatsWidgets`, `PriceIndexTrend`, `TrendingLocations`, etc.) compute metrics from the **loaded property catalog** in the browser — there is no separate analytics API.

### Lib utilities

| Module | Purpose |
|--------|---------|
| `propertyFilters.ts` | Client filter/sort when offline |
| `propertyCompare.ts` | Compare metrics and max count |
| `propertyMapper.ts` | API DTO → `PropertyListing` |
| `listingKeys.ts` | Stable favorite/compare keys |
| `priceIndex.ts` | Dashboard trend data |

---

## Authentication and authorization

### Flow

```text
User → Home (/) → loginWithRedirect (Auth0)
     → Auth0 OAuth / PKCE
     → Callback to VITE_AUTH0_REDIRECT_URI
     → onRedirectCallback → /dashboard
     → Access token (audience = VITE_AUTH0_AUDIENCE)
     → Bearer token on protected API calls
```

### Implementation files

| File | Role |
|------|------|
| `src/auth/Auth0ProviderWithNavigate.tsx` | Wraps app; `cacheLocation="localstorage"` |
| `src/components/ProtectedRoute.tsx` | Redirects unauthenticated users to login |
| `src/config.ts` | Auth0 domain, client ID, redirect URI, audience |

### Protected vs public routes

- **Public:** `/` (marketing / login entry)
- **Protected:** all app routes under `ProtectedRoute` in `App.tsx`

The backend enforces JWT on favorites, requirements (save/latest), inquiries, upload, and scrape. Property list and match can work without a token.

---

## Error handling and loading states

| Pattern | Where |
|---------|--------|
| **Global Auth0 loading** | Full-screen spinner in `App.tsx` while `isLoading` |
| **Protected route loading** | `ProtectedRoute` spinner before redirect |
| **Page skeletons** | `PropertyCardSkeleton`, `PropertyGrid loading` |
| **Empty states** | `PropertyEmptyState`, compare/saved empty copy |
| **API errors** | `throw new Error(\`API error: ${status}\`)` in `client.ts`; pages catch and show message or fallback |
| **Status badges** | “Live database” / “Offline catalog” / “Database matches” on dashboard and properties |
| **Form validation** | Inline errors on AI search (empty query) and upload/scrape forms |

There is no global error boundary component today; errors are handled at the page/feature level.

---

## Code standards and conventions

| Topic | Convention |
|-------|------------|
| **Language** | TypeScript strict mode (`tsconfig.app.json`) |
| **Components** | Function components; named exports for pages/features |
| **File naming** | PascalCase for components (`PropertyCard.tsx`), camelCase for lib/utils |
| **Imports** | Use `@/` alias; type-only imports where applicable (`verbatimModuleSyntax`) |
| **Styling** | Tailwind utility classes; shared layout constants (e.g. `PROPERTY_GRID_CLASS`) |
| **Types** | Domain types in `src/types/property.ts`; API types colocated in `client.ts` |
| **Unused code** | `noUnusedLocals` / `noUnusedParameters` enabled — build fails on unused symbols |

### Adding a new page

1. Create `src/pages/MyPage.tsx`.
2. Register route in `src/App.tsx` (wrap with `ProtectedRoute` if auth required).
3. Add nav link in `AppShell` if needed.
4. Add API functions to `client.ts` if new endpoints are required.

---

## Git workflow

Recommended practices for this team project:

| Topic | Guideline |
|-------|-----------|
| **Default branch** | `main` |
| **Feature branches** | `feature/<short-description>` (e.g. `feature/property-insights`) |
| **Bug fixes** | `fix/<short-description>` |
| **Hackathon / spikes** | `real-estate-new-changes` or descriptive team branches |
| **Commits** | Imperative mood, focused commits (e.g. `fix: align header underline on desktop`) |
| **PRs** | Small, reviewable; include screenshots for UI changes |
| **Secrets** | Never commit `.env`; only `.env.example` with placeholders |

Pull latest before starting work:

```bash
git checkout main
git pull origin main
git checkout -b feature/my-change
```

---

## Linting and formatting

| Tool | Status in repo |
|------|----------------|
| **ESLint** | Not configured in project root (no `eslint.config.*`) |
| **Prettier** | Not configured in project root |
| **TypeScript** | Enforced via `npm run build` (`tsc -b`) |

Recommended local practices until lint scripts are added:

- Run `npm run build` before pushing.
- Keep consistent Prettier-like formatting (2-space indent, single quotes in TS as per existing files).
- Avoid unused imports (compiler will report them).

---

## Performance

| Strategy | Implementation |
|----------|----------------|
| **Code splitting** | Vite automatic chunking on dynamic import (routes are static imports today) |
| **Paginated API** | `page` / `page_size` on property list |
| **Debounced search** | Properties page search input debounced before API/filter |
| **Skeletons** | Avoid layout shift while loading grids |
| **Mock merge cap** | Mapper limits supplemental mock rows (max 24 total) |
| **Compare cap** | Max 4 properties reduces chart/render cost |
| **Auth0 cache** | `localstorage` cache reduces repeat logins |

Future improvements: React Query for caching, route-based lazy loading, image lazy-loading for external listing URLs.

---

## Future scalability

| Area | Direction |
|------|-----------|
| **Data fetching** | Adopt TanStack Query for cache, retries, and stale-while-revalidate |
| **Compare** | Persist compare list server-side per user |
| **State** | Split `PropertyContext` if catalog and favorites grow complex |
| **Testing** | Add Vitest + React Testing Library; Playwright for E2E |
| **i18n** | Extract strings if expanding beyond India-focused copy |
| **Design system** | Publish Storybook for `components/ui` |
| **Observability** | Sentry or similar for client error tracking |

See `docs/` for architecture and groomed requirements aligned with the backend.

---

## Troubleshooting

### App crashes on startup with env error

**Symptom:** `Missing environment variable` or placeholder error from `config.ts`.

**Fix:** Copy `.env.example` to `.env` and replace all placeholder values with real Auth0 and API settings.

### Auth0 redirect loop or `login_required`

**Fix:**

- Match `VITE_AUTH0_REDIRECT_URI` exactly to Auth0 **Allowed Callback URLs**.
- Ensure `VITE_AUTH0_AUDIENCE` equals backend `AUTH0_API_AUDIENCE`.
- Add `http://localhost:5173` to **Allowed Web Origins**.

### API calls fail / CORS errors

**Symptom:** Browser console blocked by CORS.

**Fix:**

- Confirm backend is running on `VITE_API_BASE_URL`.
- Add `http://localhost:5173` to backend `CORS_ORIGINS`.
- No trailing slash on `VITE_API_BASE_URL`.

### Empty dashboard or “Offline catalog”

**Fix:**

- Seed backend: `curl -X POST http://localhost:8000/api/v1/data/ingest`
- Or upload `public/sample_properties_upload.csv` via `/upload`.
- Check `GET http://localhost:8000/api/v1/properties?page=1`.

### Port 5173 already in use

```bash
lsof -ti :5173 | xargs kill -9
npm run dev
```

### `npm run build` TypeScript errors

- Run build locally and fix unused variables/imports.
- Ensure path alias imports use `@/` consistently.

### Backend not running

```bash
cd talentserv-ai-hackathon-group-10-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

---

## Screenshots and UI preview

> Add screenshots or a short Loom/GIF link before hackathon submission.

| Screen | Suggested capture |
|--------|-------------------|
| Landing (`/`) | Hero + login CTA |
| Dashboard | AI search + match results |
| Properties | Filter bar + 3-column grid |
| Property detail | Price, amenities, actions |
| Compare | Table + charts |
| Upload | CSV upload + scrape panel |
| Mobile | Drawer navigation |

**Placeholder:**

```markdown
![Dashboard](docs/images/dashboard.png)
![Properties](docs/images/properties.png)
```

Create `docs/images/` and drop PNGs there when assets are ready.

---

## Contributing

1. Fork or branch from `main`.
2. Follow [code standards](#code-standards-and-conventions) and run `npm run build`.
3. Update README or `docs/` if you change setup, routes, or env vars.
4. Open a PR with:
   - Summary of changes
   - Screenshots for UI updates
   - Test plan (manual steps are fine)

Do not commit `.env`, API keys, or Auth0 secrets.

---

## Notes for developers

| Topic | Detail |
|-------|--------|
| **Product name** | “Realist” in UI copy and loading states |
| **Backend repo** | Required for full functionality; UI alone uses mocks |
| **Admin ingest** | `POST /api/v1/data/ingest` is backend/curl only — no UI page |
| **Scrape sources API** | `GET /api/v1/data/scrape/sources` exists on backend; UI uses a hardcoded portal list |
| **Compare** | Client-only; clearing browser data clears compare list |
| **Strict port** | Dev server must use 5173 or change `vite.config.ts` |
| **Hackathon docs** | Seven documents in `docs/` (requirements, architecture, tests, etc.) |

### Companion backend

Clone and run `talentserv-ai-hackathon-group-10-backend` for API, database, parser, matching, and scraping. Keep Auth0 audience and CORS in sync with this UI.

---

## Further reading

| Document | Location |
|----------|----------|
| Groomed requirements | `docs/GROOMED_REQUIREMENTS.md` |
| Technical architecture | `docs/PRODUCT_TECHNICAL_ARCHITECTURE.md` |
| Source & deployment | `docs/SOURCE_CODE_AND_DEPLOYMENT.md` |
| Backend setup | `../talentserv-ai-hackathon-group-10-backend/README.md` |

---

**License / ownership:** TalentServ AI Hackathon — Group 10. Internal hackathon submission; adjust license text if open-sourcing later.
