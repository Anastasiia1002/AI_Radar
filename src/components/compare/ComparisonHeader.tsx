import { Link } from 'react-router-dom'
import { DomainMonogram } from '@/components/compare/DomainMonogram'
import { MAX_COMPARE } from '@/hooks/useCompare'
import type { AiRadarSite } from '@/types/site'
import { toolPath } from '@/utils/domain'

export type ComparisonSlot = {
  domain: string
  site: AiRadarSite | null
  pending: boolean
  error: string | null
}

type ComparisonHeaderProps = {
  slots: ComparisonSlot[]
  onRemove: (domain: string) => void
  onReplace: (domain: string) => void
}

export function ComparisonHeader({ slots, onRemove, onReplace }: ComparisonHeaderProps) {
  const openSlots = Math.max(0, MAX_COMPARE - slots.length)

  return (
    <section className="mt-10" aria-labelledby="selected-tools-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="selected-tools-heading" className="text-lg font-semibold">
          Selected tools
        </h2>
        {slots.length >= MAX_COMPARE ? (
          <p className="font-mono text-xs tracking-wide text-muted uppercase">Comparison is limited to 3 tools.</p>
        ) : null}
      </div>
      <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot, index) => {
          const title = slot.site?.title ?? slot.domain
          const url = slot.site?.url ?? null
          return (
            <li key={slot.domain}>
              <article className="specimen flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <DomainMonogram domain={slot.site?.domain ?? slot.domain} />
                  <div className="min-w-0">
                    <p className="font-mono text-xs tracking-[0.16em] text-muted">{String(index + 1).padStart(2, '0')}</p>
                    <h3 className="mt-1 text-lg leading-snug font-semibold break-words">
                      {slot.site ? (
                        <Link className="hover:text-accent" to={toolPath(slot.site.domain)}>
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </h3>
                    <p className="mt-1 font-mono text-xs break-all text-muted">{slot.site?.domain ?? slot.domain}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  {slot.pending ? <p className="text-muted">Loading index record</p> : null}
                  {slot.error ? <p className="text-danger">{slot.error}</p> : null}
                  {!slot.pending && !slot.error && !slot.site ? (
                    <p className="text-muted">This domain is not in the current AI index.</p>
                  ) : null}
                  {url ? (
                    <a
                      className="font-semibold text-text underline decoration-line-strong underline-offset-4 hover:text-accent"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit site
                      <span className="sr-only"> (leaves AI Radar)</span>
                    </a>
                  ) : !slot.pending && !slot.error ? (
                    <p className="text-muted">Website unavailable</p>
                  ) : null}
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <button className="btn btn-secondary" type="button" onClick={() => onRemove(slot.domain)}>
                    Remove
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => onReplace(slot.domain)}>
                    Replace
                  </button>
                </div>
              </article>
            </li>
          )
        })}
        {Array.from({ length: openSlots }, (_, index) => {
          const number = String(slots.length + index + 1).padStart(2, '0')
          return (
            <li key={number}>
              <Link className="specimen flex min-h-40 flex-col justify-between p-5" to="/explore">
                <span className="font-mono text-xs tracking-[0.16em] text-muted">{number}</span>
                <span className="text-sm font-semibold">Add tool</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
