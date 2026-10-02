import type { ComparisonSlot } from '@/components/compare/ComparisonHeader'
import { displayDate, displayDomainRating, displayTechnology } from '@/compare/signals'

type ObservableDifferencesProps = {
  slots: ComparisonSlot[]
}

const groups = [
  {
    label: 'Domain Rating',
    value: (slot: ComparisonSlot) => (slot.pending ? 'Loading' : displayDomainRating(slot.site)),
  },
  {
    label: 'Confirmed live',
    value: (slot: ComparisonSlot) =>
      slot.pending ? 'Loading' : slot.site ? displayDate(slot.site.confirmedLive) : 'Not available',
  },
  {
    label: 'Technology signal',
    value: (slot: ComparisonSlot) => (slot.pending ? 'Loading' : displayTechnology(slot.site)),
  },
]

export function ObservableDifferences({ slots }: ObservableDifferencesProps) {
  const ready = slots.filter((slot) => slot.site).length
  if (ready < 2) return null

  return (
    <section className="mt-12" aria-labelledby="differences-heading">
      <h2 id="differences-heading" className="text-lg font-semibold">
        Observable differences
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        The same fields, read across the selection. Nothing here is a rank or a winner.
      </p>
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {groups.map((group) => (
          <section key={group.label} className="rounded-card border border-line bg-surface p-4">
            <h3 className="font-mono text-xs tracking-[0.14em] text-muted uppercase">{group.label}</h3>
            <ul className="mt-3 grid gap-2">
              {slots.map((slot) => (
                <li key={slot.domain} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 font-mono text-xs break-all text-muted">{slot.site?.domain ?? slot.domain}</span>
                  <span className="shrink-0 text-right">{group.value(slot)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}
