import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="state-panel">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-muted">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
