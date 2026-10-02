export function sameDomain(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase()
}

export function toolPath(domain: string): string {
  return `/tool/${encodeURIComponent(domain)}`
}

export function decodeRouteDomain(value: string | undefined): string {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
