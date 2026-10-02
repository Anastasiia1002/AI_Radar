import { Link } from 'react-router-dom'
import { useCompare } from '@/hooks/useCompare'
import type { AiRadarSite } from '@/types/site'
import { toolPath } from '@/utils/domain'
import { formatIndexDate, technologySignalLabel } from '@/utils/format'

type SiteCardProps = {
  site: AiRadarSite
  onCategory: (category: string) => void
}

function sameDomain(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase()
}

export function SiteCard({ site, onCategory }: SiteCardProps) {
  const compare = useCompare()
  const selected = compare.domains.some((domain) => sameDomain(domain, site.domain))
  const heading = site.title ?? site.domain

  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg leading-snug font-semibold">
          <Link className="hover:text-accent" to={toolPath(site.domain)}>
            {heading}
          </Link>
        </h2>
        {site.domainRating != null ? (
          <p className="shrink-0 text-right">
            <span className="font-mono text-sm text-accent">{site.domainRating}</span>
            <span className="mt-0.5 block font-mono text-[0.65rem] tracking-wide text-muted uppercase">DR</span>
          </p>
        ) : null}
      </div>

      {site.title ? <p className="mt-1 font-mono text-xs text-muted">{site.domain}</p> : null}
      {site.summary ? <p className="mt-3 line-clamp-4 text-sm text-muted">{site.summary}</p> : null}

      {site.categories.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {site.categories.map((category) => (
            <li key={category}>
              <button
                className="rounded-control border border-line-strong px-2 py-0.5 text-xs text-text hover:bg-raised"
                type="button"
                onClick={() => onCategory(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-4 grid gap-1 text-sm text-muted">
        {site.confirmedLive ? (
          <div className="flex justify-between gap-3">
            <dt>Confirmed live</dt>
            <dd className="font-mono text-xs text-text">{formatIndexDate(site.confirmedLive)}</dd>
          </div>
        ) : null}
        {site.firstSeen ? (
          <div className="flex justify-between gap-3">
            <dt>Added to the index</dt>
            <dd className="font-mono text-xs text-text">{formatIndexDate(site.firstSeen)}</dd>
          </div>
        ) : null}
        {site.technologySignal ? (
          <div className="flex justify-between gap-3">
            <dt>Technology signal</dt>
            <dd className="text-right text-text">{technologySignalLabel(site.technologySignal)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <button
          className="btn btn-secondary"
          type="button"
          disabled={!selected && compare.isFull}
          aria-pressed={selected}
          onClick={() => {
            if (selected) {
              const stored = compare.domains.find((domain) => sameDomain(domain, site.domain))
              compare.remove(stored ?? site.domain)
              return
            }
            compare.add(site.domain)
          }}
        >
          {selected ? 'Remove' : 'Compare'}
        </button>
        {site.url ? (
          <a className="btn btn-secondary" href={site.url} target="_blank" rel="noreferrer">
            Open site
          </a>
        ) : null}
      </div>
    </article>
  )
}
