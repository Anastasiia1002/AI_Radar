import type { AiRadarSite } from '../types/site.ts'
import { formatIndexDate, technologySignalLabel } from '../utils/format.ts'

export function sharedCategoryNames(sites: AiRadarSite[]): string[] {
  const counts = new Map<string, number>()
  for (const site of sites) {
    for (const category of new Set(site.categories)) {
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }
  }
  return [...counts.entries()].filter((entry) => entry[1] >= 2).map((entry) => entry[0])
}

export function displayDomainRating(site: AiRadarSite | null): string {
  if (!site || site.domainRating == null) return 'Not available'
  return `DR ${site.domainRating}`
}

export function displayTechnology(site: AiRadarSite | null): string {
  if (!site || !site.technologySignal) return site ? 'Technology not detected' : 'Not available'
  return technologySignalLabel(site.technologySignal)
}

export function displayDate(value: string | null | undefined): string {
  if (!value) return 'Not available'
  return formatIndexDate(value)
}

export function displayTld(site: AiRadarSite | null): string {
  if (!site?.tld) return 'Not available'
  return site.tld.startsWith('.') ? site.tld : `.${site.tld}`
}

export function displayStatus(site: AiRadarSite | null): string {
  if (!site || site.httpStatus == null) return 'Not available'
  return String(site.httpStatus)
}
