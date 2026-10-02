export const SORT_KEYS = ['relevance', 'discovered', 'rating', 'indexed'] as const

export type SortKey = (typeof SORT_KEYS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'Most relevant',
  discovered: 'Recently discovered',
  rating: 'Highest Domain Rating',
  indexed: 'Recently added to the index',
}

export const PRIORITY_NICHES = [
  'AI Agents & Autonomous',
  'AI Automation & Workflows',
  'Code & Dev Tools',
  'AI Infrastructure & API',
  'AI Chatbot & Assistant',
  'Image Generation',
  'Video Generation',
] as const

export type FilterState = {
  query: string
  niche: string | null
  domainRatingMin: number | null
  confirmedLiveAfter: string | null
  sort: SortKey
  page: number
}

export type ApiSort = 'relevance' | 'went_live' | 'dr' | 'first_seen'

/** Wire parameters for a FreeSERP sites-index search. The client adds scope flags. */
export type SearchParams = {
  q: string
  aiCategory: string
  drMin: number | null
  fromDate: string | null
  sort: ApiSort
  order: 'asc' | 'desc'
  size: number
  from: number
}

export type AiRadarSite = {
  domain: string
  url: string | null
  title: string | null
  summary: string | null
  categories: string[]
  broadCategory: string | null
  technologySignal: string | null
  domainRating: number | null
  confirmedLive: string | null
  firstSeen: string | null
  lastFetched: string | null
  tld: string | null
  httpStatus: number | null
}

export type SearchResult = {
  total: number
  from: number
  size: number
  sites: AiRadarSite[]
}

export type IndexNicheCount = {
  name: string
  count: number
}

export type IndexSnapshot = {
  generatedAt: string | null
  aiStartupTotal: number | null
  niches: IndexNicheCount[]
  source: 'live' | 'fallback'
}
