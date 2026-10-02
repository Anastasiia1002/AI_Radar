import { Link } from 'react-router-dom'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'

export function CompareTray() {
  const { domains } = useCompare()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-card border border-line-strong bg-raised px-4 py-3">
        <p className="text-sm">
          <span className="font-mono text-accent">{domains.length}</span> of {MAX_COMPARE} selected
        </p>
        <Link className="btn btn-primary" to="/compare">
          Compare
        </Link>
      </div>
    </div>
  )
}
