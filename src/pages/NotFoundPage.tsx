import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="shell-container py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">That route is not part of AI Radar.</p>
      <Link className="btn btn-secondary mt-6" to="/">
        Back to AI Radar
      </Link>
    </div>
  )
}
