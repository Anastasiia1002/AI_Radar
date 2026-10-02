import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { CompareProvider } from '@/hooks/useCompare'
import { ComparePage } from '@/pages/ComparePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ToolPage } from '@/pages/ToolPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <CompareProvider>
        <Routes>
          <Route element={<PageShell />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="tool/*" element={<ToolPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CompareProvider>
    </BrowserRouter>
  )
}
