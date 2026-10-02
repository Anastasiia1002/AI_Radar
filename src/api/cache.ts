import { abortedError } from './errors.ts'

type Entry = {
  expiresAt: number
  value: unknown
}

type Flight = {
  controller: AbortController
  waiters: number
  promise: Promise<unknown>
}

const store = new Map<string, Entry>()
const flights = new Map<string, Flight>()

export const SEARCH_CACHE_TTL_MS = 45_000
export const SNAPSHOT_CACHE_TTL_MS = 30 * 60 * 1000

export function clearRequestCache(): void {
  store.clear()
  for (const flight of flights.values()) flight.controller.abort()
  flights.clear()
}

function readFresh(key: string): unknown {
  const entry = store.get(key)
  if (!entry) return undefined
  if (entry.expiresAt <= Date.now()) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

function startFlight<T>(
  key: string,
  ttlMs: number,
  run: (signal: AbortSignal) => Promise<T>,
): Flight {
  const existing = flights.get(key)
  if (existing) return existing

  const controller = new AbortController()
  let cancelled = false
  controller.signal.addEventListener('abort', () => {
    cancelled = true
  })

  const flight = {
    controller,
    waiters: 0,
    promise: undefined as unknown as Promise<unknown>,
  } satisfies Flight

  const promise = Promise.resolve()
    .then(() => run(controller.signal))
    .then((value) => {
      if (flights.get(key) === flight) flights.delete(key)
      if (!cancelled) store.set(key, { expiresAt: Date.now() + ttlMs, value })
      return value
    })
    .catch((error: unknown) => {
      if (flights.get(key) === flight) flights.delete(key)
      throw error
    })

  promise.catch(() => {
    // Observed so a shared request stays handled after every caller has left.
  })

  flight.promise = promise
  flights.set(key, flight)
  return flight
}

export function cachedRequest<T>(
  key: string,
  ttlMs: number,
  run: (signal: AbortSignal) => Promise<T>,
  callerSignal?: AbortSignal,
): Promise<T> {
  if (callerSignal?.aborted) return Promise.reject(abortedError())

  const cached = readFresh(key)
  if (cached !== undefined) return Promise.resolve(cached as T)

  const flight = startFlight(key, ttlMs, run)

  return new Promise<T>((resolve, reject) => {
    let callerDone = false

    const leave = () => {
      if (callerDone) return
      callerDone = true
      callerSignal?.removeEventListener('abort', onAbort)
    }

    const onAbort = () => {
      leave()
      flight.waiters -= 1
      if (flight.waiters <= 0) {
        flight.controller.abort()
        if (flights.get(key) === flight) flights.delete(key)
      }
      reject(abortedError())
    }

    flight.waiters += 1
    if (callerSignal?.aborted) {
      onAbort()
      return
    }
    callerSignal?.addEventListener('abort', onAbort)

    flight.promise.then(
      (value) => {
        if (callerDone) return
        leave()
        flight.waiters -= 1
        resolve(value as T)
      },
      (error: unknown) => {
        if (callerDone) return
        leave()
        flight.waiters -= 1
        reject(error)
      },
    )
  })
}
