import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'
import { toolPath } from '@/utils/domain'

export function ComparePage() {
  const { domains, remove } = useCompare()

  return (
    <div className="shell-container py-12">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Compare</p>
      <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight">Side by side</h1>
      <div className="mt-8">
        {domains.length === 0 ? (
          <EmptyState
            title="No products selected"
            message={`Choose up to ${MAX_COMPARE} AI websites to compare the fields the index actually provides.`}
            action={
              <Link className="btn btn-secondary" to="/explore">
                Explore the index
              </Link>
            }
          />
        ) : (
          <div>
            <p className="font-mono text-sm text-muted">
              {domains.length} of {MAX_COMPARE} selected.
            </p>
            <ul className="mt-4 grid gap-2">
              {domains.map((domain) => (
                <li
                  key={domain}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3"
                >
                  <Link className="font-mono text-sm hover:text-accent" to={toolPath(domain)}>
                    {domain}
                  </Link>
                  <button className="btn btn-secondary" type="button" onClick={() => remove(domain)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
