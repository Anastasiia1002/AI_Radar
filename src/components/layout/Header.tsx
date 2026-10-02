import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'
import { filterStateToUrlSearch } from '@/api/params'
import { IndexStatus } from './IndexStatus'

function navClass(isActive: boolean): string {
  return `text-sm font-medium transition-colors duration-150 ${
    isActive ? 'text-text' : 'text-muted hover:text-text'
  }`
}

export function Header() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { domains } = useCompare()
  const [value, setValue] = useState(() => params.get('q') ?? '')

  useEffect(() => {
    setValue(params.get('q') ?? '')
  }, [params])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    const search = filterStateToUrlSearch({
      query,
      niche: null,
      domainRatingMin: null,
      confirmedLiveAfter: null,
      sort: query === '' ? 'discovered' : 'relevance',
      page: 1,
    })
    navigate({ pathname: '/explore', search })
  }

  return (
    <header className="relative z-20 border-b border-line bg-bg">
      <div className="shell-container flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <Link className="font-display text-xl tracking-tight text-text" to="/">
          AI Radar
        </Link>
        <nav className="flex items-center gap-4" aria-label="Primary">
          <NavLink className={({ isActive }) => navClass(isActive)} to="/explore">
            Explore
          </NavLink>
          <Link
            className="text-sm font-medium text-muted transition-colors duration-150 hover:text-text"
            to="/#niches"
          >
            Niches
          </Link>
          <NavLink
            className={({ isActive }) => navClass(isActive)}
            to="/compare"
            aria-label={
              domains.length > 0 ? `Compare, ${domains.length} of ${MAX_COMPARE} selected` : 'Compare'
            }
          >
            Compare
            {domains.length > 0 ? <span className="font-mono text-accent"> {domains.length}</span> : null}
          </NavLink>
        </nav>
        <form className="flex w-full min-w-0 gap-2 md:ml-auto md:max-w-md md:flex-1" role="search" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="site-search">
            Search AI websites
          </label>
          <input
            id="site-search"
            className="field"
            type="search"
            name="q"
            placeholder="What are you looking for?"
            value={value}
            autoComplete="off"
            onChange={(event) => setValue(event.target.value)}
          />
          <button className="btn btn-primary shrink-0" type="submit">
            Search
          </button>
        </form>
        <IndexStatus />
      </div>
    </header>
  )
}
