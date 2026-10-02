import { Link } from 'react-router-dom'
import { MAX_COMPARE } from '@/hooks/useCompare'

export function EmptyComparison() {
  return (
    <section className="mt-10" aria-labelledby="empty-compare-heading">
      <div className="max-w-xl">
        <h2 id="empty-compare-heading" className="font-display text-3xl leading-tight font-medium sm:text-4xl">
          Build your comparison
        </h2>
        <p className="mt-3 text-muted">
          Select up to {MAX_COMPARE} AI tools from Explore to compare their observable index signals here.
        </p>
        <Link className="btn btn-primary mt-6" to="/explore">
          Explore AI tools
        </Link>
      </div>
      <ol className="mt-8 grid gap-3 md:grid-cols-3">
        {['01', '02', '03'].map((slot) => (
          <li key={slot}>
            <Link
              className="specimen flex min-h-40 flex-col justify-between p-5"
              to="/explore"
              aria-label={`Add tool ${slot}. Opens Explore.`}
            >
              <span className="font-mono text-xs tracking-[0.16em] text-muted">{slot}</span>
              <span className="text-sm font-semibold">Add tool</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
