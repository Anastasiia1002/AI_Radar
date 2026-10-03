import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAbortError, toIndexErrorMessage } from '@/api/errors'
import { searchSites } from '@/api/freeserp'
import { SiteCard } from '@/components/site/SiteCard'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { nicheExplorePath } from '@/niches/catalog'
import type { AiRadarSite, SearchParams } from '@/types/site'

type HomePreviewProps = {
  id: string
  title: string
  description: string
  href: string
  action: string
  params: SearchParams
}

export function HomePreview({ id, title, description, href, action, params }: HomePreviewProps) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [sites, setSites] = useState<AiRadarSite[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    searchSites(params, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return
        setSites(result.sites.slice(0, 4))
        setStatus('ready')
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || isAbortError(caught)) return
        setMessage(toIndexErrorMessage(caught))
        setStatus('error')
      })
    return () => controller.abort()
  }, [params])

  return (
    <section className="mt-16" aria-labelledby={id}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={id} className="text-lg font-semibold">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>
        </div>
        <Link className="text-sm font-semibold underline decoration-line-strong underline-offset-4" to={href}>
          {action}
        </Link>
      </div>
      {status === 'loading' ? (
        <div className="mt-4">
          <LoadingSkeleton label={`Loading ${title}`} />
        </div>
      ) : null}
      {status === 'error' ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
      {status === 'ready' && sites.length > 0 ? (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {sites.map((site) => (
            <li key={site.domain}>
              <SiteCard site={site} onCategory={(category) => navigate(nicheExplorePath(category))} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
