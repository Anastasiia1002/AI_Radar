import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'ai-radar:compare'
export const MAX_COMPARE = 3

type CompareContextValue = {
  domains: string[]
  isFull: boolean
  has: (domain: string) => boolean
  add: (domain: string) => boolean
  remove: (domain: string) => void
  clear: () => void
}

const CompareContext = createContext<CompareContextValue | null>(null)

function readStoredDomains(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const domains: string[] = []
    for (const item of parsed) {
      if (typeof item !== 'string') continue
      const domain = item.trim()
      if (domain === '' || domains.includes(domain)) continue
      domains.push(domain)
      if (domains.length === MAX_COMPARE) break
    }
    return domains
  } catch {
    return []
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [domains, setDomains] = useState<string[]>(readStoredDomains)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(domains))
  }, [domains])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      setDomains(readStoredDomains())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<CompareContextValue>(() => {
    return {
      domains,
      isFull: domains.length >= MAX_COMPARE,
      has: (domain) => domains.includes(domain.trim()),
      add: (domain) => {
        const next = domain.trim()
        if (next === '' || domains.includes(next) || domains.length >= MAX_COMPARE) return false
        setDomains((current) => {
          if (current.includes(next) || current.length >= MAX_COMPARE) return current
          return [...current, next]
        })
        return true
      },
      remove: (domain) => {
        const next = domain.trim()
        setDomains((current) => current.filter((item) => item !== next))
      },
      clear: () => setDomains([]),
    }
  }, [domains])

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare(): CompareContextValue {
  const value = useContext(CompareContext)
  if (!value) throw new Error('useCompare must be used within CompareProvider')
  return value
}
