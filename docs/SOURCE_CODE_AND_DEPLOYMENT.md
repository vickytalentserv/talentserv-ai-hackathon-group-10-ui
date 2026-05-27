# Source Code and Deployment Details

**Project:** Realist — Group 10  
**Version:** 1.0 | May 2026

> **Scope:** Repository layout, env vars, and run instructions for the implemented frontend and backend only.

---

## 1. Repository Overview

This hackathon solution spans **two repositories** (monorepo-style layout on disk):

| Repository | Path (local) | Stack |
|------------|--------------|-------|
| **Frontend (UI)** | `talentserv-ai-hackathon-group-10-ui` | React 19, Vite 8, TypeScript, Tailwind v4, Auth0 React |
| **Backend (API)** | `talentserv-ai-hackathon-group-10-backend` | FastAPI, SQLAlchemy, Alembic, MySQL, Auth0 JWT |

**Product name in UI:** Realist

---

## 2. Deployment URLs

| Environment | URL | Notes |
|-------------|-----|-------|
| **Frontend (production)** | *Set by team* — e.g. `https://<project>.vercel.app` | Deploy via Vercel; update Auth0 callback URLs |
| **Backend (production)** | *Set by team* — e.g. `https://<service>.up.railway.app` | Deploy via Railway; set `VITE_API_BASE_URL` to this URL |
| **API docs (local)** | `http://localhost:8000/docs` | Swagger UI when backend is running |
| **Frontend (local)** | `http://localhost:5173` | Vite dev server default port |

> **Action for submission:** Replace placeholder URLs above with your live Vercel and Railway URLs before judging.

---

## 3. Frontend Source Structure

```
talentserv-ai-hackathon-group-10-ui/
├── public/                    # Static assets, sample CSV
├── src/
│   ├── api/
│   │   └── client.ts          # API client (properties, match, scrape, favorites, …)
│   ├── components/
│   │   ├── layout/            # AppShell, PageHeader, BrandLogo
│   │   ├── properties/        # PropertyCard, PropertyGrid, filters
│   │   ├── dashboard/         # AISearchSection, matching results
│   │   ├── compare/           # Compare table/charts
│   │   └── ui/                # shadcn-style primitives (button, input, …)
│   ├── context/               # PropertyContext, CompareContext (no ThemeContext)
│   ├── pages/                 # Home, Dashboard, Properties, Detail, Saved, Compare, Upload
│   ├── App.tsx                # Routes + Auth0 provider
│   ├── config.ts              # Auth0 + API config
│   ├── index.css              # Design tokens (#003865 accent family)
│   └── main.tsx
├── docs/                      # Hackathon documentation (this folder)
├── .env.example
├── vercel.json                # SPA rewrites → index.html
├── package.json
├── vite.config.ts
└── README.md
```

### 3.1 Frontend API integrations

Only these backend paths are called from `src/api/client.ts`:

`/api/v1/me` (GET, PATCH), `/api/v1/requirements/parse`, `/api/v1/requirements`, `/api/v1/requirements/latest`, `/api/v1/properties`, `/api/v1/properties/{id}`, `/api/v1/properties/match`, `/api/v1/favorites`, `/api/v1/inquiries`, `/api/v1/data/upload/templates/{type}`, `/api/v1/data/upload`, `/api/v1/data/scrape`.

**Not called from UI:** `/health`, `/api/v1/data/ingest`, `/api/v1/data/scrape/sources`.

### 3.2 Key Routes

| Path | Auth | Page |
|------|------|------|
| `/` | Public | Landing / login |
| `/dashboard` | Protected | AI search + matches |
| `/properties` | Protected | Browse + filters |
| `/properties/:id` | Protected | Property detail |
| `/saved` | Protected | Favorites |
| `/compare` | Protected | Side-by-side compare |
| `/upload` | Protected | CSV upload + live scrape |

---

## 4. Backend Source Structure

```
talentserv-ai-hackathon-group-10-backend/
├── app/
│   ├── main.py                # FastAPI app, CORS, routers
│   ├── config.py              # Settings from env
│   ├── dependencies.py        # Auth0 JWT validation
│   ├── models/                # SQLAlchemy models (User, Property, Favorite, …)
│   ├── schemas/               # Pydantic request/response models
│   ├── routers/               # API route handlers
│   │   ├── data.py            # ingest, upload, scrape
│   │   ├── properties.py
│   │   ├── favorites.py
│   │   ├── inquiries.py
│   │   └── requirements.py
│   └── services/
│       ├── matching.py
│       ├── parser.py
│       ├── upload_parser.py
│       └── scraping/            # NoBroker, MagicBricks, Housing, 99acres
├── alembic/                   # DB migrations
├── data/                      # Fallback CSV datasets
├── tests/                     # pytest suite
├── .env.example
├── requirements.txt
├── railway.toml               # Deploy: migrate + uvicorn
└── README.md
```

---

## 5. Local Setup — Frontend

### 5.1 Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm**
- Auth0 SPA application configured
- Backend running (or app uses offline mock fallback)

### 5.2 Steps

```bash
cd talentserv-ai-hackathon-group-10-ui
npm install
cp .env.example .env
# Edit .env with your Auth0 and API values
npm run dev
```

Open **http://localhost:5173**.

### 5.3 Production build (local verify)

```bash
npm run build
npm run preview   # optional — serves dist/
```

---

## 6. Local Setup — Backend

### 6.1 Prerequisites

- **Python 3.12+** recommended (README); local venv may be 3.9 with compatibility patches applied
- **MySQL** (local or Railway connection string)
- Auth0 API configured with same audience as frontend
- **Playwright Chromium** (only if using Housing.com scrape): `playwright install chromium`

### 6.2 Steps

```bash
cd talentserv-ai-hackathon-group-10-backend
python3.12 -m venv venv    # prefer 3.12+
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium   # optional, for Housing scrape
cp .env.example .env
# Set DATABASE_URL and Auth0 vars
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 6.3 Seed demo data

```bash
curl -X POST http://localhost:8000/api/v1/data/ingest
```

### 6.4 Stop / restart backend (port 8000)

```bash
lsof -ti :8000 | xargs kill -9
uvicorn app.main:app --reload --port 8000
```

---

## 7. Environment Variables

### 7.1 Frontend (`.env`)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_AUTH0_DOMAIN` | Yes | `your-tenant.us.auth0.com` | Auth0 tenant |
| `VITE_AUTH0_CLIENT_ID` | Yes | `abc123...` | SPA client ID |
| `VITE_AUTH0_AUDIENCE` | Yes | `https://api.realestate-hackathon` | API identifier |
| `VITE_AUTH0_REDIRECT_URI` | Yes | `http://localhost:5173` | Callback (add Vercel URL in prod) |
| `VITE_API_BASE_URL` | Yes | `http://localhost:8000` | Backend base URL (no trailing slash) |

Copy from: `talentserv-ai-hackathon-group-10-ui/.env.example`

### 7.2 Backend (`.env`)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `AUTH0_DOMAIN` | Yes | Same as frontend tenant | JWT issuer |
| `AUTH0_API_AUDIENCE` | Yes | `https://api.realestate-hackathon` | Must match SPA audience |
| `AUTH0_ALGORITHMS` | Yes | `RS256` | JWT algorithm |
| `DATABASE_URL` | Yes | `mysql+pymysql://...` | SQLAlchemy URL |
| `CORS_ORIGINS` | Yes | `http://localhost:5173,https://your-app.vercel.app` | Comma-separated |
| `APP_ENV` | No | `development` | Environment label |
| `INGEST_API_KEY` | Dev | `local-dev-ingest-key` | Protects `/data/ingest` |
| `DATA_DIR` | No | `data` | CSV fallback directory |
| `OPENAI_API_KEY` | No | `sk-...` | Optional LLM parse enhancement |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model name |
| `SCRAPE_ENABLED` | No | `true` | Master scrape switch |
| `SCRAPE_DELAY_SECONDS` | No | `2.0` | Rate limit between fetches |
| `SCRAPE_PLAYWRIGHT_*` | No | See `.env.example` | Housing.com browser scrape |

Copy from: `talentserv-ai-hackathon-group-10-backend/.env.example`

---

## 8. Deployment — Frontend (Vercel)

1. Import GitHub repo; set **root directory** to `talentserv-ai-hackathon-group-10-ui` (if in a parent org repo, adjust accordingly).
2. **Framework preset:** Vite.
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. Add all `VITE_*` environment variables; set `VITE_API_BASE_URL` to Railway backend URL.
6. `vercel.json` rewrites all routes to `index.html` for client-side routing.

### 8.1 Auth0 (SPA) for production

Add your Vercel URL to:

- Allowed Callback URLs  
- Allowed Logout URLs  
- Allowed Web Origins  

Ensure the SPA requests the same **audience** as `AUTH0_API_AUDIENCE` on the backend.

---

## 9. Deployment — Backend (Railway)

Configured in `railway.toml`:

```toml
[deploy]
startCommand = "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
```

### 9.1 Railway checklist

1. Create project + **MySQL** plugin (provides `DATABASE_URL`).
2. Deploy service from `talentserv-ai-hackathon-group-10-backend` root.
3. Set Auth0 and `CORS_ORIGINS` (include Vercel frontend URL).
4. Optional: `SCRAPE_ENABLED=false` if Playwright not configured on host.
5. Verify: `GET https://<backend>/health` → `{"status":"ok",...}`

### 9.2 Post-deploy seed

```bash
curl -X POST https://<backend>/api/v1/data/ingest \
  -H "X-Ingest-Key: <INGEST_API_KEY>"
```

(Header name per your `data.py` implementation — see backend README.)

---

## 10. Auth0 Configuration Summary

| Item | Frontend | Backend |
|------|----------|---------|
| Application type | Single Page Application | API (Resource Server) |
| Audience | `VITE_AUTH0_AUDIENCE` | `AUTH0_API_AUDIENCE` (same value) |
| Token | Access token with audience | Validated via JWKS |

---

## 11. Technology Versions (Reference)

| Component | Version (approx.) |
|-----------|-------------------|
| React | 19.2 |
| Vite | 8.x |
| TypeScript | 6.x |
| Tailwind CSS | 4.3 |
| FastAPI | See `requirements.txt` |
| Python | 3.12+ recommended |

---

## 12. Quick Verification Checklist

- [ ] Backend `/health` returns OK  
- [ ] Frontend loads and Auth0 login succeeds  
- [ ] `POST /api/v1/data/ingest` or CSV upload populates properties  
- [ ] Dashboard search returns ranked matches  
- [ ] Favorite + inquiry work with Bearer token  
- [ ] `npm run build` succeeds  
- [ ] `pytest` passes in backend  

---

## 13. Submission Documents (`docs/`)

| Deliverable | File |
|-------------|------|
| Groomed Requirements Document | `GROOMED_REQUIREMENTS.md` |
| Solution Plan / Implementation Plan | `SOLUTION_IMPLEMENTATION_PLAN.md` |
| Product / Technical Architecture Document | `PRODUCT_TECHNICAL_ARCHITECTURE.md` |
| Test Plan and Test Cases | `TEST_PLAN_AND_TEST_CASES.md` |
| Detailed Critical Review | `DETAILED_CRITICAL_REVIEW.md` |
| Agentic Coding Evidence | `AGENTIC_CODING_EVIDENCE.md` |
| Source Code and Deployment Details | `SOURCE_CODE_AND_DEPLOYMENT.md` |

---

## 14. Repository Access

Provide judges with:

- GitHub (or GitLab) URLs for **both** frontend and backend repos  
- Branch name used for submission (e.g. `main` or `real-estate-new-changes`)  
- Commit hash or release tag at submission time  

*Complete source code is contained in the repositories above; this document describes structure, setup, and deployment—not a code dump.*
