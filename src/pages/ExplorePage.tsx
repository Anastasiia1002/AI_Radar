import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { filterStateToUrlSearch, MAX_PAGE, PAGE_SIZE, RESULT_WINDOW, urlToFilterState } from '@/api/params'
import { ExploreControls } from '@/components/explore/ExploreControls'
import { SiteCard } from '@/components/site/SiteCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useSearch } from '@/hooks/useSearch'
import type { FilterState } from '@/types/site'
import { formatCount } from '@/utils/format'

export function ExplorePage() {
  const [params, setSearchParams] = useSearchParams()
  const filters = useMemo(() => urlToFilterState(params), [params])
  const { status, data, error, reload } = useSearch(filters)
  const queryLabel = filters.query ? `“${filters.query}”` : null

  function applyFilters(next: FilterState) {
    const search = filterStateToUrlSearch(next)
    setSearchParams(new URLSearchParams(search), { replace: true })
  }

  const pageCount = data ? Math.min(MAX_PAGE, Math.max(1, Math.ceil(data.total / PAGE_SIZE))) : 1
  const rangeStart = data && data.sites.length > 0 ? data.from + 1 : 0
  const rangeEnd = data ? data.from + data.sites.length : 0

  return (
    <div className="shell-container py-12">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Explore</p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight">Search the index</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Each result is a homepage from the AI index. Dates are when FreeSERP confirmed the page or added it, not a
        launch date. Technology signal is a heuristic, not a verified stack.
      </p>

      <ExploreControls filters={filters} onChange={applyFilters} />

      <div className="mt-8" aria-live="polite">
        {status === 'loading' && !data ? <LoadingSkeleton rows={6} label="Loading AI websites" /> : null}
        {status === 'error' ? (
          <ErrorState message={error ?? 'Check the connection and try the request again.'} onRetry={reload} />
        ) : null}
        {status !== 'error' && data && data.total === 0 ? (
          <EmptyState
            title={queryLabel ? `No AI products found for ${queryLabel}` : 'No AI products found'}
            message="Try a broader search, another niche, or a lower Domain Rating floor."
          />
        ) : null}
        {status !== 'error' && data && data.total > 0 ? (
          <>
            <p className="font-mono text-sm text-muted">
              {status === 'loading' ? 'Updating results. ' : null}
              {formatCount(data.total)} AI websites{queryLabel ? ` for ${queryLabel}` : ' in this view'}. Showing{' '}
              {formatCount(rangeStart)}–{formatCount(rangeEnd)}.
            </p>
            <ul
              className="mt-4 grid gap-3 md:grid-cols-2"
              aria-busy={status === 'loading'}
              aria-label="AI websites"
            >
              {data.sites.map((site) => (
                <li key={site.domain}>
                  <SiteCard site={site} onCategory={(category) => applyFilters({ ...filters, niche: category, page: 1 })} />
                </li>
              ))}
            </ul>
            <nav className="mt-6 flex flex-wrap items-center gap-3" aria-label="Result pages">
              <button
                className="btn btn-secondary"
                type="button"
                disabled={filters.page <= 1 || status === 'loading'}
                onClick={() => applyFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </button>
              <p className="font-mono text-sm text-muted">
                Page {formatCount(filters.page)} of {formatCount(pageCount)}
              </p>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={filters.page >= pageCount || status === 'loading'}
                onClick={() => applyFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </button>
              {data.total > RESULT_WINDOW ? (
                <p className="w-full text-sm text-muted">Paging covers the first {formatCount(RESULT_WINDOW)} matches.</p>
              ) : null}
            </nav>
          </>
        ) : null}
      </div>
    </div>
  )
}
