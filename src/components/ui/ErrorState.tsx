type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({
  title = "We couldn't reach the AI index.",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-panel" role="alert">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-muted">{message}</p>
      {onRetry ? (
        <button className="btn btn-secondary mt-4" type="button" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  )
}
