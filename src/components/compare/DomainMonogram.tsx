type DomainMonogramProps = {
  domain: string
}

export function DomainMonogram({ domain }: DomainMonogramProps) {
  const letters = domain.replace(/^www\./i, '').slice(0, 2).toUpperCase()
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line-strong bg-bg font-mono text-xs text-accent"
    >
      {letters || '·'}
    </span>
  )
}
