import { PRIORITY_NICHES, SORT_KEYS, SORT_LABELS, type FilterState, type SortKey } from '@/types/site'

type ExploreControlsProps = {
  filters: FilterState
  onChange: (next: FilterState) => void
}

const RATING_FLOORS = [10, 20, 40, 60, 80] as const

function isSortKey(value: string): value is SortKey {
  return SORT_KEYS.some((sort) => sort === value)
}

export function ExploreControls({ filters, onChange }: ExploreControlsProps) {
  const queryPresent = filters.query.trim() !== ''
  const ratingOptions: number[] = [...RATING_FLOORS]
  if (filters.domainRatingMin != null && !ratingOptions.some((floor) => floor === filters.domainRatingMin)) {
    ratingOptions.push(filters.domainRatingMin)
    ratingOptions.sort((left, right) => left - right)
  }

  function update(patch: Partial<FilterState>) {
    onChange({ ...filters, ...patch, page: 1 })
  }

  const narrowed =
    filters.niche != null ||
    filters.domainRatingMin != null ||
    filters.confirmedLiveAfter != null ||
    filters.sort !== (queryPresent ? 'relevance' : 'discovered')

  return (
    <form
      className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Filter and sort the index"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="grid gap-1.5 text-sm font-medium">
        Sort
        <select
          className="field"
          name="sort"
          value={filters.sort}
          onChange={(event) => {
            const value = event.target.value
            if (!isSortKey(value)) return
            if (value === 'relevance' && !queryPresent) return
            update({ sort: value })
          }}
        >
          {SORT_KEYS.map((sort) => (
            <option key={sort} value={sort} disabled={sort === 'relevance' && !queryPresent}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Niche
        <select
          className="field"
          name="niche"
          value={filters.niche ?? ''}
          onChange={(event) => update({ niche: event.target.value === '' ? null : event.target.value })}
        >
          <option value="">All niches</option>
          {PRIORITY_NICHES.map((niche) => (
            <option key={niche} value={niche}>
              {niche}
            </option>
          ))}
          {filters.niche && !PRIORITY_NICHES.some((niche) => niche === filters.niche) ? (
            <option value={filters.niche}>{filters.niche}</option>
          ) : null}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Domain Rating at least
        <select
          className="field"
          name="dr"
          value={filters.domainRatingMin == null ? '' : String(filters.domainRatingMin)}
          onChange={(event) => {
            const value = event.target.value
            update({ domainRatingMin: value === '' ? null : Number(value) })
          }}
        >
          <option value="">Any</option>
          {ratingOptions.map((floor) => (
            <option key={floor} value={floor}>
              {floor}+
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Confirmed live after
        <input
          className="field"
          type="date"
          name="after"
          value={filters.confirmedLiveAfter ?? ''}
          onChange={(event) => update({ confirmedLiveAfter: event.target.value === '' ? null : event.target.value })}
        />
      </label>

      {narrowed ? (
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                niche: null,
                domainRatingMin: null,
                confirmedLiveAfter: null,
                sort: queryPresent ? 'relevance' : 'discovered',
                page: 1,
              })
            }
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </form>
  )
}
