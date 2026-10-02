import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { CompareProvider } from '@/hooks/useCompare'
import { ComparePage } from '@/pages/ComparePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { HomePage } from '@/pages/HomePage'
import { NichesPage } from '@/pages/NichesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ToolPage } from '@/pages/ToolPage'

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return undefined
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export function AppRouter() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <CompareProvider>
        <Routes>
          <Route element={<PageShell />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="niches" element={<NichesPage />} />
            <Route path="tool/*" element={<ToolPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CompareProvider>
    </BrowserRouter>
  )
}
