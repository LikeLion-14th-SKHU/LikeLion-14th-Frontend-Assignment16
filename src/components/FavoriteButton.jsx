import { Star } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites.js'
import { ICON } from '../lib/icons.js'

function FavoriteButton({ name, size = 'md' }) {
  const { has, toggle } = useFavorites()
  const active = has(name)
  const box = size === 'lg' ? 'size-11' : 'size-10'

  return (
    <button
      type="button"
      onClick={() => toggle(name)}
      aria-pressed={active}
      aria-label={active ? `${name} 관심 목록에서 빼기` : `${name} 관심 목록에 담기`}
      title={active ? '관심 목록에서 빼기' : '관심 목록에 담기'}
      className={`${box} inline-flex shrink-0 items-center justify-center rounded-full transition hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none`}
    >
      <Star
        size={ICON.md}
        className={active ? 'fill-current text-brand-600' : 'text-ink-muted'}
      />
    </button>
  )
}

export default FavoriteButton
