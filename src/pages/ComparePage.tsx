import { Link } from 'react-router-dom'
import { analyzeSites } from '@/compare/analyze'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'
import { useCompareSites } from '@/hooks/useCompareSites'
import type { AiRadarSite } from '@/types/site'
import { toolPath } from '@/utils/domain'
import { formatIndexDate, technologySignalLabel } from '@/utils/format'

function field(label: string, value: string | null) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="text-text">{value ?? 'Not in the index'}</dd>
    </div>
  )
}

function SiteColumn({
  domain,
  site,
  error,
  onRemove,
}: {
  domain: string
  site: AiRadarSite | null
  error: string | null
  onRemove: () => void
}) {
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-4">
      <h2 className="text-lg leading-snug font-semibold">
        {site ? (
          <Link className="hover:text-accent" to={toolPath(site.domain)}>
            {site.title ?? site.domain}
          </Link>
        ) : (
          domain
        )}
      </h2>
      <p className="mt-1 font-mono text-xs text-muted">{site?.domain ?? domain}</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {site ? (
        <>
          <h3 className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">Index summary</h3>
          <p className="mt-2 text-sm text-muted">{site.summary ?? 'The index has no summary for this homepage.'}</p>
          <dl className="mt-4 grid gap-3 text-sm">
            {field('Categories', site.categories.length > 0 ? site.categories.join(', ') : null)}
            {field('Domain Rating', site.domainRating == null ? null : String(site.domainRating))}
            {field('Confirmed live', site.confirmedLive ? formatIndexDate(site.confirmedLive) : null)}
            {field('Added to the index', site.firstSeen ? formatIndexDate(site.firstSeen) : null)}
            {field('Technology signal', site.technologySignal ? technologySignalLabel(site.technologySignal) : null)}
            {field('HTTP status', site.httpStatus == null ? null : String(site.httpStatus))}
          </dl>
        </>
      ) : error ? null : (
        <p className="mt-3 text-sm text-muted">This domain is not in the current AI index.</p>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {site?.url ? (
          <a className="btn btn-secondary" href={site.url} target="_blank" rel="noreferrer">
            Open site
          </a>
        ) : null}
        <button className="btn btn-secondary" type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    </article>
  )
}

export function ComparePage() {
  const { domains, remove, clear } = useCompare()
  const { status, records, error, reload } = useCompareSites(domains)
  const found = records.flatMap((record) => (record.site ? [record.site] : []))
  const notes = analyzeSites(found)
  const columns = domains.length === 1 ? 'md:grid-cols-1' : domains.length === 2 ? 'md:grid-cols-2' : 'lg:grid-cols-3'

  return (
    <div className="shell-container py-12">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Compare</p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight">Side by side</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Choose up to {MAX_COMPARE} websites from Explore. The notes compare their index summaries, categories, Domain
        Rating, and dates. There is no winner and no score beyond Domain Rating.
      </p>

      <div className="mt-8">
        {domains.length === 0 ? (
          <EmptyState
            title="No products selected"
            message={`Add up to ${MAX_COMPARE} AI websites, then open this page to compare the fields the index provides.`}
            action={
              <Link className="btn btn-secondary" to="/explore">
                Explore the index
              </Link>
            }
          />
        ) : null}

        {domains.length > 0 && status === 'loading' ? <LoadingSkeleton rows={5} label="Loading selected websites" /> : null}
        {status === 'error' ? (
          <ErrorState message={error ?? 'Check the connection and try the request again.'} onRetry={reload} />
        ) : null}

        {status === 'ready' && domains.length > 0 ? (
          <div>
            {found.length < 2 ? (
              <p className="text-muted">Add at least one more indexed website to compare.</p>
            ) : (
              <section aria-labelledby="comparison-notes">
                <h2 id="comparison-notes" className="text-lg font-semibold">
                  Index comparison
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  Each summary is the AI summary already stored for that homepage. The notes only point out differences
                  in those records.
                </p>
                <ul className="mt-4 grid max-w-3xl gap-2">
                  {notes.map((note) => (
                    <li key={note} className="rounded-card border border-line bg-surface px-4 py-3 text-sm">
                      {note}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Selected websites</h2>
              <button className="btn btn-secondary" type="button" onClick={clear}>
                Clear all
              </button>
            </div>
            <ul className={`mt-4 grid gap-3 ${columns}`}>
              {records.map((record) => (
                <li key={record.domain}>
                  <SiteColumn
                    domain={record.domain}
                    site={record.site}
                    error={record.error}
                    onRemove={() => remove(record.domain)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
