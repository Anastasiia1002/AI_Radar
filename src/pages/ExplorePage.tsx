import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { urlToFilterState } from '@/api/params'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useSearch } from '@/hooks/useSearch'
import { SORT_LABELS } from '@/types/site'
import { formatCount } from '@/utils/format'

export function ExplorePage() {
  const [params] = useSearchParams()
  const filters = useMemo(() => urlToFilterState(params), [params])
  const { status, data, error, reload } = useSearch(filters)
  const queryLabel = filters.query ? `“${filters.query}”` : null

  return (
    <div className="shell-container py-12">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Explore</p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight">Search the index</h1>
      <p className="mt-3 max-w-xl text-muted">
        {SORT_LABELS[filters.sort]}
        {filters.niche ? ` · ${filters.niche}` : ''}
        {filters.domainRatingMin != null ? ` · Domain Rating ${filters.domainRatingMin}+` : ''}
      </p>

      <div className="mt-8" aria-live="polite">
        {status === 'loading' ? <LoadingSkeleton label="Loading AI websites" /> : null}
        {status === 'error' ? (
          <ErrorState message={error ?? 'Check the connection and try the request again.'} onRetry={reload} />
        ) : null}
        {status === 'success' && data && data.total === 0 ? (
          <EmptyState
            title={queryLabel ? `No AI products found for ${queryLabel}` : 'No AI products found'}
            message="Try a broader search or explore a niche."
          />
        ) : null}
        {status === 'success' && data && data.total > 0 ? (
          <p className="font-mono text-sm text-muted">
            {formatCount(data.total)} AI websites{queryLabel ? ` for ${queryLabel}` : ' in this view'}.
          </p>
        ) : null}
      </div>
    </div>
  )
}
