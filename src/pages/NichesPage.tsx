import { LandscapeDistribution } from '@/components/niches/LandscapeDistribution'
import { NicheCard } from '@/components/niches/NicheCard'
import { StartHere } from '@/components/niches/StartHere'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ResearchLabel } from '@/components/ui/ResearchLabel'
import { useIndexSnapshot } from '@/hooks/useIndexSnapshot'
import { categoryBars } from '@/niches/distribution'
import { formatCount, formatIndexDate } from '@/utils/format'

export function NichesPage() {
  const { status, snapshot } = useIndexSnapshot()
  const niches = snapshot?.niches ?? []
  const bars = categoryBars(niches)
  const total = snapshot?.aiStartupTotal
  const live = status === 'ready' && snapshot?.source === 'live'
  const documented = status === 'fallback' || snapshot?.source === 'fallback'

  return (
    <div className="shell-container py-12 sm:py-16">
      <ResearchLabel index="01">AI landscape</ResearchLabel>
      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-[0.14em] text-muted uppercase">
        <span>AI startup index</span>
        <span aria-hidden="true">·</span>
        <span>{live ? 'Live data' : documented ? 'Snapshot' : 'Loading'}</span>
      </p>
      <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.08] font-medium sm:text-6xl">
        Explore the AI landscape
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Browse the AI ecosystem by category and discover real products indexed by FreeSERP.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        {typeof total === 'number' ? (
          <p className="font-mono text-sm text-text">{formatCount(total)} AI startup sites indexed</p>
        ) : null}
        <p className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted uppercase">
          <span className={live ? 'index-mark index-live' : 'index-mark'} aria-hidden="true" />
          {live ? 'Index live' : documented ? 'Index snapshot' : 'Index'}
        </p>
      </div>

      <section className="mt-12 grid gap-4 border-y border-line py-6 md:grid-cols-[12rem_1fr] md:gap-10">
        <h2 className="font-mono text-xs tracking-[0.16em] text-muted uppercase">How this map works</h2>
        <p className="max-w-2xl text-muted">
          AI Radar uses FreeSERP&apos;s AI-startup index to organize real websites into AI categories. A site may belong
          to more than one category, so category totals describe indexed coverage rather than market share.
        </p>
      </section>

      {status === 'loading' ? (
        <div className="mt-12">
          <LoadingSkeleton rows={6} label="Loading category counts" />
        </div>
      ) : (
        <>
          <LandscapeDistribution niches={niches} snapshot={documented} />
          {bars.length > 0 ? (
            <section className="mt-16" aria-labelledby="niche-cards-heading">
              <ResearchLabel index="03">Explore by niche</ResearchLabel>
              <h2 id="niche-cards-heading" className="mt-3 text-2xl font-semibold tracking-tight">
                Categories in the index
              </h2>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {bars.map((bar, index) => (
                  <NicheCard key={bar.name} index={index} name={bar.name} count={bar.count} width={bar.width} />
                ))}
              </ul>
            </section>
          ) : (
            <p className="mt-12 text-muted">Category counts are not available in this index response.</p>
          )}
          <StartHere niches={niches} />
        </>
      )}

      <section className="mt-16 border-t border-line pt-8" aria-labelledby="about-index-heading">
        <h2 id="about-index-heading" className="text-lg font-semibold">
          About the index
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Counts come from FreeSERP. Categories follow that API&apos;s AI classification, and a website can appear in
          more than one. The figures are indexed website counts, not market share, and they can change.
          {documented && snapshot?.generatedAt
            ? ` This view is using a documented snapshot from ${formatIndexDate(snapshot.generatedAt)}.`
            : ''}
        </p>
        <p className="mt-4">
          <a
            className="text-sm font-semibold text-text underline decoration-line-strong underline-offset-4 hover:text-accent"
            href="https://freeserp.ai"
            target="_blank"
            rel="noreferrer"
          >
            Data provided by FreeSERP
            <span className="sr-only"> (leaves AI Radar)</span>
          </a>
        </p>
      </section>
    </div>
  )
}
