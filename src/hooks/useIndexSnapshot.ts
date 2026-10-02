import { useEffect, useState } from 'react'
import { fetchIndexSnapshot } from '@/api/freeserp'
import { isAbortError } from '@/api/errors'
import { DOCUMENTED_INDEX_SNAPSHOT } from '@/api/snapshot'
import type { IndexSnapshot } from '@/types/site'

type SnapshotState = {
  status: 'loading' | 'ready' | 'fallback'
  snapshot: IndexSnapshot | null
}

export function useIndexSnapshot(): SnapshotState {
  const [state, setState] = useState<SnapshotState>({ status: 'loading', snapshot: null })

  useEffect(() => {
    const controller = new AbortController()

    fetchIndexSnapshot({ signal: controller.signal })
      .then((snapshot) => {
        if (controller.signal.aborted) return
        setState({ status: 'ready', snapshot })
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || isAbortError(caught)) return
        setState({ status: 'fallback', snapshot: DOCUMENTED_INDEX_SNAPSHOT })
      })

    return () => controller.abort()
  }, [])

  return state
}
