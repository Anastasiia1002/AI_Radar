# AI Radar

Find the AI tools you didn't know existed.

AI Radar is a discovery interface over a live index of AI websites. It searches FreeSERP’s homepage index instead of a hand-maintained directory. Explore lists the indexed fields and filters them from the URL. A comparison table is not part of this build.

## Audience

People looking for AI products they have not already heard of: researchers, builders, and operators comparing real websites rather than a curated shortlist.

## API integration

FreeSERP is the only product data source. Requests are public: no API key and no account.

The browser calls same-origin `/freeserp`. FreeSERP currently sends `Access-Control-Allow-Origin` twice (`*, *`), which browsers reject, so the Vite dev server, `vite preview`, and the included host configs proxy that path to `https://freeserp.ai/api.php`. Node scripts call FreeSERP directly.

Discovery calls `GET https://freeserp.ai/api.php` and **always** sends:

- `index=sites` — homepage profiles, not full-web page search
- `ai_startups=1` — the genuine AI-product slice

`niche=AI` is never sent. Phase 1 confirmed that FreeSERP ignores `niche` and would otherwise return the entire real-site index.

| Product control | FreeSERP parameter |
| --- | --- |
| Search | `q` |
| Niche | `ai_categories` |
| Domain Rating floor | `dr_min` |
| Confirmed live after | `from_date` |
| Recently discovered | `sort=went_live&order=desc` |
| Highest Domain Rating | `sort=dr&order=desc` |
| Recently added to the index | `sort=first_seen&order=desc` |
| Most relevant | `sort=relevance` (only when a query is present) |

`went_live` is the date FreeSERP first confirmed the homepage reachable, not an official launch date. `ai_source` is stored as `technologySignal` and only when it matches a small allowlist. It is a stack signal, not a verified technology. Missing URLs stay null. The client does not invent `https://<domain>`.

Raw responses stay inside `src/api`. The UI reads `AiRadarSite`.

## Architecture

```
FreeSERP JSON
  → src/api/freeserp.ts      request, errors, cache
  → src/api/normalizers.ts   AiRadarSite
  → src/api/params.ts        FilterState ↔ URL ↔ SearchParams
  → hooks                    useSearch, useSite, useCompare, useIndexSnapshot
  → Explore list, filters, and website record
```

Explore state lives in the URL (`q`, `niche`, `sort`, `dr`, `after`, `page`). Identical in-flight searches share one request. Successful responses are cached for 45 seconds. The cache key includes every parameter that changes the body, and aborted requests are not stored. Stats snapshots, when used, cache for 30 minutes and fall back to a documented 2 Oct 2026 snapshot labeled `source: "fallback"`.

Routes:

| Path | Behavior |
| --- | --- |
| `/` | Discovery intro and niche links. It does not wait on index feeds. |
| `/explore` | Lists indexed homepages. Sort, niche, Domain Rating, confirmed-live date, and page come from the URL. |
| `/tool/*` | Domain from the path. Shows the indexed fields when that exact domain is in the AI slice. |
| `/compare` | Up to 3 selected domains, stored locally. No scores or winner. |

## GitHub Pages

Public URL, after Pages is turned on in the repository settings:

https://anastasiia1002.github.io/AI_Radar/

Pages is set to publish the `main` branch. The live `index.html` loads the built files in `assets/`, because GitHub does not run Vite. `index.source.html` stays the entry used by the dev server and `npm run build`.

GitHub Pages is static. FreeSERP currently sends `Access-Control-Allow-Origin` twice (`*, *`), and browsers block that response even when the status is 200. The page still builds the FreeSERP URL, then reads it through `https://proxy.cors.dev/` (and `https://cors.raghu.workers.dev/` if the first relay fails). The relay only carries the same index response. Local development still uses the `/freeserp` proxy.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (port 3000).

```bash
npm run typecheck
npm run verify
npm run build
```

`verify` checks request construction, normalization, cache behavior, and a live FreeSERP request.

## Environment

No secrets. Both variables are optional.

| Variable | Default |
| --- | --- |
| `VITE_FREESERP_BASE_URL` | `/freeserp` in the dev server, `https://freeserp.ai/api.php` for production and Node |
| `VITE_FREESERP_AGENT` | `AI-Radar/0.1` |

`agent` identifies this app to FreeSERP and does not change results. See `.env.example`.

## Technical decisions

- React, TypeScript, Vite, and Tailwind. No state library, no React Query, no component kit.
- One amber accent on a graphite field. Fraunces is limited to the wordmark and headings. Source Sans 3 is the UI face. IBM Plex Mono is for domains and index metadata.
- The homepage does not prefetch discovery feeds, so the first screen is not blocked on those requests.
- Domain Rating, dates, and category tags are shown only when the API sends them. Popularity, ratings, pricing, funding, and screenshots are not part of the model.
