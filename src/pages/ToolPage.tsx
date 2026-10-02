import { useParams } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useCompare } from '@/hooks/useCompare'
import { useSite } from '@/hooks/useSite'
import { decodeRouteDomain } from '@/utils/domain'
import { formatIndexDate, technologySignalLabel } from '@/utils/format'

export function ToolPage() {
  const params = useParams()
  const domain = decodeRouteDomain(params['*'])
  const { status, site, error, reload } = useSite(domain)
  const compare = useCompare()
  const selected = site ? compare.domains.some((item) => item.toLowerCase() === site.domain.toLowerCase()) : false

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
            ) : null}
            <dl className="mt-6 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
              {site.domainRating != null ? (
                <div>
                  <dt className="text-muted">Domain Rating</dt>
                  <dd className="font-mono text-text">{site.domainRating}</dd>
                </div>
              ) : null}
              {site.confirmedLive ? (
                <div>
                  <dt className="text-muted">Confirmed live</dt>
                  <dd className="font-mono text-text">{formatIndexDate(site.confirmedLive)}</dd>
                </div>
              ) : null}
              {site.firstSeen ? (
                <div>
                  <dt className="text-muted">Added to the index</dt>
                  <dd className="font-mono text-text">{formatIndexDate(site.firstSeen)}</dd>
                </div>
              ) : null}
              {site.lastFetched ? (
                <div>
                  <dt className="text-muted">Last fetched</dt>
                  <dd className="font-mono text-text">{formatIndexDate(site.lastFetched)}</dd>
                </div>
              ) : null}
              {site.technologySignal ? (
                <div>
                  <dt className="text-muted">Technology signal</dt>
                  <dd className="text-text">{technologySignalLabel(site.technologySignal)}</dd>
                </div>
              ) : null}
              {site.httpStatus != null ? (
                <div>
                  <dt className="text-muted">HTTP status</dt>
                  <dd className="font-mono text-text">{site.httpStatus}</dd>
                </div>
              ) : null}
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
                  if (selected) {
                    const stored = compare.domains.find((item) => item.toLowerCase() === site.domain.toLowerCase())
                    compare.remove(stored ?? site.domain)
                    return
                  }
                  compare.add(site.domain)
                }}
              >
                {selected ? 'Remove from compare' : 'Compare'}
              </button>
              {site.url ? (
                <a className="btn btn-primary" href={site.url} target="_blank" rel="noreferrer">
                  Open site
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
