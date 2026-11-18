import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { ICON } from '../lib/icons.js'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기'}
      title={dark ? '라이트 모드' : '다크 모드'}
      className="inline-flex size-10 items-center justify-center rounded-full text-ink-muted transition hover:text-ink hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
    >
      {dark ? <Sun size={ICON.md} /> : <Moon size={ICON.md} />}
    </button>
  )
}

export default ThemeToggle
