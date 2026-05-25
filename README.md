# EstateIntel Agent - Real Estate Property Intelligence Dashboard

Hackathon MVP for the **Agentic Programming Hackathon - Real Estate Property Intelligence Dashboard** challenge.

The app lets an authenticated user enter a natural-language property requirement, parses it into structured filters,
normalizes and deduplicates sample listings, enriches results with builder reputation, public sentiment, and trend
signals, then presents a comparative recommendation dashboard.

## MVP features

- Supabase Google OAuth integration for third-party authentication.
- Protected dashboard route with login/logout and visible user identity.
- Local demo identity for offline judging when Supabase env vars are not configured. No passwords are stored.
- Natural-language parsing for city, locality, budget, BHK, transaction type, status, property type, and notes.
- JSON fallback datasets for properties, builder/project reputation, sentiment, and trend context.
- Cleanup for price, area, BHK, locality, status, source, and derived price per square foot.
- Duplicate detection across mock portal sources using locality/BHK/project/title/price/area similarity.
- Comparative widgets for requirement summary, matching properties, price comparison, locality comparison, builder
  reputation, sentiment, trend context, and ranked recommendations.
- Vitest coverage for parsing, cleanup, deduplication, and dashboard logic.

## Local setup

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal. If Supabase is not configured, click **Use local demo identity** to enter the
protected dashboard for local review.

## Third-party auth configuration

This project uses Supabase Auth with Google OAuth when these environment variables are present:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Supabase setup checklist:

1. Create a Supabase project.
2. Enable Google as an OAuth provider under Authentication > Providers.
3. Add the local and deployed app URLs to allowed redirect URLs.
4. Store the two variables above in `.env.local` for local development or in the hosting platform environment.

The fallback demo login stores only a non-sensitive demo identity in browser localStorage so the app remains runnable
without OAuth credentials. It is not a password system and should not be used as production authentication.

## Scripts

```bash
npm run dev      # local Vite server
npm run test     # Vitest unit tests
npm run lint     # ESLint
npm run build    # TypeScript and production build
npm run preview  # preview production build
```

## Sample datasets

All demo data is local JSON fallback data so the demo is reliable and does not depend on live scraping:

- `src/data/properties.json` - mock Housing/MagicBricks/NoBroker/builder-style listings.
- `src/data/builders.json` - sample builder/project reputation profiles.
- `src/data/sentiment.json` - sample public-comment sentiment summaries.
- `src/data/trends.json` - sample demand/search-interest style trend context.

## Data-source compliance note

No live scraping is performed in this MVP. The listing records use mock URLs under `example.com` and manually created
sample data inspired by common real-estate portal fields. The implementation does not bypass logins, CAPTCHA, rate
limits, robots.txt, or anti-bot controls, and it does not collect phone numbers, private profiles, or sensitive contact
data. Source names and source URLs are retained where available in the fallback dataset.

If a future live ingestion connector is added, it should first document robots.txt and terms-of-use checks for each
source, use low-volume polite collection only where allowed, and preserve source attribution.

## Architecture

```text
User query
  -> parseRequirement()
  -> normalizeProperties()
  -> deduplicateProperties()
  -> enrichProperty()
  -> buildDashboardModel()
  -> React comparative widgets
```

Key files:

- `src/lib/requirementParser.ts` - natural-language field extraction.
- `src/lib/normalization.ts` - cleanup and derived metrics.
- `src/lib/deduplication.ts` - duplicate/similar listing detection.
- `src/lib/intelligence.ts` - filtering, enrichment, scoring, locality comparison, and summaries.
- `src/lib/auth.ts` - Supabase OAuth adapter and offline demo identity.
- `src/lib/propertyIntelligence.test.ts` - validation checks.

## Agentic programming evidence

- Requirement breakdown: converted the challenge brief into MVP pillars covering auth, parsing, data ingestion,
  cleanup, deduplication, enrichment, dashboarding, tests, and documentation.
- Data-source planning: selected local JSON/mock data to satisfy fallback reliability and avoid prohibited scraping.
- Architecture/design: separated pure data pipeline functions from React presentation so logic can be tested.
- Implementation: used AI-assisted coding to replace the starter Vite template with a complete dashboard.
- Data cleanup logic: generated normalization for Indian price formats, BHK, area, locality aliases, and statuses.
- Testing: added AI-generated Vitest cases for parsing, cleanup, deduplication, and recommendation flow.
- Review/iteration: validation commands should be run before submission; issues found by lint/test/build are fixed in
  the same branch.

## Known limitations

- Runtime AI is not called from the browser; parsing and explanations are deterministic for offline reliability.
- Supabase OAuth requires project credentials and provider setup by the team.
- Trend, sentiment, and reputation signals are sample/manual data, not live third-party measurements.
- Locality extraction is rule-based and currently optimized for the included Pune and Bengaluru examples.
