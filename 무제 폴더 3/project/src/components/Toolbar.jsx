import { PATTERNS } from '../data/patterns.js'

// 서비스 이름, 도안 선택(지금 도안 이름이 남는다), 되돌리기, 저장 버튼, 상태 문구
function Toolbar({ patternId, dirty, canUndo, onSelectPattern, onUndo, onSave, message }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <div className="mr-auto">
          <h1 className="font-pixel text-xl text-gray-900">한 칸 도트 공방</h1>
          <p className="text-xs text-gray-500">양털로 짓기 전에 그려 보고, 필요한 개수를 바로 세요.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          도안
          <select
            value={patternId}
            onChange={(e) => {
              const pattern = PATTERNS.find((p) => p.id === e.target.value)
              if (pattern) onSelectPattern(pattern)
            }}
            className="rounded-md border border-gray-300 bg-white px-2 py-1"
          >
            {patternId === 'saved' && (
              <option value="saved" disabled>
                저장한 도안
              </option>
            )}
            {PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↶ 되돌리기
        </button>

        <button
          type="button"
          onClick={onSave}
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          저장{dirty && <span aria-label="(저장 안 된 변경 있음)"> •</span>}
        </button>

        <p role="status" aria-live="polite" className="w-full text-sm text-gray-600 empty:hidden">
          {message}
        </p>
      </div>
    </header>
  )
}

export default Toolbar
