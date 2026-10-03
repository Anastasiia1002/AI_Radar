import { Link } from 'react-router-dom'
import { HomePreview } from '@/components/home/HomePreview'
import type { SearchParams } from '@/types/site'

const recentParams: SearchParams = {
  q: '',
  aiCategory: '',
  drMin: null,
  fromDate: null,
  sort: 'went_live',
  order: 'desc',
  size: 4,
  from: 0,
}

const ratingParams: SearchParams = {
  q: '',
  aiCategory: '',
  drMin: 40,
  fromDate: null,
  sort: 'dr',
  order: 'desc',
  size: 4,
  from: 0,
}

export function HomePage() {
  return (
    <div className="shell-container py-16 sm:py-20">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Discovery</p>
      <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.08] font-medium sm:text-6xl">
        Discover the AI tools you didn't know existed.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Search a live index of AI websites, then inspect the signals FreeSERP actually records.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn btn-primary" to="/explore">
          Explore the index
        </Link>
        <Link className="btn btn-secondary" to="/niches">
          Explore AI niches
        </Link>
      </div>

      <HomePreview
        id="recent-heading"
        title="Recently confirmed live"
        description="Homepages FreeSERP recently confirmed as reachable. This is an index date, not a launch date."
        href="/explore"
        action="See this view"
        params={recentParams}
      />
      <HomePreview
        id="rating-heading"
        title="Higher Domain Rating"
        description="Indexed AI websites with Domain Rating 40 or higher. Domain Rating is not popularity."
        href="/explore?sort=rating&dr=40"
        action="See this view"
        params={ratingParams}
      />

      <section id="niches" className="mt-16 border-t border-line pt-8" aria-labelledby="niches-heading">
        <h2 id="niches-heading" className="text-lg font-semibold">
          Niches
        </h2>
        <p className="mt-2 max-w-lg text-muted">
          The landscape maps FreeSERP categories and the indexed counts behind them. Those counts are coverage, not
          market share.
        </p>
        <Link className="btn btn-secondary mt-6" to="/niches">
          Open the AI landscape
        </Link>
      </section>
    </div>
  )
}
