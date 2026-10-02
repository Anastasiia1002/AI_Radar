import { useEffect, useState } from 'react'
import { lookupSite } from '@/api/freeserp'
import { isAbortError, toIndexErrorMessage } from '@/api/errors'
import type { AiRadarSite } from '@/types/site'

export type CompareRecord = {
  domain: string
  site: AiRadarSite | null
  error: string | null
}

type CompareSitesStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useCompareSites(domains: string[]) {
  const [status, setStatus] = useState<CompareSitesStatus>(domains.length === 0 ? 'idle' : 'loading')
  const [records, setRecords] = useState<CompareRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const key = domains.join('\n')

  useEffect(() => {
    const selected = key === '' ? [] : key.split('\n')
    if (selected.length === 0) {
      setStatus('idle')
      setRecords([])
      setError(null)
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setError(null)

    Promise.all(
      selected.map(async (domain) => {
        try {
          const site = await lookupSite(domain, { signal: controller.signal })
          return { domain, site, error: null }
        } catch (caught: unknown) {
          if (controller.signal.aborted || isAbortError(caught)) throw caught
          return { domain, site: null, error: toIndexErrorMessage(caught) }
        }
      }),
    )
      .then((next) => {
        if (controller.signal.aborted) return
        setRecords(next)
        if (next.length > 0 && next.every((record) => record.error)) {
          setError(next[0]?.error ?? "We couldn't reach the AI index.")
          setStatus('error')
          return
        }
        setStatus('ready')
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || isAbortError(caught)) return
        setError(toIndexErrorMessage(caught))
        setStatus('error')
      })

    return () => controller.abort()
  }, [key, reloadKey])

  return {
    status,
    records,
    error,
    reload: () => setReloadKey((value) => value + 1),
  }
}
