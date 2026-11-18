import { Link, Outlet, useLocation } from 'react-router'
import ErrorBoundary from './ErrorBoundary.jsx'
import TabBar from './TabBar.jsx'

function Layout() {
  const location = useLocation()
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-sm flex-col bg-surface">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="flex h-14 items-center px-4">
          <Link to="/" className="text-lg font-bold text-brand-700">
            🎓 자격증 D-day
          </Link>
        </div>
      </header>

      {/* 하단 탭바 높이만큼 아래 여백을 둬요 */}
      <main className="flex-1 px-4 pt-4 pb-24">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <TabBar />
    </div>
  )
}

export default Layout
