import { PATTERNS } from '../data/patterns.js'

// 서비스 이름, 도안 선택, 저장 버튼, 상태 문구
function Toolbar({ onSelectPattern, onSave, message }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
      <h1 className="font-pixel mr-auto text-xl text-gray-900">한 칸 도트 공방</h1>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        도안
        <select
          defaultValue=""
          onChange={(e) => {
            const pattern = PATTERNS.find((p) => p.id === e.target.value)
            if (pattern) onSelectPattern(pattern.create())
            e.target.value = ''
          }}
          className="rounded-md border border-gray-300 bg-white px-2 py-1"
        >
          <option value="" disabled>
            도안 불러오기
          </option>
          {PATTERNS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onSave}
        className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        저장
      </button>
      <p role="status" aria-live="polite" className="w-full text-sm text-gray-600 empty:hidden">
        {message}
      </p>
    </header>
  )
}

export default Toolbar
