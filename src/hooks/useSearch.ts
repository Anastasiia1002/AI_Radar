import { useEffect, useState } from 'react'
import { searchSites } from '@/api/freeserp'
import { isAbortError, toIndexErrorMessage } from '@/api/errors'
import { filterStateToSearchParams } from '@/api/params'
import type { FilterState, SearchResult } from '@/types/site'

const SEARCH_DEBOUNCE_MS = 300

type SearchStatus = 'loading' | 'success' | 'error'

export function useSearch(filters: FilterState) {
  const [status, setStatus] = useState<SearchStatus>('loading')
  const [data, setData] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const { query, niche, domainRatingMin, confirmedLiveAfter, sort, page } = filters

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setError(null)
    const timer = window.setTimeout(() => {
      const params = filterStateToSearchParams({
        query,
        niche,
        domainRatingMin,
        confirmedLiveAfter,
        sort,
        page,
      })

      searchSites(params, { signal: controller.signal })
        .then((result) => {
          if (controller.signal.aborted) return
          setData(result)
          setError(null)
          setStatus('success')
        })
        .catch((caught: unknown) => {
          if (controller.signal.aborted || isAbortError(caught)) return
          setError(toIndexErrorMessage(caught))
          setStatus('error')
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, niche, domainRatingMin, confirmedLiveAfter, sort, page, reloadKey])

  return {
    status,
    data,
    error,
    reload: () => setReloadKey((value) => value + 1),
  }
}
