import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function PageShell() {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
