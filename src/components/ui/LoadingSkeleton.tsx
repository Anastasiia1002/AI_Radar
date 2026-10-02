type LoadingSkeletonProps = {
  rows?: number
  label?: string
}

export function LoadingSkeleton({ rows = 3, label = 'Loading' }: LoadingSkeletonProps) {
  return (
    <div className="grid max-w-md gap-3" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton" style={{ width: `${100 - index * 12}%` }} />
      ))}
    </div>
  )
}
