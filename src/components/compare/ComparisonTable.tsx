import type { ComparisonSlot } from '@/components/compare/ComparisonHeader'
import {
  displayDate,
  displayDomainRating,
  displayStatus,
  displayTechnology,
  displayTld,
} from '@/compare/signals'

type ComparisonTableProps = {
  slots: ComparisonSlot[]
}

function categories(slot: ComparisonSlot) {
  if (slot.pending) return <span className="text-muted">Loading</span>
  if (!slot.site || slot.site.categories.length === 0) {
    return <span className="text-muted">{slot.site ? 'No category detected' : 'Not available'}</span>
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {slot.site.categories.map((category) => (
        <li key={category} className="rounded-control border border-line-strong px-2 py-0.5 text-xs">
          {category}
        </li>
      ))}
    </ul>
  )
}

function textValue(slot: ComparisonSlot, value: string) {
  if (slot.pending) return 'Loading'
  return value
}

const rows = [
  { label: 'AI categories', cell: categories },
  {
    label: 'Domain Rating',
    cell: (slot: ComparisonSlot) => textValue(slot, displayDomainRating(slot.site)),
  },
  {
    label: 'Confirmed live',
    cell: (slot: ComparisonSlot) => textValue(slot, slot.site ? displayDate(slot.site.confirmedLive) : 'Not available'),
  },
  {
    label: 'First indexed',
    cell: (slot: ComparisonSlot) => textValue(slot, slot.site ? displayDate(slot.site.firstSeen) : 'Not available'),
  },
  {
    label: 'Technology signal',
    cell: (slot: ComparisonSlot) => textValue(slot, displayTechnology(slot.site)),
  },
  {
    label: 'TLD',
    cell: (slot: ComparisonSlot) => textValue(slot, displayTld(slot.site)),
  },
  {
    label: 'HTTP status',
    cell: (slot: ComparisonSlot) => textValue(slot, displayStatus(slot.site)),
  },
]

export function ComparisonTable({ slots }: ComparisonTableProps) {
  if (slots.length === 0) return null
  return (
    <section className="mt-12" aria-labelledby="comparison-table-heading">
      <h2 id="comparison-table-heading" className="text-lg font-semibold">
        Indexed fields
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Domain Rating is a domain metric, not popularity. Confirmed live and first indexed are index dates, not a
        launch date. Technology signal is a heuristic.
      </p>

      <div className="mt-6 grid gap-4 md:hidden">
        {rows.map((row) => (
          <section key={row.label} className="border-t border-line pt-4">
            <h3 className="font-mono text-xs tracking-[0.14em] text-muted uppercase">{row.label}</h3>
            <ul className="mt-3 grid gap-3">
              {slots.map((slot) => (
                <li key={slot.domain}>
                  <p className="font-mono text-xs break-all text-muted">{slot.site?.domain ?? slot.domain}</p>
                  <div className="mt-1 text-sm">{row.cell(slot)}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Indexed fields for the selected websites</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-3 pr-4 font-mono text-xs font-medium tracking-[0.14em] text-muted uppercase">
                Signal
              </th>
              {slots.map((slot) => (
                <th key={slot.domain} scope="col" className="px-3 py-3 font-mono text-xs font-medium break-all">
                  {slot.site?.domain ?? slot.domain}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line align-top">
                <th scope="row" className="py-4 pr-4 font-medium">
                  {row.label}
                </th>
                {slots.map((slot) => (
                  <td key={slot.domain} className="px-3 py-4">
                    {row.cell(slot)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
