import { useParams } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useCompare } from '@/hooks/useCompare'
import { useSite } from '@/hooks/useSite'
import { decodeRouteDomain } from '@/utils/domain'
import { formatIndexDate, technologySignalLabel } from '@/utils/format'
import { displayTld } from '@/compare/signals'

export function ToolPage() {
  const params = useParams()
  const domain = decodeRouteDomain(params['*'])
  const { status, site, error, reload } = useSite(domain)
  const compare = useCompare()
  const selected = site ? compare.has(site.domain) : false

  return (
    <div className="shell-container py-12">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Website</p>
      <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-tight">
        {site?.title ?? (domain || 'Detail')}
      </h1>
      {domain ? <p className="mt-4 font-mono text-sm text-muted">{site?.domain ?? domain}</p> : null}

      <div className="mt-8">
        {status === 'idle' ? (
          <EmptyState title="No website selected" message="Choose a site from the index to open its record." />
        ) : null}
        {status === 'loading' ? <LoadingSkeleton label="Checking this domain in the AI index" /> : null}
        {status === 'missing' ? (
          <EmptyState
            title="This site isn’t in the current AI index."
            message="The domain did not match a homepage in the AI startup slice."
          />
        ) : null}
        {status === 'error' ? (
          <ErrorState message={error ?? 'Check the connection and try the request again.'} onRetry={reload} />
        ) : null}
        {status === 'ready' && site ? (
          <div className="max-w-3xl">
            {site.summary ? <p className="text-lg text-muted">{site.summary}</p> : null}
            {site.categories.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {site.categories.map((category) => (
                  <li
                    key={category}
                    className="rounded-control border border-line-strong px-2 py-0.5 text-xs text-text"
                  >
                    {category}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">No category detected</p>
            )}
            <dl className="mt-6 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Domain Rating</dt>
                <dd className="font-mono text-text">{site.domainRating == null ? 'Not available' : site.domainRating}</dd>
              </div>
              <div>
                <dt className="text-muted">Confirmed live</dt>
                <dd className="font-mono text-text">
                  {site.confirmedLive ? formatIndexDate(site.confirmedLive) : 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">First indexed</dt>
                <dd className="font-mono text-text">{site.firstSeen ? formatIndexDate(site.firstSeen) : 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-muted">Last fetched</dt>
                <dd className="font-mono text-text">
                  {site.lastFetched ? formatIndexDate(site.lastFetched) : 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Technology signal</dt>
                <dd className="text-text">
                  {site.technologySignal ? technologySignalLabel(site.technologySignal) : 'Technology not detected'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">TLD</dt>
                <dd className="font-mono text-text">{displayTld(site)}</dd>
              </div>
              <div>
                <dt className="text-muted">HTTP status</dt>
                <dd className="font-mono text-text">{site.httpStatus == null ? 'Not available' : site.httpStatus}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">
              Confirmed live is the date the homepage was reachable in the index, not an official launch date.
              Technology signal is a heuristic.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="btn btn-secondary"
                type="button"
                disabled={!selected && compare.isFull}
                aria-pressed={selected}
                onClick={() => {
                  if (selected) compare.remove(site.domain)
                  else compare.add(site.domain)
                }}
              >
                {selected ? 'In compare' : 'Add to compare'}
              </button>
              {site.url ? (
                <a className="btn btn-primary" href={site.url} target="_blank" rel="noreferrer">
                  Open site
                  <span className="sr-only"> (leaves AI Radar)</span>
                </a>
              ) : (
                <p className="self-center text-sm text-muted">Website unavailable</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
