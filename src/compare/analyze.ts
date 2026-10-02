import type { AiRadarSite } from '../types/site.ts'
import { formatIndexDate, technologySignalLabel } from '../utils/format.ts'

function names(sites: AiRadarSite[]): string {
  return sites.map((site) => site.domain).join(', ')
}

function latestNote(sites: AiRadarSite[], field: 'confirmedLive' | 'firstSeen', label: string): string | null {
  const dated = sites.filter((site) => site[field])
  if (dated.length === 0) return `The index has no ${label.toLowerCase()} for this selection.`
  if (dated.length === 1) {
    const only = dated[0]
    return only ? `${label} is stored only for ${only.domain} (${formatIndexDate(only[field] ?? '')}).` : null
  }
  const sorted = [...dated].sort((left, right) => (right[field] ?? '').localeCompare(left[field] ?? ''))
  const newest = sorted[0]
  if (!newest?.[field]) return null
  const tied = sorted.filter((site) => site[field] === newest[field])
  if (tied.length > 1) {
    return `${label} is the same (${formatIndexDate(newest[field])}) for ${names(tied)}.`
  }
  return `${newest.domain} has the latest ${label.toLowerCase()} in this selection (${formatIndexDate(newest[field])}).`
}

export function analyzeSites(sites: AiRadarSite[]): string[] {
  if (sites.length < 2) return []
  const notes: string[] = []

  const categories = [...new Set(sites.flatMap((site) => site.categories))]
  const shared = categories.filter((category) => sites.every((site) => site.categories.includes(category)))
  const partial = categories.filter((category) => !shared.includes(category))
  if (shared.length > 0) notes.push(`Every selected website is tagged ${shared.join(', ')}.`)
  else notes.push('No category is shared by every selected website.')
  for (const category of partial) {
    const tagged = sites.filter((site) => site.categories.includes(category))
    notes.push(`${category} is tagged only on ${names(tagged)}.`)
  }
  for (const site of sites) {
    if (site.categories.length === 0) notes.push(`${site.domain} has no category tags in the index.`)
  }

  const rated = sites.filter((site) => site.domainRating != null)
  const unrated = sites.filter((site) => site.domainRating == null)
  if (rated.length >= 2) {
    const sorted = [...rated].sort((left, right) => (right.domainRating ?? 0) - (left.domainRating ?? 0))
    const highest = sorted[0]
    if (highest?.domainRating != null) {
      const tied = sorted.filter((site) => site.domainRating === highest.domainRating)
      notes.push(
        tied.length > 1
          ? `Domain Rating is tied at ${highest.domainRating} for ${names(tied)}. This is a domain metric, not a product score.`
          : `${highest.domain} has the highest Domain Rating in this selection (${highest.domainRating}). This is a domain metric, not a product score.`,
      )
    }
  } else if (rated.length === 1 && rated[0]) {
    notes.push(`Domain Rating is stored only for ${rated[0].domain} (${rated[0].domainRating}).`)
  }
  if (unrated.length > 0 && rated.length > 0) {
    notes.push(`No Domain Rating is stored for ${names(unrated)}.`)
  }

  const confirmed = latestNote(sites, 'confirmedLive', 'Confirmed live date')
  const indexed = latestNote(sites, 'firstSeen', 'Added-to-index date')
  if (confirmed) notes.push(confirmed)
  if (indexed) notes.push(indexed)

  const withSignal = sites.filter((site) => site.technologySignal)
  if (withSignal.length === 0) {
    notes.push('No technology signal is stored for this selection.')
  } else {
    const parts = sites.map((site) =>
      site.technologySignal
        ? `${site.domain} ${technologySignalLabel(site.technologySignal)}`
        : `${site.domain} none`,
    )
    notes.push(`Technology signals: ${parts.join('; ')}. A signal is a heuristic, not a verified stack.`)
  }

  return notes
}
