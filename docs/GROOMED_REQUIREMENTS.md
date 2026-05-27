# Groomed Requirements Document — Realist Property Intelligence Platform

**Product:** Realist (Real Estate Property Intelligence Dashboard)  
**Team:** TalentServ AI Hackathon — Group 10  
**Document version:** 1.0  
**Derived from:** Codebase analysis (frontend + backend repositories)  
**Last updated:** May 2026

---

## 1. Executive Summary

Realist is a web application that helps authenticated users discover, evaluate, and act on residential property listings in India. Users describe requirements in natural language; the system parses intent, matches listings from a normalized catalog, shortlists favorites, compares up to four properties, and submits contact inquiries. Data enters the system via admin CSV ingest, authenticated file upload, optional compliance-first live scraping, and client-side mock fallbacks when the API is unavailable.

This document refines the hackathon requirement into groomed scope, assumptions, user stories, and acceptance criteria aligned with the **implemented** solution.

---

## 2. Problem Statement

Property seekers struggle to translate vague needs (“2 BHK in Baner under 50 lakh”) into structured search filters across fragmented listing portals. Agents and buyers need a single dashboard to search, rank, save, compare, and inquire—without manually reconciling duplicate listings from multiple sources.

---

## 3. Goals and Non-Goals

### 3.1 Goals

| ID | Goal |
|----|------|
| G1 | Secure sign-in and profile sync for personalized experience |
| G2 | Natural-language requirement parsing and property matching |
| G3 | Browse, filter, and paginate a unified property catalog |
| G4 | Shortlist (favorites) and compare properties side-by-side |
| G5 | Submit contact inquiries tied to listings |
| G6 | Ingest listing data via CSV/XLSX upload and server-side fallback datasets |
| G7 | Optional live scraping from major Indian portals (compliance-first) |
| G8 | Premium, responsive enterprise-style UI with light/dark mode |

### 3.2 Non-Goals (Out of Scope / Not Implemented)

| ID | Non-goal |
|----|----------|
| NG1 | Native mobile apps (web responsive only) |
| NG2 | Payment, booking, or legal transaction workflows |
| NG3 | Seller/agent listing management portal |
| NG4 | Real-time chat or notification center |
| NG5 | Guaranteed 100% scrape success (portals may block bots) |
| NG6 | Multi-tenant RBAC beyond Auth0-authenticated user |

---

## 4. Assumptions

| ID | Assumption |
|----|------------|
| A1 | Users have modern browsers; JavaScript enabled |
| A2 | Auth0 tenant is configured with API audience matching backend `AUTH0_API_AUDIENCE` |
| A3 | MySQL (e.g. Railway) is available via `DATABASE_URL`; migrations run with Alembic |
| A4 | Listing prices in the database are in **INR** (sale = full price; rent = monthly) |
| A5 | Primary markets are **Pune, Mumbai, and Bengaluru** (parser and scrape defaults) |
| A6 | Property uniqueness is `(source, external_id)` for upsert/deduplication |
| A7 | Frontend `VITE_API_BASE_URL` points to backend (default `http://localhost:8000`) |
| A8 | CORS allows the SPA origin via `CORS_ORIGINS` |
| A9 | Compare selection persists in **browser localStorage** (not server-synced) |
| A10 | Some UI metrics (ratings, furnishing, amenities on cards) are enriched client-side when mapping API/mock data |
| A11 | Live scraping requires `SCRAPE_ENABLED=true` and Playwright browsers installed where Housing scraper is used |
| A12 | Offline/demo mode uses `src/data/mockProperties.ts` when API calls fail |

---

## 5. Stakeholders and Personas

| Persona | Description |
|---------|-------------|
| **Home seeker** | Logged-in user searching buy/rent listings, saving and comparing |
| **Data operator** | Admin/developer seeding data via ingest API key or upload/scrape tools |
| **Reviewer / judge** | Evaluates hackathon demo: search, match quality, UX, compliance |

---

## 6. Scope

### 6.1 In Scope — Functional

**Authentication & profile**

- Public marketing home (`/`) with Auth0 login
- Protected routes: dashboard, properties, detail, saved, compare, upload
- `GET/PATCH /api/v1/me`; profile sync from Auth0 claims

**Property catalog**

- List with pagination, search, filters (city, type, listing status, sort)
- Detail view by numeric API id or listing key route
- Featured catalog on dashboard; full browse on Properties page

**AI search & matching**

- NL input on dashboard → `POST /api/v1/requirements/parse`
- Optional save requirement → `POST /api/v1/requirements`, restore via `GET /latest`
- Ranked matches → `POST /api/v1/properties/match` (score 0–1 + reasons)
- Client fallback filtering on cached catalog when match API unavailable

**Shortlist & compare**

- Favorites CRUD → `/api/v1/favorites` (JWT)
- Compare queue: 2–4 properties, localStorage, charts + attribute table

**Inquiries**

- Contact modal → `POST /api/v1/inquiries` with name, email, optional phone, message

**Data ingestion**

- Admin: `POST /api/v1/data/ingest` (API key) — `data/*_fallback.csv`
- User: `POST /api/v1/data/upload` — CSV/XLSX up to 10 MB
- User: `POST /api/v1/data/scrape` — nobroker, housing, magicbricks, 99acres
- Template: `GET /api/v1/data/upload/templates/{dataset_type}`

**Dashboard analytics (client-computed)**

- Stats widgets, price index trend, trending locations, category breakdown, recent activity

### 6.2 In Scope — Technical

| Layer | Stack |
|-------|--------|
| Frontend | React 19, TypeScript, Vite, Tailwind v4, Auth0 React, Framer Motion, Recharts |
| Backend | FastAPI, SQLAlchemy, Alembic, PyMySQL, Pydantic |
| Scraping | httpx, BeautifulSoup4, Playwright (Housing in isolated worker) |
| Auth | Auth0 JWT (RS256), optional auth on parse/match/list |
| Deploy | Railway (backend), Vercel-compatible SPA build |

### 6.3 Repository Map

| Repository | Role |
|------------|------|
| `talentserv-ai-hackathon-group-10-ui` | SPA, contexts, API client, mock data |
| `talentserv-ai-hackathon-group-10-backend` | API, models, parser, matching, ingestion, scraping |

---

## 7. User Stories and Acceptance Criteria

### Epic E1 — Authentication & onboarding

**US-1.1** — As a visitor, I want to see a landing page so I understand the product before signing in.

- **AC1:** `/` shows Realist branding, feature highlights, and login CTA when unauthenticated.
- **AC2:** Authenticated users redirect to `/dashboard`.
- **AC3:** Auth0 errors surface on the home page.

**US-1.2** — As a signed-in user, I want my profile available in the shell header.

- **AC1:** After login, `GET /api/v1/me` loads; name/email/picture shown in AppShell.
- **AC2:** Profile fields sync to backend when Auth0 claims differ from stored record.

---

### Epic E2 — AI property search (dashboard)

**US-2.1** — As a seeker, I want to describe my requirement in plain language.

- **AC1:** Dashboard exposes AI search input with example prompt chips.
- **AC2:** Submitting empty text shows a validation error.
- **AC3:** `POST /requirements/parse` returns structured fields: intent, bedrooms, budget, city, locality, property_type, confidence.

**US-2.2** — As a seeker, I want to see matching properties after search.

- **AC1:** On successful parse, “Matching properties” section appears with paginated grid (12 per page in search mode).
- **AC2:** `POST /properties/match` returns ranked items with score and reasons when DB available.
- **AC3:** Badges indicate “Database matches” vs “Offline fallback” when client-side filter is used.
- **AC4:** Match details (score %) shown on cards when source is database.

**US-2.3** — As a returning user, I want my last search remembered.

- **AC1:** Latest saved requirement text pre-fills search when `GET /requirements/latest` returns data.
- **AC2:** Parse result optionally persisted via `POST /requirements` when authenticated.

---

### Epic E3 — Property discovery

**US-3.1** — As a seeker, I want to browse all listings with filters.

- **AC1:** `/properties` shows filter bar: search, city, type, furnishing, buy/rent, sort.
- **AC2:** Server-side query when API healthy; offline catalog filter otherwise.
- **AC3:** Pagination and “load more” behave correctly; result count displayed.

**US-3.2** — As a seeker, I want to view property details.

- **AC1:** `/properties/:propertyId` shows image, price, specs, description, source link.
- **AC2:** Actions: shortlist, add to compare, contact, back navigation.

**US-3.3** — As a seeker, I want a scannable grid layout.

- **AC1:** Property grid shows max **3 cards per row** on large screens, 2 on tablet, 1 on mobile.
- **AC2:** Consistent card height; adequate gap between cards.

---

### Epic E4 — Shortlist (favorites)

**US-4.1** — As a signed-in user, I want to save properties to a shortlist.

- **AC1:** Heart toggle on cards calls `POST/DELETE /api/v1/favorites`.
- **AC2:** `/saved` lists favorited properties; empty state links to browse.

**US-4.2** — As a signed-in user, I want favorites to survive refresh.

- **AC1:** Favorites loaded on app init via `GET /api/v1/favorites` into PropertyContext.

---

### Epic E5 — Compare properties

**US-5.1** — As a seeker, I want to compare multiple listings.

- **AC1:** “Add to compare” available on dashboard and properties grids.
- **AC2:** Minimum 2, maximum 4 properties in compare list.
- **AC3:** Banner shows selection count; link to `/compare`.

**US-5.2** — As a seeker, I want visual comparison on the compare page.

- **AC1:** `/compare` shows table (price, area, BHK, bath, source, etc.) and charts when ≥2 selected.
- **AC2:** Clear selection removes all from localStorage queue.

---

### Epic E6 — Contact / inquiries

**US-6.1** — As a seeker, I want to contact the lister about a property.

- **AC1:** Contact opens modal with name, email, phone (optional), message.
- **AC2:** Submit calls `POST /api/v1/inquiries` with listing_key and property_id.
- **AC3:** Errors displayed inline; success closes modal.

---

### Epic E7 — Data management (upload & scrape)

**US-7.1** — As a data operator, I want to upload listing files.

- **AC1:** `/upload` accepts CSV/XLSX for `properties` dataset type.
- **AC2:** Upload shows template columns and validation notes.
- **AC3:** Response reports rows read, inserted, updated, skipped, errors.
- **AC4:** Files over 10 MB rejected.

**US-7.2** — As a data operator, I want to fetch live listings from portals.

- **AC1:** UI selects city (Pune/Mumbai/Bengaluru), intent (sale/rent), and sources.
- **AC2:** `POST /api/v1/data/scrape` returns per-source fetched/parsed counts and errors.
- **AC3:** Scraping respects robots.txt, rate limits, and `SCRAPE_ENABLED` flag.
- **AC4:** User sees message when scraping disabled or portals block access.

**US-7.3** — As an admin, I want to seed fallback CSVs.

- **AC1:** `POST /api/v1/data/ingest` with ingest API key loads `*_fallback.csv` idempotently.

---

### Epic E8 — Dashboard insights

**US-8.1** — As a seeker, I want market context on the dashboard.

- **AC1:** When not in search mode, dashboard shows featured properties (8 per page), stats, price trend, trending locations, category breakdown, recent activity.
- **AC2:** Stats derived from loaded catalog in PropertyContext.

---

### Epic E9 — UX & accessibility

**US-9.1** — As a user, I want a polished responsive UI.

- **AC1:** Collapsible sidebar (desktop), mobile drawer nav, sticky header.
- **AC2:** Light/dark mode toggle persists for session via `document.documentElement`.
- **AC3:** Placeholder text readable in dark mode (`--placeholder` token).
- **AC4:** Brand palette: navy structure, orange primary CTAs, blue (`#003865` family) accents.

---

## 8. API Contract Summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | No | Health check |
| GET/PATCH | `/api/v1/me` | JWT | Profile |
| POST | `/api/v1/data/ingest` | Admin key | Seed CSV fallbacks |
| GET | `/api/v1/data/upload/templates/{type}` | No | Upload schema |
| POST | `/api/v1/data/upload` | JWT | File upload |
| GET | `/api/v1/data/scrape/sources` | No | Supported portals |
| POST | `/api/v1/data/scrape` | JWT | Live scrape |
| GET | `/api/v1/properties` | No | List/filter |
| GET | `/api/v1/properties/{id}` | No | Detail |
| POST | `/api/v1/properties/match` | Optional | Ranked match |
| POST | `/api/v1/requirements/parse` | No | NL parse |
| POST | `/api/v1/requirements` | JWT | Save requirement |
| GET | `/api/v1/requirements/latest` | JWT | Latest requirement |
| GET/POST/DELETE | `/api/v1/favorites` | JWT | Shortlist |
| POST | `/api/v1/inquiries` | JWT | Contact form |

---

## 9. Data Model (Core Entities)

| Entity | Key fields | Notes |
|--------|------------|-------|
| **User** | auth0_sub, email, name, picture | Created on first authenticated request |
| **Property** | source, external_id, title, address, city, state, price, bedrooms, bathrooms, listing_status, source_url | Unique on (source, external_id) |
| **Requirement** | raw_text, parsed fields, parser, confidence | Per user history |
| **Favorite** | user_id, listing_key, property_id | Links user to listing |
| **Inquiry** | listing_key, property_id, contact fields, status | Submitted interest |

---

## 10. Business Rules

| Rule | Description |
|------|-------------|
| BR1 | `buy` intent maps to `for_sale`; `rent` to `for_rent` |
| BR2 | Match scoring weights city, bedrooms, budget, property type, locality |
| BR3 | Compare list capped at 4; minimum 2 to show comparison UI |
| BR4 | Upload/scrape upsert does not duplicate `(source, external_id)` |
| BR5 | Scrape delay default 2s between requests; compliance guard checks robots.txt |
| BR6 | Frontend merges API catalog with mock properties for demo resilience |

---

## 11. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Property list page_size ≤100; match candidate pool capped (300) |
| Security | JWT validation on protected routes; ingest protected by API key |
| Reliability | Graceful degradation to mock/offline catalog on API failure |
| Compliance | Scraper user-agent disclosure; robots.txt; CSV fallback documented |
| Maintainability | Shared `PROPERTY_GRID_CLASS`, design tokens in `index.css` |
| Build | `npm run build` (frontend), `pytest` (backend tests for parser/matching) |

---

## 12. UI Routes

| Route | Access | Page |
|-------|--------|------|
| `/` | Public | Home / login |
| `/dashboard` | Protected | AI search, featured, analytics |
| `/properties` | Protected | Browse & filter |
| `/properties/:propertyId` | Protected | Detail |
| `/saved` | Protected | Shortlist |
| `/compare` | Protected | Comparison |
| `/upload` | Protected | Data upload & scrape |

---

## 13. Known Gaps and Future Work

| Item | Status |
|------|--------|
| Compare list server sync | Not implemented (localStorage only) |
| Parsed filters panel in search UI | Removed from display; parse still runs |
| Scrape success rate | Variable; portal bot-blocking expected |
| `rating-desc` sort on Properties | Client-side only when using offline catalog |
| Global command bar / notifications | Not in current AppShell |

---

## 14. Definition of Done (Release)

- [ ] Auth0 login works end-to-end with backend audience
- [ ] Database migrated; ingest or upload populates properties
- [ ] NL search returns matches with scores or visible fallback
- [ ] Favorites and inquiries persist per user
- [ ] Compare works for 2–4 properties
- [ ] Upload and scrape endpoints functional in target environment
- [ ] Frontend production build passes without TypeScript errors
- [ ] CORS and API base URL configured for deployment URLs

---

## 15. References (Codebase)

| Area | Primary paths |
|------|----------------|
| Frontend routes | `src/App.tsx` |
| API client | `src/api/client.ts` |
| Dashboard | `src/pages/DashboardPage.tsx` |
| Property grid | `src/components/properties/PropertyGrid.tsx` |
| Compare | `src/context/CompareContext.tsx`, `src/pages/ComparePage.tsx` |
| Mock data | `src/data/mockProperties.ts` |
| Backend entry | `app/main.py` |
| Parser | `app/services/parser.py` |
| Matching | `app/services/matching.py` |
| Ingestion | `app/services/ingestion.py` |
| Scraping | `app/services/scraping/` |
| Data routes | `app/routers/data.py` |

### Submission documents (`docs/` only)

| Deliverable | File |
|-------------|------|
| Groomed Requirements Document | `GROOMED_REQUIREMENTS.md` (this file) |
| Solution Plan / Implementation Plan | `SOLUTION_IMPLEMENTATION_PLAN.md` |
| Product / Technical Architecture Document | `PRODUCT_TECHNICAL_ARCHITECTURE.md` |
| Test Plan and Test Cases | `TEST_PLAN_AND_TEST_CASES.md` |
| Detailed Critical Review | `DETAILED_CRITICAL_REVIEW.md` |
| Agentic Coding Evidence | `AGENTIC_CODING_EVIDENCE.md` |
| Source Code and Deployment Details | `SOURCE_CODE_AND_DEPLOYMENT.md` |

---

*This document reflects the implemented codebase and is one of seven hackathon submission documents in `docs/`.*
