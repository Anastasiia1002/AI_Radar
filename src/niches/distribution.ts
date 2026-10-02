import type { IndexNicheCount } from '../types/site.ts'

export type CategoryBar = {
  name: string
  count: number
  width: number
  listedShare: number
}

export function categoryBars(niches: IndexNicheCount[]): CategoryBar[] {
  const max = niches.reduce((highest, niche) => Math.max(highest, niche.count), 0)
  const sum = niches.reduce((total, niche) => total + niche.count, 0)
  return niches.map((niche) => ({
    name: niche.name,
    count: niche.count,
    width: max === 0 ? 0 : (niche.count / max) * 100,
    listedShare: sum === 0 ? 0 : (niche.count / sum) * 100,
  }))
}

export function formatListedShare(share: number): string {
  return `${Math.round(share)}%`
}
