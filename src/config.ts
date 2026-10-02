function readViteEnv(read: () => string | boolean | undefined): string | undefined {
  try {
    const value = read()
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  } catch {
    return undefined
  }
}

const DIRECT_BASE_URL = 'https://freeserp.ai/api.php'
const PROXY_BASE_URL = '/freeserp'
const DEFAULT_AGENT = 'AI-Radar/0.1'

export function freeserpBaseUrl(): string {
  const configured = readViteEnv(() => import.meta.env.VITE_FREESERP_BASE_URL)
  if (configured) return configured
  // Browsers reject FreeSERP's duplicated Access-Control-Allow-Origin header.
  // The app calls a same-origin proxy; Node scripts talk to FreeSERP directly.
  if (typeof window !== 'undefined') return PROXY_BASE_URL
  return DIRECT_BASE_URL
}

export function freeserpAgent(): string {
  return readViteEnv(() => import.meta.env.VITE_FREESERP_AGENT) ?? DEFAULT_AGENT
}
