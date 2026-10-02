/** Raw FreeSERP shapes. UI code should depend on the normalized model instead. */

export type FreeSerpSite = {
  domain?: unknown
  url?: unknown
  title?: unknown
  ai_summary?: unknown
  category?: unknown
  ai_categories?: unknown
  ai_source?: unknown
  dr?: unknown
  went_live?: unknown
  first_seen?: unknown
  fetched_at?: unknown
  tld?: unknown
  http_status?: unknown
}

export type FreeSerpSearchBody = {
  ok?: unknown
  index?: unknown
  query?: unknown
  total?: unknown
  count?: unknown
  from?: unknown
  size?: unknown
  sort?: unknown
  order?: unknown
  filters?: unknown
  results?: unknown
  error?: unknown
  detail?: unknown
  hint?: unknown
}

export type FreeSerpStatsBody = {
  ok?: unknown
  generated_at?: unknown
  ai_startups?: unknown
  top_ai_categories?: unknown
  error?: unknown
  detail?: unknown
}
