import { useState } from 'react'
import { useNavigate } from 'react-router'

// 홈과 검색 페이지에서 함께 써요. 제출하면 /search?q=검색어 로 이동해요.
function SearchBox({ defaultValue = '', autoFocus = false }) {
  const [query, setQuery] = useState(defaultValue)
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative">
      <label htmlFor="cert-search" className="sr-only">
        자격증 이름 검색
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
      >
        🔍
      </span>
      <input
        id="cert-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="자격증 이름 검색 (예: 정보처리기사)"
        autoFocus={autoFocus}
        className="h-12 w-full rounded-xl border border-line bg-canvas pr-4 pl-10 text-base placeholder:text-ink-muted focus:border-brand-500 focus:bg-surface focus:ring-2 focus:ring-brand-100 focus:outline-none"
      />
    </form>
  )
}

export default SearchBox
