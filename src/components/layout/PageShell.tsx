import { Outlet, useLocation } from 'react-router-dom'
import { CompareTray } from '@/components/compare/CompareTray'
import { useCompare } from '@/hooks/useCompare'
import { Header } from './Header'

export function PageShell() {
  const { domains } = useCompare()
  const { pathname } = useLocation()
  const showTray = domains.length > 0 && pathname !== '/compare'

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className={`relative z-10 ${showTray ? 'pb-24' : ''}`}>
        <Outlet />
      </main>
      {showTray ? <CompareTray /> : null}
    </div>
  )
}
