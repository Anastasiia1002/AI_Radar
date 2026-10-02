import { useParams } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useSite } from '@/hooks/useSite'
import { decodeRouteDomain } from '@/utils/domain'

export function ToolPage() {
  const params = useParams()
  const domain = decodeRouteDomain(params['*'])
  const { status, error, reload } = useSite(domain)

  return (
    <div className="shell-container py-12">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Website</p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight">Detail</h1>
      {domain ? <p className="mt-4 font-mono text-sm text-muted">{domain}</p> : null}

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
        {status === 'ready' ? (
          <p className="text-muted">This domain is in the AI index.</p>
        ) : null}
      </div>
    </div>
  )
}
