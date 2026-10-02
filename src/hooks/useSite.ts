import { useEffect, useState } from 'react'
import { lookupSite } from '@/api/freeserp'
import { isAbortError, toIndexErrorMessage } from '@/api/errors'
import type { AiRadarSite } from '@/types/site'

export type SiteRequestStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error'

export function useSite(domain: string) {
  const [status, setStatus] = useState<SiteRequestStatus>('loading')
  const [site, setSite] = useState<AiRadarSite | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const trimmed = domain.trim()

  useEffect(() => {
    if (trimmed === '') {
      setStatus('idle')
      setSite(null)
      setError(null)
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setSite(null)
    setError(null)

    lookupSite(trimmed, { signal: controller.signal })
      .then((found) => {
        if (controller.signal.aborted) return
        setSite(found)
        setStatus(found ? 'ready' : 'missing')
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || isAbortError(caught)) return
        setError(toIndexErrorMessage(caught))
        setStatus('error')
      })

    return () => controller.abort()
  }, [trimmed, reloadKey])

  return {
    status,
    site,
    error,
    reload: () => setReloadKey((value) => value + 1),
  }
}
