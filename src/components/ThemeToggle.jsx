import { useTheme } from '../hooks/useTheme.js'

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기'}
      title={dark ? '라이트 모드' : '다크 모드'}
      className="inline-flex size-10 items-center justify-center rounded-full text-xl transition hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
    >
      <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
    </button>
  )
}

export default ThemeToggle
