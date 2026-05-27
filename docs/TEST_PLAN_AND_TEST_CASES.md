# Test Plan and Test Cases

**Project:** Realist — Group 10  
**Version:** 1.0 | May 2026

> **Scope:** Tests cover implemented routes, `src/api/client.ts` integrations, and existing backend `tests/` files only.

---

## 1. Test Objectives

- Verify end-to-end flows: login, search, browse, shortlist, compare, contact, data upload/scrape.
- Validate API contracts, auth boundaries, and data integrity (upsert, no duplicates).
- Confirm UI behavior on happy path, validation errors, and offline/API-failure fallback.
- Record automated backend coverage and manual hackathon verification.

---

## 2. Test Scope

| In scope | Out of scope |
|----------|----------------|
| Backend unit tests (parser, matching, upload, scrape parsers) | Load/stress testing |
| Manual E2E via browser + curl | Cross-browser matrix (beyond Chrome/Safari spot checks) |
| Auth0 login/logout | Auth0 tenant misconfiguration recovery |
| CSV ingest/upload/scrape | Legal compliance audit of third-party sites |
| Responsive layout (mobile/tablet/desktop) | Penetration testing |

---

## 3. Test Environments

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| Local dev | `npm run dev` (5173) | `uvicorn` (8000) | Local/Railway MySQL |
| Staging/prod | Vercel URL | Railway URL | Railway MySQL |

**Prerequisites:** `.env` / `.env.example` filled, `alembic upgrade head`, optional `POST /data/ingest`.

---

## 4. Automated Tests (Backend)

Run from backend repo:

```bash
cd talentserv-ai-hackathon-group-10-backend
source venv/bin/activate
pytest -v
```

### 4.1 Test Suite Summary

| File | Tests | Focus |
|------|-------|-------|
| `tests/test_parser.py` | 7 | NL parsing: BHK, lakh/crore, rent/buy, city area, USD, locality |
| `tests/test_matching.py` | 6 | Scoring, city/bedroom/budget filters, ranking, exact BHK |
| `tests/test_upload_parser.py` | 3 | CSV/XLSX parse, empty file rejection |
| `tests/test_scrape_parsers.py` | 6 | Price parse, HTML link extract, NoBroker/Housing parsers |

### 4.2 Sample Automated Cases

| ID | Test | Expected |
|----|------|----------|
| AT-P01 | `test_parses_lakh_budget_for_rent` | `intent=rent`, budget normalized |
| AT-P02 | `test_parses_city_area_without_locality` | City set, locality not over-filtered |
| AT-M01 | `test_matches_city_and_bedrooms` | Only matching city + BHK in results |
| AT-M02 | `test_ranks_higher_scores_first` | Descending score order |
| AT-U01 | `test_parse_csv_upload_rows` | Valid rows from sample CSV |
| AT-S01 | `test_parse_nobroker_api_listings` | Structured rows from fixture JSON |

### 4.3 Last Known Automated Result

| Metric | Value |
|--------|-------|
| Command | `pytest -v` |
| Total tests | 22 unit tests (no API/integration tests) |
| Expected | All pass on Python **3.10+** / **3.12+** with deps installed |
| Python 3.9 venv | May fail collection (`X \| None` syntax); use README Python version |
| Frontend automated tests | None configured (`npm test` not in package.json) |

*Record actual pass/fail counts from your machine in the submission appendix.*

---

## 5. Manual Test Plan — API (curl)

### 5.1 Health and Public

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| API-01 | Health | `GET /health` | `{"status":"ok",...}` |
| API-02 | List properties | `GET /api/v1/properties?page=1` | 200, `items` array |
| API-03 | Parse requirement | `POST /requirements/parse` with sample text | `parsed` object with intent/city/bedrooms |

### 5.2 Authentication

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| API-04 | No token on favorites | `GET /favorites` without Bearer | 401 |
| API-05 | Valid token | `GET /me` with Bearer | 200, user profile |
| API-06 | Profile sync | Login on dashboard; Auth0 claims differ from DB | `PATCH /me` via `syncProfile` when name/email/picture differ |

### 5.3 Data Ingestion

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| API-07 | Ingest CSV | `POST /data/ingest` with API key | `rows_inserted` > 0 |
| API-08 | Upload CSV | `POST /data/upload` multipart | Insert/update counts returned |
| API-09 | Upload >10MB | Large file | 413 error |
| API-10 | Scrape NoBroker | `POST /data/scrape` nobroker, Pune | Per-source stats; rows in DB |
| API-11 | Scrape disabled | `SCRAPE_ENABLED=false` | 403 |

### 5.4 Matching and Engagement

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| API-12 | Match by text | `POST /properties/match` | Ranked items + reasons |
| API-13 | Add favorite | `POST /favorites` | 200 |
| API-14 | Remove favorite | `DELETE /favorites?listing_key=` | 204 |
| API-15 | Inquiry | `POST /inquiries` | 200, stored row |

---

## 6. Manual Test Plan — Frontend (UI)

### 6.1 Authentication

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| UI-01 | Home login | Open `/`, click login | Redirect to Auth0, return to `/dashboard` |
| UI-02 | Protected route | Visit `/properties` logged out | Redirect to login/home |
| UI-03 | Logout | Log out from shell | Session cleared |

### 6.2 Dashboard / AI Search

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| UI-04 | Empty search | Submit empty query | Inline validation error |
| UI-05 | Valid search | “2 BHK flat for rent in Pune under 35000” | Matching properties section |
| UI-06 | Try chips | Click example chip | Fills input |
| UI-07 | DB vs fallback badge | Search with/without API | Badge shows Database vs Offline |
| UI-08 | Pagination | >12 matches | Page controls work |

### 6.3 Properties Browse

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| UI-09 | Filters | Change city, type, sort | List updates |
| UI-10 | Search debounce | Type in search box | Debounced API/local filter |
| UI-11 | Load more | Scroll/load more | Appends results |
| UI-12 | Detail page | Click View Details | Detail route loads |
| UI-13 | Grid layout | Desktop width | Max 3 cards per row |

### 6.4 Shortlist, Compare, Contact

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| UI-14 | Favorite toggle | Heart on card | Saved on `/saved` |
| UI-15 | Compare add | Add 2–4 properties | Banner + `/compare` table/charts |
| UI-16 | Compare limit | Add 5th property | Limit message |
| UI-17 | Contact | Submit inquiry form | Success; required fields enforced |

### 6.5 Data Upload Page

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| UI-18 | Upload sample CSV | Upload `sample_properties_upload.csv` | Success summary |
| UI-19 | Scrape UI | Select sources + city, run scrape | Result counts or clear errors |
| UI-20 | No sources selected | Scrape with empty selection | Client validation |

### 6.6 UX / Accessibility Spot Checks

| ID | Case | Expected |
|----|------|----------|
| UI-21 | Dark mode toggle | `AppShell` toggles `.dark` on `<html>`; placeholders readable (not persisted across reload) |
| UI-22 | Mobile nav | Drawer opens; navigation works |
| UI-23 | Header alignment | Brand + navbar underline aligned on desktop |

---

## 7. Negative and Edge Cases

| ID | Scenario | Expected behavior |
|----|----------|-----------------|
| NEG-01 | Backend down | Frontend shows mock/offline catalog; search may use client filter |
| NEG-02 | Invalid property ID | Detail page error/empty state |
| NEG-03 | Duplicate favorite | Upsert/unique constraint — no duplicate rows |
| NEG-04 | Scrape robots block | `blocked_by_robots: true` in response; UI shows errors |
| NEG-05 | Wrong Auth0 audience | API 401; user sees error on profile load |
| NEG-06 | CORS mismatch | Browser blocks API; fix `CORS_ORIGINS` |
| EDGE-01 | “Pune area” in parse | City filter only, not bogus locality |
| EDGE-02 | 2 BHK exact match | Does not return 3 BHK when 2 specified |
| EDGE-03 | Compare 1 property | Compare page prompts to add more |

---

## 8. Validation Checks

| Area | Validation |
|------|------------|
| Upload | Column template, INR prices, `for_sale`/`for_rent`, row-level errors collected |
| Inquiry | Required name, email, message |
| Parse | Non-empty text |
| Property list | `page_size` max 100 |

---

## 9. Test Execution Log (Template)

| Date | Tester | Build/branch | Automated (pytest) | Manual UI | Notes |
|------|--------|--------------|--------------------|-----------|-------|
| | | | Pass / Fail | Pass / Fail | |

---

## 10. Exit Criteria for Release

- [ ] `pytest` passes in backend  
- [ ] `npm run build` passes in frontend  
- [ ] Auth0 login E2E works against deployed URLs  
- [ ] Ingest or upload populates properties  
- [ ] At least one successful match query in demo environment  
- [ ] Favorites and inquiry persist per user  

---

## 11. Submission Documents (`docs/` only)

| Deliverable | File |
|-------------|------|
| Groomed Requirements Document | `GROOMED_REQUIREMENTS.md` |
| Solution Plan / Implementation Plan | `SOLUTION_IMPLEMENTATION_PLAN.md` |
| Product / Technical Architecture Document | `PRODUCT_TECHNICAL_ARCHITECTURE.md` |
| Test Plan and Test Cases | `TEST_PLAN_AND_TEST_CASES.md` (this file) |
| Detailed Critical Review | `DETAILED_CRITICAL_REVIEW.md` |
| Agentic Coding Evidence | `AGENTIC_CODING_EVIDENCE.md` |
| Source Code and Deployment Details | `SOURCE_CODE_AND_DEPLOYMENT.md` |

## 12. Test assets (repository paths)

- Backend tests: `talentserv-ai-hackathon-group-10-backend/tests/`  
- Sample upload: `public/sample_properties_upload.csv`
