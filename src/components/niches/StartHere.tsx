import { Link } from 'react-router-dom'
import { START_PATHS, nicheExplorePath } from '@/niches/catalog'
import type { IndexNicheCount } from '@/types/site'
import { formatCount } from '@/utils/format'
import { ResearchLabel } from '@/components/ui/ResearchLabel'

type StartHereProps = {
  niches: IndexNicheCount[]
}

export function StartHere({ niches }: StartHereProps) {
  return (
    <section className="mt-16" aria-labelledby="start-heading">
      <ResearchLabel index="04">Start here</ResearchLabel>
      <h2 id="start-heading" className="mt-3 text-2xl font-semibold tracking-tight">
        Not sure where to start?
      </h2>
      <p className="mt-2 max-w-xl text-muted">Three ways into the index. These are navigation paths, not a ranking.</p>
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {START_PATHS.map((path) => {
          const count = niches.find((niche) => niche.name === path.name)?.count
          return (
            <li key={path.kicker}>
              <Link className="specimen flex h-full flex-col p-5" to={nicheExplorePath(path.name)}>
                <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">{path.kicker}</p>
                <h3 className="mt-3 text-lg font-semibold">{path.name}</h3>
                <p className="mt-2 text-sm text-muted">{path.note}</p>
                {count != null ? (
                  <p className="mt-4 font-mono text-xs text-muted">{formatCount(count)} indexed sites</p>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
