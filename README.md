# AI Radar

> **Discover the AI tools you didn't know existed.**

AI Radar is a web-based AI discovery and research tool built on the public **FreeSERP.ai API**.

Instead of presenting a static directory, AI Radar turns real indexed websites into an interactive discovery experience where users can:

- search AI products and websites
- explore the AI ecosystem by niche
- filter and sort indexed websites
- inspect individual tools
- compare up to three AI websites
- explore observable technical and index signals
- navigate directly to the original websites

The project is a small production-minded application focused on real API integration, data integrity, reusable architecture, UX, and visual product quality.

## Live demo

https://anastasiia1002.github.io/AI_Radar/

## What was built

The application is organized around four experiences.

### 1. Home

The homepage introduces AI Radar and opens the index.

Users can:

- search for AI tools from the header
- open Explore
- see recently confirmed-live websites from the index
- see websites with Domain Rating 40 or higher
- open the AI landscape

Those two strips request FreeSERP. They are not a hardcoded product list. The hero renders before those requests finish.

### 2. Explore

Explore is the search workspace.

Users can:

- search by keyword
- filter by AI niche
- filter by a minimum Domain Rating (10+, 20+, 40+, 60+, 80+, or another `dr` value from the URL)
- filter by confirmed-live date
- sort results
- page through results
- open a tool record
- add a tool to compare

Explore state lives in the URL.

```text
/explore?q=agents&ai_categories=AI%20Agents%20%26%20Autonomous
```

`niche` is still accepted as an alias for the same category filter. The client never sends FreeSERP's ignored `niche` parameter.

### 3. AI landscape / Niches

`/niches` maps the categories in the AI-startup index.

It includes:

- an overview of the indexed ecosystem
- category distribution
- indexed counts
- short explanations of what each category name means
- links into Explore
- three “start here” paths
- a note on how the counts should be read

Category counts are indexed website counts, not market share. A website may belong to more than one category, so the shares of listed tags are not a partition of the startup index. If live stats fail, the page uses a documented snapshot and labels it as a snapshot.

### 4. Comparison lab

Compare holds up to three indexed websites chosen from Explore or a tool page. The selection is stored in `localStorage`.

The comparison shows only FreeSERP fields:

- AI categories
- Domain Rating
- confirmed-live date
- first indexed date
- last fetched date
- technology signal
- TLD
- HTTP status
- category overlap
- an index timeline

There is no winner and no quality score. Replace removes one site and returns to Explore.

## Product concept

> Searching for AI tools should feel more like exploring an ecosystem than browsing a static directory.

```text
DISCOVER
    ↓
EXPLORE
    ↓
INSPECT / COMPARE
```

Home and Niches are the entry points. Explore is the filterable index. Tool pages and Compare inspect observable signals.

## FreeSERP API integration

Base endpoint:

```text
https://freeserp.ai/api.php
```

No API key and no account.

Discovery always sends `index=sites` and `ai_startups=1`.

`niche=AI` is never sent. That parameter is ignored and would otherwise return the broader website index. Category filtering uses `ai_categories`.

### Parameters the app sends

| Parameter | Purpose |
| --- | --- |
| `index=sites` | Homepage profiles, not full-web search |
| `ai_startups=1` | AI-startup slice |
| `q` | Keyword search |
| `ai_categories` | Niche filter |
| `sort` | `relevance`, `went_live`, `dr`, or `first_seen` |
| `order` | `asc` or `desc` |
| `dr_min` | Minimum Domain Rating |
| `from_date` | Confirmed live on or after this date |
| `size` | Page size (24 in Explore, 4 on the homepage strips) |
| `from` | Pagination offset |

The public API also accepts `dr_max` and `to_date`. This UI does not send them.

Sort labels:

- Most relevant, only when a query is present; otherwise the request uses recently confirmed live
- Recently discovered (`went_live` descending): when the homepage was confirmed reachable, not a launch date
- Highest Domain Rating
- Recently added to the index (`first_seen` descending)

### Browser access

FreeSERP currently sends `Access-Control-Allow-Origin` twice (`*, *`). Browsers reject that response even when the status is 200.

- Local dev and preview call same-origin `/freeserp`, which Vite proxies to the API.
- The static GitHub Pages build still targets `https://freeserp.ai/api.php`, then reads it through `https://proxy.cors.dev/` and, if that fails, `https://cors.raghu.workers.dev/`. The relay only carries the same JSON.
- Node scripts, including `npm run verify`, call FreeSERP directly.

Optional overrides: `VITE_FREESERP_BASE_URL` and `VITE_FREESERP_AGENT` (default `AI-Radar/0.1`). See `.env.example`.

## Result data and normalization

Fields read from the API include `domain`, `url`, `title`, `ai_summary`, `ai_categories`, `category`, `ai_source`, `dr`, `went_live`, `first_seen`, `fetched_at`, `tld`, and `http_status`.

```text
FreeSERP JSON
  → src/api/freeserp.ts
  → src/api/normalizers.ts
  → AiRadarSite
  → hooks
  → pages and components
```

Normalized fields: `domain`, `url`, `title`, `summary`, `categories`, `technologySignal`, `domainRating`, `confirmedLive`, `firstSeen`, `lastFetched`, `tld`, `httpStatus`.

Missing scalars are `null`. Missing categories are `[]`. A missing `url` stays null. The client does not invent `https://<domain>`.

`ai_source` is kept only for an allowlist (React, Next.js, Lovable, v0, Bolt, Base44, WordPress, Shopify, Webflow, Framer, and `ai_likely`). Anything else is dropped. The UI calls the field **technology signal** and shows “Technology not detected” when it is absent. It is not a verified stack audit.

Domain Rating is not popularity. `confirmedLive` and `firstSeen` are index dates, not a company launch date.

## Caching and errors

Search responses cache for 45 seconds. Stats cache for 30 minutes. Identical in-flight searches share one request. `AbortController` cancels the previous search. Aborted requests are not stored as successes.

The UI separates loading, results, an empty result set, an unreachable index, and a missing field. Empty search is a valid response. Missing fields use “Not available”, “No category detected”, “Technology not detected”, or “Website unavailable”.

Paging covers the first 10,000 matches (`from + size`).

## Design

Dark research instrument, not a generic dashboard.

| Token | Value |
| --- | --- |
| Background | `#0c0e11` |
| Surface | `#14171c` |
| Raised | `#1c2026` |
| Text | `#f3f1ec` |
| Muted | `#c2bdb4` |
| Accent | `#e0b15a` |
| Danger | `#e07a6a` |

Fraunces is for the wordmark and major headings. Source Sans 3 is the UI face. IBM Plex Mono is for domains, counts, and technical labels. Amber is a signal, not a fill for the whole page.

Motion is short. `prefers-reduced-motion` collapses decorative animation. Focus states are visible. External links say that they leave AI Radar.

Desktop, tablet, and a 390px-wide layout are part of the check. Compare stacks metrics on small screens instead of squeezing three table columns. The niche distribution is a vertical list.

## Project structure

```text
src/
├── api/
│   ├── freeserp.ts
│   ├── types.ts
│   ├── normalizers.ts
│   ├── params.ts
│   ├── cache.ts
│   └── snapshot.ts
├── types/site.ts
├── hooks/
│   ├── useSearch.ts
│   ├── useSite.ts
│   ├── useCompare.tsx
│   ├── useCompareSites.ts
│   └── useIndexSnapshot.ts
├── pages/
│   ├── HomePage.tsx
│   ├── ExplorePage.tsx
│   ├── NichesPage.tsx
│   ├── ToolPage.tsx
│   └── ComparePage.tsx
├── components/
│   ├── layout/
│   ├── home/
│   ├── explore/
│   ├── niches/
│   ├── site/
│   └── compare/
├── niches/
├── compare/
└── styles/index.css
```

React, TypeScript, Vite, React Router, and Tailwind CSS. No state library and no React Query. No API secret.

## Decisions

- Real index fields over fabricated ratings, reviews, traffic, funding, or popularity.
- `ai_startups=1` and `ai_categories` over the ignored `niche=AI` parameter.
- Observable differences over a winner or a similarity percentage.
- The Explore URL is the source of truth for search and filters.
- Pages read `AiRadarSite`, not the raw JSON.
- Homepage strips are extra entry points into the same dataset.

## Known limitations

- Metadata can be missing. The UI says so.
- Technology signals are heuristic.
- Domain Rating is not popularity.
- Category membership overlaps.
- `first_seen` and `went_live` are not launch dates.
- Some records have no usable URL.
- The index window stops at 10,000 matches.
- Upstream sites can change after they are indexed.
- GitHub Pages cannot call FreeSERP as a same-origin proxy, so production browser reads go through a CORS relay.
- Compare links are not shareable yet. The selection stays in this browser.

## Possible next steps

These are not built. They need data or product work beyond the current index.

- Richer discovery: technology filters, combined categories, saved searches.
- Category change over time, only from stored historical snapshots, not from one stats response.
- Saved tools, comparisons, and searches.
- A shareable compare URL such as `/compare?tools=a.com,b.com`.
- Pricing, integrations, or funding only if a reliable source exists.
- Periodic snapshots for real growth and disappearance counts.
- Intent shortcuts that map to existing filters, with the interpretation shown.
- Natural-language search that becomes an explicit FreeSERP query, not a hidden rewrite.

## Getting started

```bash
npm install
npm run dev
```

Vite serves the app on port 3000.

```bash
npm run typecheck
npm run verify
npm run build
```

`verify` checks request construction, normalization, cache behavior, comparison notes, and a live FreeSERP request.

## Deployment

GitHub Pages publishes the `main` branch. The live `index.html` loads the built files in `assets/`. `index.source.html` is the Vite entry. Production builds set `GITHUB_PAGES=true` so asset URLs use the `/AI_Radar/` base path.

## Data source

This project uses the public FreeSERP API. Availability and accuracy depend on that API.
