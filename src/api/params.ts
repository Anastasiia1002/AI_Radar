import type { ApiSort, FilterState, SearchParams, SortKey } from '../types/site.ts'
import { SORT_KEYS } from '../types/site.ts'

export const PAGE_SIZE = 24
const MAX_WINDOW = 10_000
const MAX_PAGE = Math.floor((MAX_WINDOW - PAGE_SIZE) / PAGE_SIZE) + 1

const SORT_TO_API: Record<SortKey, { sort: ApiSort; order: 'asc' | 'desc' }> = {
  relevance: { sort: 'relevance', order: 'desc' },
  discovered: { sort: 'went_live', order: 'desc' },
  rating: { sort: 'dr', order: 'desc' },
  indexed: { sort: 'first_seen', order: 'desc' },
}

function isSortKey(value: string | null): value is SortKey {
  return SORT_KEYS.some((sort) => sort === value)
}

function clampPage(value: number): number {
  if (!Number.isInteger(value) || value < 1) return 1
  return Math.min(value, MAX_PAGE)
}

function parsePage(value: string | null): number {
  if (!value) return 1
  const parsed = Number(value)
  return clampPage(parsed)
}

function parseDrMin(value: string | null): number | null {
  if (!value) return null
  if (!/^\d{1,3}$/.test(value.trim())) return null
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) return null
  return parsed
}

function normalizeDate(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return trimmed
}

function cleanNiche(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed === '' || trimmed.length > 80) return null
  if (/[\u0000-\u001F]/.test(trimmed)) return null
  return trimmed
}

export function effectiveSort(state: FilterState): SortKey {
  if (state.sort === 'relevance' && state.query.trim() === '') return 'discovered'
  return state.sort
}

export function defaultFilterState(): FilterState {
  return {
    query: '',
    niche: null,
    domainRatingMin: null,
    confirmedLiveAfter: null,
    sort: 'discovered',
    page: 1,
  }
}

export function urlToFilterState(params: { get(name: string): string | null }): FilterState {
  const query = params.get('q')?.trim() ?? ''
  const requestedSort = params.get('sort')
  const sort = isSortKey(requestedSort) ? requestedSort : 'discovered'

  return {
    query,
    niche: cleanNiche(params.get('niche')),
    domainRatingMin: parseDrMin(params.get('dr')),
    confirmedLiveAfter: normalizeDate(params.get('after')),
    sort: sort === 'relevance' && query === '' ? 'discovered' : sort,
    page: parsePage(params.get('page')),
  }
}

export function filterStateToSearchParams(state: FilterState): SearchParams {
  const sort = effectiveSort(state)
  const mapped = SORT_TO_API[sort]
  const page = clampPage(state.page)
  const drMin = state.domainRatingMin
  const fromDate = normalizeDate(state.confirmedLiveAfter)

  return {
    q: state.query.trim(),
    aiCategory: state.niche?.trim() ?? '',
    drMin: drMin != null && drMin >= 0 && drMin <= 100 ? Math.round(drMin) : null,
    fromDate,
    sort: mapped.sort,
    order: mapped.order,
    size: PAGE_SIZE,
    from: (page - 1) * PAGE_SIZE,
  }
}

export function filterStateToUrlSearch(state: FilterState): string {
  const query = new URLSearchParams()
  const q = state.query.trim()
  if (q) query.set('q', q)
  const niche = cleanNiche(state.niche)
  if (niche) query.set('niche', niche)
  if (state.sort !== 'discovered') query.set('sort', state.sort)
  if (state.domainRatingMin != null && state.domainRatingMin >= 0 && state.domainRatingMin <= 100) {
    query.set('dr', String(Math.round(state.domainRatingMin)))
  }
  const after = normalizeDate(state.confirmedLiveAfter)
  if (after) query.set('after', after)
  const page = clampPage(state.page)
  if (page > 1) query.set('page', String(page))
  return query.toString()
}

/**
 * Discovery requests always search FreeSERP Main homepages in the AI-startup slice.
 * `niche` is intentionally absent: FreeSERP ignores that parameter.
 */
export function buildSearchQuery(params: SearchParams): URLSearchParams {
  const query = new URLSearchParams()
  query.set('index', 'sites')
  query.set('ai_startups', '1')

  const q = params.q.trim()
  if (q) query.set('q', q)

  const category = params.aiCategory.trim()
  if (category) query.set('ai_categories', category)

  if (params.drMin != null && params.drMin >= 0 && params.drMin <= 100) {
    query.set('dr_min', String(Math.round(params.drMin)))
  }

  if (params.fromDate) query.set('from_date', params.fromDate)

  const size = Math.min(100, Math.max(1, Math.round(params.size)))
  let from = Math.max(0, Math.round(params.from))
  if (from + size > MAX_WINDOW) from = Math.max(0, MAX_WINDOW - size)

  query.set('sort', params.sort)
  query.set('order', params.order === 'asc' ? 'asc' : 'desc')
  query.set('size', String(size))
  query.set('from', String(from))
  return query
}

export function lookupSearchParams(domain: string): SearchParams {
  return {
    q: domain.trim(),
    aiCategory: '',
    drMin: null,
    fromDate: null,
    sort: 'relevance',
    order: 'desc',
    size: 5,
    from: 0,
  }
}
