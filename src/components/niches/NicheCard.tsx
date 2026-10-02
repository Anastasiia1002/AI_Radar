import { Link } from 'react-router-dom'
import { nicheDescription, nicheExplorePath } from '@/niches/catalog'
import { formatCount } from '@/utils/format'

type NicheCardProps = {
  index: number
  name: string
  count: number
  width: number
}

export function NicheCard({ index, name, count, width }: NicheCardProps) {
  const number = String(index + 1).padStart(2, '0')
  return (
    <li className="rise" style={{ animationDelay: `${index * 35}ms` }}>
      <Link className="specimen group flex h-full flex-col p-5" to={nicheExplorePath(name)}>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs tracking-[0.16em] text-muted transition-colors duration-150 group-hover:text-accent">
            {number}
          </span>
          <span className="font-mono text-[0.65rem] tracking-[0.16em] text-muted uppercase">AI index</span>
        </div>
        <h3 className="mt-6 text-xl font-semibold tracking-tight">{name}</h3>
        <p className="mt-2 font-mono text-sm text-accent">{formatCount(count)} sites</p>
        <p className="mt-3 text-sm text-muted">{nicheDescription(name)}</p>
        <div className="signal-track mt-5" aria-hidden="true">
          <div className="signal-value" style={{ width: `${width}%` }} />
        </div>
        <span className="mt-5 text-sm font-semibold text-text">Explore category</span>
      </Link>
    </li>
  )
}
