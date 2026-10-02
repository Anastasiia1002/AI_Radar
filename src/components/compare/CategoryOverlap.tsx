import type { ComparisonSlot } from '@/components/compare/ComparisonHeader'
import { sharedCategoryNames } from '@/compare/signals'

type CategoryOverlapProps = {
  slots: ComparisonSlot[]
}

export function CategoryOverlap({ slots }: CategoryOverlapProps) {
  const sites = slots.flatMap((slot) => (slot.site ? [slot.site] : []))
  if (sites.length < 2) return null
  const shared = new Set(sharedCategoryNames(sites))
  const withCategories = sites.filter((site) => site.categories.length > 0)
  if (withCategories.length === 0) return null

  return (
    <section className="mt-12" aria-labelledby="overlap-heading">
      <h2 id="overlap-heading" className="text-lg font-semibold">
        Category overlap
      </h2>
      <p className="mt-2 font-mono text-sm text-accent">
        {shared.size === 1 ? '1 shared category' : `${shared.size} shared categories`}
      </p>
      <ul className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <li key={site.domain} className="rounded-card border border-line bg-surface p-4">
            <p className="font-mono text-xs break-all text-muted">{site.domain}</p>
            {site.categories.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No category detected</p>
            ) : (
              <ul className="mt-3 grid gap-1.5">
                {site.categories.map((category) => {
                  const common = shared.has(category)
                  return (
                    <li key={category} className="flex items-center gap-2 text-sm">
                      <span className={common ? 'text-accent' : 'text-muted'} aria-hidden="true">
                        ●
                      </span>
                      <span>{category}</span>
                      {common ? <span className="sr-only">, shared</span> : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
