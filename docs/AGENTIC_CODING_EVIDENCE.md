# Agentic Coding Evidence

**Project:** Realist — Group 10  
**Version:** 1.0 | May 2026

> **Scope:** Summary of AI-assisted work on the implemented Group 10 codebase and the seven submission documents in `docs/`.

---

## 1. Purpose

This document summarizes how AI-assisted development tools (Cursor Agent, Composer, and related workflows) were used across the hackathon lifecycle: requirements, design, implementation, testing, review, debugging, and iteration.

---

## 2. Tools Used

| Tool | Role |
|------|------|
| **Cursor IDE** | Primary editor with inline AI |
| **Cursor Agent (Composer)** | Multi-file refactors, docs, backend fixes, terminal ops |
| **Codebase search / grep** | Grounding answers in actual repo structure |
| **Terminal integration** | Run `npm run build`, `uvicorn`, `pytest`, port management |

---

## 3. Usage by Phase

### 3.1 Requirement Understanding

| Activity | How AI helped |
|----------|----------------|
| Reverse-engineer product scope | Agent read routes, API client, backend routers, and schemas |
| Groomed requirements | Produced `docs/GROOMED_REQUIREMENTS.md` from routes, client, and backend routers |
| Scope boundaries | Identified scrape vs upload vs ingest paths and Auth0-protected routes |

**Evidence:** `docs/GROOMED_REQUIREMENTS.md` derived from full-stack codebase analysis, not from a static brief alone.

### 3.2 Design

| Activity | How AI helped |
|----------|----------------|
| UI/UX alignment | Proposed enterprise layout: unified header, brand color `#003865` family |
| Architecture doc | Mapped frontend ↔ backend ↔ MySQL ↔ Auth0 ↔ scrapers |
| Grid and card density | Iterated `PROPERTY_GRID_CLASS` and card sizing from feedback |

**Evidence:** `docs/PRODUCT_TECHNICAL_ARCHITECTURE.md`, `src/index.css` design tokens, `AppShell.tsx` layout.

### 3.3 Implementation

| Area | AI-assisted work |
|------|------------------|
| **Layout** | Desktop top bar alignment; sidebar/navbar single underline |
| **Theming** | Accent HSL from brand blue; dark mode placeholder tokens |
| **Components** | Property grid (max 3 columns), smaller cards, skeletons |
| **Forms** | Input/textarea placeholder visibility in dark mode |
| **Backend compat** | Python 3.9 typing fixes (`Optional`, `__future__ annotations`, FastAPI `response_model`) |
| **Documentation** | Six hackathon deliverable docs in `docs/` |

### 3.4 Testing

| Activity | How AI helped |
|----------|----------------|
| Test plan authoring | Listed pytest files, manual UI/API cases, negative/edge scenarios |
| Build verification | Ran `npm run build` after UI changes |
| Backend tests | Referenced existing `tests/` suite in documentation |

**Evidence:** `docs/TEST_PLAN_AND_TEST_CASES.md`; automated cases map to `talentserv-ai-hackathon-group-10-backend/tests/`.

### 3.5 Code Review

| Activity | How AI helped |
|----------|----------------|
| Self-review document | Structured critique: security, performance, debt, limitations |
| Post-review fixes | Documented improvements (parser, matching, layout, typing) in critical review |

**Evidence:** `docs/DETAILED_CRITICAL_REVIEW.md`.

### 3.6 Debugging and Iteration

| Issue | Agent approach |
|-------|----------------|
| Header misalignment | Inspected `AppShell.tsx` structure; refactored to shared top bar |
| Backend won’t start on 3.9 | Traced import errors; patched models/routers/config |
| Port 8000 in use | `lsof` / kill and restart `uvicorn` |
| Scrape confirmation | Traced `POST /api/v1/data/scrape` and frontend `scrapeListings()` |
| TypeScript build errors | Fixed after shell/header refactor |

**Pattern:** User feedback → targeted file read → minimal diff → verify build/server.

---

## 4. Representative Prompts / Tasks

Examples of instructions given to the agent (paraphrased):

1. “Fix underline alignment between sidebar app name and navbar.”
2. “Use #003865 as accent; then a lighter shade.”
3. “Property grid max 3 per row with more spacing; reduce card size.”
4. “Fix dark mode placeholder on all inputs.”
5. “Run/stop/restart backend on port 8000.”
6. “Is web scraping used?” → codebase trace and explanation.
7. “Create groomed requirements from the codebase.”
8. “Create 6 documentation files for hackathon submission.”

---

## 5. Human vs AI Division

| Human (team) | AI (agent) |
|--------------|------------|
| Product vision, hackathon goals, demo narrative | Bulk documentation drafts from repo facts |
| Auth0 tenant, Railway/Vercel accounts, secrets | Env variable templates and setup commands |
| Final acceptance of UI and copy | Layout/CSS refactors from verbal specs |
| Data sourcing decisions (CSV vs scrape) | Scrape flow explanation and test case lists |
| Code review judgment on production risks | Structured critical review template |

**Important:** All AI-generated changes were applied in the real repository; the team validated builds, login, and demo paths locally.

---

## 6. Iteration Metrics (Qualitative)

| Metric | Observation |
|--------|-------------|
| Turnaround on UI tweaks | Minutes per layout/color/grid change |
| Cross-repo fixes | Frontend + backend typing in same session |
| Documentation | Six docs + groomed requirements in one coordinated pass |
| Risk | Agent must be verified—e.g. Python version mismatch required human-noticed 3.9 fixes |

---

## 7. Lessons Learned

1. **Ground agents in the repo** — Requirements and architecture docs stay accurate when generated from code, not assumptions.
2. **Verify runtime** — AI can suggest fixes; `npm run build` and `pytest` confirm them.
3. **Small, explicit UI requests** — Color, grid columns, and alignment iterate well.
4. **Environment parity** — Document Python 3.12+ vs actual 3.9 venv to avoid repeat typing patches.
5. **Keep exactly seven submission documents in `docs/`** — No extra markdown files beside the hackathon deliverables.

---

## 8. Submission Documents (`docs/` only)

| Deliverable | File |
|-------------|------|
| Groomed Requirements Document | `GROOMED_REQUIREMENTS.md` |
| Solution Plan / Implementation Plan | `SOLUTION_IMPLEMENTATION_PLAN.md` |
| Product / Technical Architecture Document | `PRODUCT_TECHNICAL_ARCHITECTURE.md` |
| Test Plan and Test Cases | `TEST_PLAN_AND_TEST_CASES.md` |
| Detailed Critical Review | `DETAILED_CRITICAL_REVIEW.md` |
| Agentic Coding Evidence | `AGENTIC_CODING_EVIDENCE.md` (this file) |
| Source Code and Deployment Details | `SOURCE_CODE_AND_DEPLOYMENT.md` |

---

## 9. Statement

Group 10 used Cursor’s agentic coding workflow as an accelerator for documentation, UI polish, cross-stack debugging, and consistency with existing patterns—not as a replacement for team decisions on scope, security, or demo strategy.
