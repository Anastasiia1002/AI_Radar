import assert from 'node:assert/strict'
import { clearRequestCache } from '../src/api/cache.ts'
import { FreeSerpError } from '../src/api/errors.ts'
import { buildSearchUrl, fetchIndexSnapshot, lookupSite, searchSites } from '../src/api/freeserp.ts'
import { normalizeSite } from '../src/api/normalizers.ts'
import {
  buildSearchQuery,
  filterStateToSearchParams,
  filterStateToUrlSearch,
  urlToFilterState,
} from '../src/api/params.ts'
import type { AiRadarSite, FilterState, SearchParams } from '../src/types/site.ts'

const MODEL_KEYS = [
  'broadCategory',
  'categories',
  'confirmedLive',
  'domain',
  'domainRating',
  'firstSeen',
  'httpStatus',
  'lastFetched',
  'summary',
  'technologySignal',
  'title',
  'tld',
  'url',
] as const

function assertModel(site: AiRadarSite): void {
  assert.deepEqual(Object.keys(site).sort(), [...MODEL_KEYS].sort())
  assert.equal(Array.isArray(site.categories), true)
  assert.equal(site.url === null || /^https?:\/\//.test(site.url), true)
}

function sampleParams(q: string): SearchParams {
  return filterStateToSearchParams({
    query: q,
    niche: null,
    domainRatingMin: null,
    confirmedLiveAfter: null,
    sort: q === '' ? 'discovered' : 'relevance',
    page: 1,
  })
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const okBody = {
  ok: true,
  total: 3,
  from: 0,
  size: 1,
  results: [{ domain: 'a.test', title: 'A', url: 'https://a.test' }],
}

async function main(): Promise<void> {
  const filters: FilterState = {
    query: 'video editor',
    niche: 'Image Generation',
    domainRatingMin: 20,
    confirmedLiveAfter: '2026-01-01',
    sort: 'rating',
    page: 2,
  }
  const params = filterStateToSearchParams(filters)
  const query = buildSearchQuery(params)

  assert.equal(query.get('index'), 'sites')
  assert.equal(query.get('ai_startups'), '1')
  assert.equal(query.has('niche'), false)
  assert.equal(query.get('q'), 'video editor')
  assert.equal(query.get('ai_categories'), 'Image Generation')
  assert.equal(query.get('dr_min'), '20')
  assert.equal(query.get('from_date'), '2026-01-01')
  assert.equal(query.get('sort'), 'dr')
  assert.equal(query.get('order'), 'desc')
  assert.equal(query.get('size'), '24')
  assert.equal(query.get('from'), '24')

  const emptyRelevance = filterStateToSearchParams({
    query: '  ',
    niche: null,
    domainRatingMin: null,
    confirmedLiveAfter: null,
    sort: 'relevance',
    page: 1,
  })
  assert.equal(emptyRelevance.sort, 'went_live')
  assert.equal(buildSearchQuery(emptyRelevance).has('q'), false)

  const roundTrip = urlToFilterState(new URLSearchParams(filterStateToUrlSearch(filters)))
  assert.deepEqual(roundTrip, filters)
  assert.equal(urlToFilterState(new URLSearchParams('after=2026-02-31')).confirmedLiveAfter, null)
  assert.equal(urlToFilterState(new URLSearchParams('sort=trending')).sort, 'discovered')
  assert.equal(urlToFilterState(new URLSearchParams('sort=relevance')).sort, 'discovered')
  assert.equal(urlToFilterState(new URLSearchParams('dr=101')).domainRatingMin, null)

  const full = normalizeSite({
    domain: 'nova.example',
    url: 'https://nova.example',
    title: 'Nova AI',
    ai_summary: 'An automation platform.',
    ai_categories: ['AI Automation & Workflows', 'AI Agents & Autonomous'],
    category: 'ai',
    ai_source: 'NextJS',
    dr: 32,
    went_live: '2026-09-18',
    first_seen: '2026-09-01',
    fetched_at: '2026-09-20T00:00:00Z',
    tld: 'example',
    http_status: 200,
    ip: '1.2.3.4',
  })
  assert.ok(full)
  assertModel(full)
  assert.equal(full.technologySignal, 'nextjs')
  assert.equal(full.url, 'https://nova.example')
  assert.equal(full.domainRating, 32)
  assert.deepEqual(full.categories, ['AI Automation & Workflows', 'AI Agents & Autonomous'])

  const missing = normalizeSite({
    domain: 'quiet.example',
    title: '   ',
    url: '',
    ai_source: 'gen:all in one seo',
    dr: null,
  })
  assert.ok(missing)
  assert.equal(missing.url, null)
  assert.equal(missing.title, null)
  assert.equal(missing.summary, null)
  assert.deepEqual(missing.categories, [])
  assert.equal(missing.technologySignal, null)
  assert.equal(missing.domainRating, null)

  const zero = normalizeSite({ domain: 'z.test', dr: 0, ai_categories: 'Image Generation', ai_source: 'not_ai' })
  assert.ok(zero)
  assert.equal(zero.domainRating, 0)
  assert.deepEqual(zero.categories, ['Image Generation'])
  assert.equal(zero.technologySignal, null)
  assert.equal(normalizeSite({ domain: ' ', url: 'https://x.test' }), null)
  assert.equal(normalizeSite({ domain: 'bad.test', url: 'ftp://bad.test' })?.url, null)

  clearRequestCache()
  let dedupeFetches = 0
  const dedupeFetch: typeof fetch = async () => {
    dedupeFetches += 1
    return jsonResponse(okBody)
  }
  const dedupeParams = sampleParams('dedupe')
  const [first, second] = await Promise.all([
    searchSites(dedupeParams, { fetch: dedupeFetch }),
    searchSites(dedupeParams, { fetch: dedupeFetch }),
  ])
  assert.equal(first.total, 3)
  assert.equal(second.sites[0]?.domain, 'a.test')
  assert.equal(dedupeFetches, 1)
  await searchSites(dedupeParams, { fetch: dedupeFetch })
  assert.equal(dedupeFetches, 1)

  clearRequestCache()
  let abortFetches = 0
  const abortingFetch: typeof fetch = (_input, init) => {
    abortFetches += 1
    return new Promise((resolve, reject) => {
      const fail = () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))
      if (init?.signal?.aborted) {
        fail()
        return
      }
      const timer = setTimeout(() => resolve(jsonResponse(okBody)), 40)
      init?.signal?.addEventListener('abort', () => {
        clearTimeout(timer)
        fail()
      })
    })
  }
  const abortParams = sampleParams('abort-me')
  const controller = new AbortController()
  const pending = searchSites(abortParams, { fetch: abortingFetch, signal: controller.signal })
  controller.abort()
  await assert.rejects(pending, (error: unknown) => error instanceof FreeSerpError && error.code === 'aborted')
  await searchSites(abortParams, { fetch: abortingFetch })
  assert.equal(abortFetches, 2)

  clearRequestCache()
  let ignoredAbortFetches = 0
  const ignoreAbortFetch: typeof fetch = async () => {
    ignoredAbortFetches += 1
    await new Promise((resolve) => setTimeout(resolve, 20))
    return jsonResponse({ ...okBody, total: 9 })
  }
  const ignoreParams = sampleParams('ignore-abort')
  const ignoreController = new AbortController()
  const ignored = searchSites(ignoreParams, { fetch: ignoreAbortFetch, signal: ignoreController.signal })
  ignoreController.abort()
  await assert.rejects(ignored)
  await new Promise((resolve) => setTimeout(resolve, 30))
  const afterIgnore = await searchSites(ignoreParams, { fetch: ignoreAbortFetch })
  assert.equal(afterIgnore.total, 9)
  assert.equal(ignoredAbortFetches, 2)

  clearRequestCache()
  const keptController = new AbortController()
  let sharedFetches = 0
  const sharedFetch: typeof fetch = async () => {
    sharedFetches += 1
    await new Promise((resolve) => setTimeout(resolve, 20))
    return jsonResponse(okBody)
  }
  const sharedParams = sampleParams('shared')
  const dropped = searchSites(sharedParams, { fetch: sharedFetch, signal: keptController.signal })
  const kept = searchSites(sharedParams, { fetch: sharedFetch })
  keptController.abort()
  await assert.rejects(dropped)
  assert.equal((await kept).total, 3)
  assert.equal(sharedFetches, 1)

  clearRequestCache()
  await assert.rejects(
    searchSites(sampleParams('bad-status'), {
      fetch: async () => jsonResponse({ ok: false, error: 'upstream' }, 502),
    }),
    (error: unknown) => error instanceof FreeSerpError && error.code === 'api',
  )
  await assert.rejects(
    searchSites(sampleParams('bad-shape'), {
      fetch: async () => jsonResponse({ ok: true, results: 'nope' }),
    }),
    (error: unknown) => error instanceof FreeSerpError && error.code === 'invalid',
  )

  clearRequestCache()
  let seenUrl = ''
  const live = await searchSites(sampleParams(''), {
    fetch: async (input, init) => {
      seenUrl = String(input)
      return fetch(input, init)
    },
  })
  const seen = new URL(seenUrl)
  assert.equal(seen.searchParams.get('index'), 'sites')
  assert.equal(seen.searchParams.get('ai_startups'), '1')
  assert.equal(seen.searchParams.has('niche'), false)
  assert.equal(seen.searchParams.get('sort'), 'went_live')
  assert.equal(seen.searchParams.get('order'), 'desc')
  assert.ok((seen.searchParams.get('agent') ?? '').includes('AI-Radar'))
  assert.ok(live.total > 1000)
  assert.ok(live.sites.length > 0)
  const liveSite = live.sites[0]
  assert.ok(liveSite)
  assertModel(liveSite)
  assert.equal(buildSearchUrl(sampleParams('')).includes('niche='), false)
  const proxied = new URL(buildSearchUrl(sampleParams('voice agent'), '/freeserp'), 'http://localhost')
  assert.equal(proxied.pathname, '/freeserp')
  assert.equal(proxied.searchParams.get('index'), 'sites')
  assert.equal(proxied.searchParams.get('ai_startups'), '1')
  assert.equal(proxied.searchParams.get('q'), 'voice agent')
  assert.equal(proxied.searchParams.has('niche'), false)

  clearRequestCache()
  const found = await lookupSite(liveSite.domain)
  assert.equal(found?.domain.toLowerCase(), liveSite.domain.toLowerCase())
  const missingDomain = await lookupSite('definitely-not-in-the-index-zzzxqv.example')
  assert.equal(missingDomain, null)

  clearRequestCache()
  const snapshot = await fetchIndexSnapshot()
  assert.equal(snapshot.source, 'live')
  assert.equal(typeof snapshot.aiStartupTotal, 'number')
  assert.ok((snapshot.aiStartupTotal ?? 0) > 1000)
  assert.ok(snapshot.niches.some((niche) => niche.name === 'Image Generation' && niche.count > 0))

  console.log(
    `Foundation checks passed. Index total ${live.total}. Snapshot startups ${snapshot.aiStartupTotal}. Sample ${liveSite.domain}.`,
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
