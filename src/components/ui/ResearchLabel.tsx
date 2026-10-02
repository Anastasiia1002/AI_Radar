type ResearchLabelProps = {
  index?: string
  children: string
}

export function ResearchLabel({ index, children }: ResearchLabelProps) {
  return (
    <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">
      {index ? <span className="text-muted">{index} / </span> : null}
      {children}
    </p>
  )
}
