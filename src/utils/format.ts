export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

const TECHNOLOGY_LABELS: Record<string, string> = {
  nextjs: 'Next.js',
  react: 'React',
  lovable: 'Lovable',
  v0: 'v0',
  bolt: 'Bolt',
  base44: 'Base44',
  ai_likely: 'AI-likely',
  wordpress: 'WordPress',
  shopify: 'Shopify',
  webflow: 'Webflow',
  framer: 'Framer',
}

export function technologySignalLabel(token: string): string {
  return TECHNOLOGY_LABELS[token] ?? token
}

export function formatIndexDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}
