import { NavLink } from 'react-router'

const TABS = [
  { to: '/', label: '홈', icon: '🏠', end: true },
  { to: '/search', label: '검색', icon: '🔍' },
  { to: '/calendar', label: '캘린더', icon: '📅' },
]

function TabBar() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid h-16 max-w-screen-sm grid-cols-3">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {tab.icon}
              </span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TabBar
