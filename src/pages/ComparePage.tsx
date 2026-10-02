import { Link, useNavigate } from 'react-router-dom'
import { CategoryOverlap } from '@/components/compare/CategoryOverlap'
import { ComparisonHeader, type ComparisonSlot } from '@/components/compare/ComparisonHeader'
import { ComparisonInsight } from '@/components/compare/ComparisonInsight'
import { ComparisonTable } from '@/components/compare/ComparisonTable'
import { EmptyComparison } from '@/components/compare/EmptyComparison'
import { IndexTimeline } from '@/components/compare/IndexTimeline'
import { ObservableDifferences } from '@/components/compare/ObservableDifferences'
import { ErrorState } from '@/components/ui/ErrorState'
import { ResearchLabel } from '@/components/ui/ResearchLabel'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'
import { useCompareSites } from '@/hooks/useCompareSites'
import { sameDomain } from '@/utils/domain'

export function ComparePage() {
  const navigate = useNavigate()
  const { domains, remove } = useCompare()
  const { status, records, error, reload } = useCompareSites(domains)

  const slots: ComparisonSlot[] = domains.map((domain) => {
    const record = records.find((item) => sameDomain(item.domain, domain))
    return {
      domain,
      site: status === 'loading' ? null : (record?.site ?? null),
      pending: status === 'loading',
      error: record?.error ?? (status === 'error' ? error : null),
    }
  })

  function replaceTool(domain: string) {
    remove(domain)
    navigate('/explore')
  }

  return (
    <div className="shell-container py-12 sm:py-16">
      <ResearchLabel>Comparison lab</ResearchLabel>
      <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.08] font-medium sm:text-6xl">
        Compare AI tools side by side
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Put up to {MAX_COMPARE} indexed AI sites under the microscope and compare their categories, domain signals,
        dates, and technology signals.
      </p>

      {domains.length === 0 ? <EmptyComparison /> : null}

      {domains.length > 0 ? (
        <>
          <ComparisonHeader slots={slots} onRemove={remove} onReplace={replaceTool} />
          {status === 'error' ? (
            <div className="mt-8">
              <ErrorState message={error ?? 'Check the connection and try the request again.'} onRetry={reload} />
            </div>
          ) : null}
          <ComparisonTable slots={slots} />
          <ObservableDifferences slots={slots} />
          <CategoryOverlap slots={slots} />
          <IndexTimeline slots={slots} />
          <p className="mt-8">
            <Link className="text-sm font-semibold underline decoration-line-strong underline-offset-4" to="/explore">
              Back to Explore
            </Link>
          </p>
        </>
      ) : null}

      <ComparisonInsight />
    </div>
  )
}
