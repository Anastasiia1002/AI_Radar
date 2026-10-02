import type { ComparisonSlot } from '@/components/compare/ComparisonHeader'
import { displayDate } from '@/compare/signals'

type IndexTimelineProps = {
  slots: ComparisonSlot[]
}

const marks = [
  { label: 'First indexed', read: (slot: ComparisonSlot) => slot.site?.firstSeen },
  { label: 'Confirmed live', read: (slot: ComparisonSlot) => slot.site?.confirmedLive },
  { label: 'Last fetched', read: (slot: ComparisonSlot) => slot.site?.lastFetched },
]

export function IndexTimeline({ slots }: IndexTimelineProps) {
  const visible = slots.filter((slot) => slot.site)
  if (visible.length === 0) return null

  return (
    <section className="mt-12" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="text-lg font-semibold">
        Index timeline
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        These are dates stored on the index record. They are not a company history and they do not show cause.
      </p>
      <ul className="mt-6 grid gap-3">
        {visible.map((slot) => (
          <li key={slot.domain} className="rounded-card border border-line bg-surface p-4">
            <p className="font-mono text-xs break-all text-muted">{slot.site?.domain ?? slot.domain}</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {marks.map((mark, index) => (
                <li key={mark.label} className="min-w-0">
                  <p className="font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase">{mark.label}</p>
                  <p className="mt-1 text-sm">{slot.pending ? 'Loading' : displayDate(mark.read(slot))}</p>
                  {index < marks.length - 1 ? (
                    <span className="mt-2 hidden h-px w-8 bg-line-strong sm:block" aria-hidden="true" />
                  ) : null}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </section>
  )
}
