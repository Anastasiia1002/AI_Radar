import { categoryBars, formatListedShare } from '@/niches/distribution'
import type { IndexNicheCount } from '@/types/site'
import { formatCount } from '@/utils/format'
import { ResearchLabel } from '@/components/ui/ResearchLabel'

type LandscapeDistributionProps = {
  niches: IndexNicheCount[]
  snapshot: boolean
}

export function LandscapeDistribution({ niches, snapshot }: LandscapeDistributionProps) {
  const bars = categoryBars(niches)
  if (bars.length === 0) return null

  return (
    <section className="mt-14" aria-labelledby="landscape-heading">
      <ResearchLabel index="02">Index distribution</ResearchLabel>
      <h2 id="landscape-heading" className="mt-3 text-2xl font-semibold tracking-tight">
        Where the AI ecosystem clusters
      </h2>
      <p className="mt-2 max-w-xl text-muted">Indexed websites by AI category.</p>
      <ol className="mt-8 grid gap-5">
        {bars.map((bar, index) => (
          <li key={bar.name} className="rise" style={{ animationDelay: `${index * 40}ms` }}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-medium">{bar.name}</p>
              <p className="font-mono text-sm text-text">{formatCount(bar.count)}</p>
            </div>
            <div className="signal-track mt-2" aria-hidden="true">
              <div className="signal-value" style={{ width: `${bar.width}%`, animationDelay: `${index * 40}ms` }} />
            </div>
            <p className="mt-1.5 font-mono text-[0.7rem] tracking-wide text-muted uppercase">
              <span className="index-mark mr-2 inline-block align-middle" />
              {formatListedShare(bar.listedShare)} of listed tags
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        Bar length is relative to the largest category in this list. The percentage is that category’s share of the
        listed tag counts, not market share. A website can sit in more than one category, so the shares are not a
        partition of the startup index.
        {snapshot ? ' These counts come from a documented snapshot, not a live market reading.' : ''}
      </p>
    </section>
  )
}
