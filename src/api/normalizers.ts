import type { AiRadarSite, IndexSnapshot, SearchResult } from '../types/site.ts'
import { PRIORITY_NICHES } from '../types/site.ts'

const TECHNOLOGY_SIGNALS = new Set([
  'nextjs',
  'react',
  'lovable',
  'v0',
  'bolt',
  'base44',
  'ai_likely',
  'wordpress',
  'shopify',
  'webflow',
  'framer',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function cleanDate(value: unknown): string | null {
  const text = cleanText(value)
  if (!text) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text)
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
  return `${match[1]}-${match[2]}-${match[3]}`
}

function cleanTimestamp(value: unknown): string | null {
  const text = cleanText(value)
  if (!text) return null
  return Number.isNaN(Date.parse(text)) ? null : text
}

function cleanCategories(value: unknown): string[] {
  const source = Array.isArray(value) ? value : typeof value === 'string' ? [value] : []
  const categories: string[] = []
  for (const item of source) {
    const text = cleanText(item)
    if (text && !categories.includes(text)) categories.push(text)
  }
  return categories
}

function cleanTechnologySignal(value: unknown): string | null {
  const text = cleanText(value)
  if (!text) return null
  const token = text.toLowerCase()
  return TECHNOLOGY_SIGNALS.has(token) ? token : null
}

function cleanRating(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

function cleanStatus(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  return value
}

function cleanUrl(value: unknown): string | null {
  const text = cleanText(value)
  if (!text) return null
  try {
    const url = new URL(text)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return text
  } catch {
    return null
  }
}

export function normalizeSite(input: unknown): AiRadarSite | null {
  if (!isRecord(input)) return null
  const domain = cleanText(input.domain)
  if (!domain) return null

  return {
    domain,
    url: cleanUrl(input.url),
    title: cleanText(input.title),
    summary: cleanText(input.ai_summary),
    categories: cleanCategories(input.ai_categories),
    broadCategory: cleanText(input.category),
    technologySignal: cleanTechnologySignal(input.ai_source),
    domainRating: cleanRating(input.dr),
    confirmedLive: cleanDate(input.went_live),
    firstSeen: cleanDate(input.first_seen),
    lastFetched: cleanTimestamp(input.fetched_at),
    tld: cleanText(input.tld),
    httpStatus: cleanStatus(input.http_status),
  }
}

export function normalizeSearchResult(input: unknown): SearchResult {
  if (!isRecord(input) || !Array.isArray(input.results)) {
    throw new Error('Search response is missing a results array.')
  }
  if (typeof input.total !== 'number' || !Number.isFinite(input.total)) {
    throw new Error('Search response is missing a total.')
  }

  const sites: AiRadarSite[] = []
  for (const item of input.results) {
    const site = normalizeSite(item)
    if (site) sites.push(site)
  }

  return {
    total: input.total,
    from: typeof input.from === 'number' && Number.isFinite(input.from) ? input.from : 0,
    size: typeof input.size === 'number' && Number.isFinite(input.size) ? input.size : sites.length,
    sites,
  }
}

export function normalizeIndexSnapshot(input: unknown): IndexSnapshot {
  if (!isRecord(input)) {
    throw new Error('Stats response was not an object.')
  }

  const startups = isRecord(input.ai_startups) ? input.ai_startups : null
  const aiStartupTotal =
    startups && typeof startups.total === 'number' && Number.isFinite(startups.total)
      ? startups.total
      : null

  const counts = new Map<string, number>()
  if (Array.isArray(input.top_ai_categories)) {
    for (const item of input.top_ai_categories) {
      if (!isRecord(item)) continue
      const name = cleanText(item.key)
      if (!name || typeof item.count !== 'number' || !Number.isFinite(item.count)) continue
      counts.set(name, item.count)
    }
  }

  const niches = PRIORITY_NICHES.flatMap((name) => {
    const count = counts.get(name)
    return count === undefined ? [] : [{ name, count }]
  })

  if (aiStartupTotal === null && niches.length === 0) {
    throw new Error('Stats response did not include usable index counts.')
  }

  return {
    generatedAt: cleanTimestamp(input.generated_at),
    aiStartupTotal,
    niches,
    source: 'live',
  }
}
