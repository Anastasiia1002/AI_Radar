import { freeserpAgent, freeserpBaseUrl } from '../config.ts'
import type { AiRadarSite, SearchParams, SearchResult } from '../types/site.ts'
import { SEARCH_CACHE_TTL_MS, SNAPSHOT_CACHE_TTL_MS, cachedRequest } from './cache.ts'
import { FreeSerpError, isAbortError } from './errors.ts'
import { normalizeIndexSnapshot, normalizeSearchResult } from './normalizers.ts'
import { buildSearchQuery, lookupSearchParams } from './params.ts'
import type { IndexSnapshot } from '../types/site.ts'

export type SearchOptions = {
  signal?: AbortSignal
  fetch?: typeof fetch
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function endpoint(baseUrl: string): string {
  const trimmed = baseUrl.trim()
  return trimmed === '' ? 'https://freeserp.ai/api.php' : trimmed
}

function appendQuery(base: string, extra: URLSearchParams): string {
  const hashIndex = base.indexOf('#')
  const withoutHash = hashIndex === -1 ? base : base.slice(0, hashIndex)
  const splitAt = withoutHash.indexOf('?')
  const path = splitAt === -1 ? withoutHash : withoutHash.slice(0, splitAt)
  const params = new URLSearchParams(splitAt === -1 ? '' : withoutHash.slice(splitAt + 1))
  for (const [key, value] of extra) params.set(key, value)
  const query = params.toString()
  return query === '' ? path : `${path}?${query}`
}

export function buildSearchUrl(params: SearchParams, baseUrl = freeserpBaseUrl()): string {
  const query = buildSearchQuery(params)
  query.set('agent', freeserpAgent())
  return appendQuery(endpoint(baseUrl), query)
}

export function searchCacheKey(params: SearchParams, baseUrl = freeserpBaseUrl()): string {
  return appendQuery(endpoint(baseUrl), buildSearchQuery(params))
}

function sameDomain(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase()
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new FreeSerpError('invalid', 'The index returned a response that was not JSON.', response.status)
  }
}

function failureFromBody(body: unknown, status: number): FreeSerpError {
  const record = isRecord(body) ? body : null
  const code = record && typeof record.error === 'string' ? record.error : 'request_failed'
  return new FreeSerpError('api', `FreeSERP request failed (${code}).`, status)
}

async function requestJson(url: string, signal: AbortSignal, fetchImpl: typeof fetch): Promise<unknown> {
  let response: Response
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (isAbortError(error)) throw new FreeSerpError('aborted', 'The request was aborted.')
    throw new FreeSerpError('network', 'The network request to the AI index failed.')
  }

  const body = await readJson(response)
  if (!response.ok) throw failureFromBody(body, response.status)
  if (!isRecord(body) || body.ok !== true) throw failureFromBody(body, response.status)
  return body
}

async function loadSearch(params: SearchParams, signal: AbortSignal, fetchImpl: typeof fetch): Promise<SearchResult> {
  const body = await requestJson(buildSearchUrl(params), signal, fetchImpl)
  try {
    return normalizeSearchResult(body)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search response could not be read.'
    throw new FreeSerpError('invalid', message)
  }
}

export function searchSites(params: SearchParams, options: SearchOptions = {}): Promise<SearchResult> {
  const fetchImpl = options.fetch ?? fetch
  return cachedRequest(
    searchCacheKey(params),
    SEARCH_CACHE_TTL_MS,
    (signal) => loadSearch(params, signal, fetchImpl),
    options.signal,
  )
}

export async function lookupSite(domain: string, options: SearchOptions = {}): Promise<AiRadarSite | null> {
  const trimmed = domain.trim()
  if (trimmed === '') return null
  const result = await searchSites(lookupSearchParams(trimmed), options)
  return result.sites.find((site) => sameDomain(site.domain, trimmed)) ?? null
}

export function fetchIndexSnapshot(options: SearchOptions = {}): Promise<IndexSnapshot> {
  const fetchImpl = options.fetch ?? fetch
  const cacheKey = appendQuery(endpoint(freeserpBaseUrl()), new URLSearchParams({ stats: '1' }))

  return cachedRequest(
    cacheKey,
    SNAPSHOT_CACHE_TTL_MS,
    async (signal) => {
      const params = new URLSearchParams({ stats: '1', agent: freeserpAgent() })
      const body = await requestJson(appendQuery(endpoint(freeserpBaseUrl()), params), signal, fetchImpl)
      try {
        return normalizeIndexSnapshot(body)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Stats response could not be read.'
        throw new FreeSerpError('invalid', message)
      }
    },
    options.signal,
  )
}
