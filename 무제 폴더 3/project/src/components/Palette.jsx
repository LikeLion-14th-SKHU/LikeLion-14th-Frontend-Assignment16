import { WOOLS, WOOL_BY_ID } from '../data/wools.js'
import WoolSwatch from './WoolSwatch.jsx'

// 양털 16색 + 지우개. 지우개는 selected = null.
function Palette({ selected, onSelect, textures, onTextureError }) {
  const current = selected ? WOOL_BY_ID[selected] : null

  return (
    <section aria-labelledby="palette-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="palette-title" className="mb-3 font-semibold text-gray-900">
        양털 고르기
      </h2>

      {/* 지금 고른 것: 큰 미리보기 + 게임 속 이름 + 구하는 법 */}
      <div className="mb-3 flex items-center gap-3 rounded-md bg-gray-50 p-2" aria-live="polite">
        <WoolSwatch
          wool={current}
          textures={textures}
          onTextureError={onTextureError}
          className="size-12 shrink-0 border border-gray-300"
        />
        <div className="min-w-0 text-sm">
          <p className="font-bold text-gray-900">{current ? current.name : '지우개'}</p>
          <p className="text-xs text-gray-600">
            {current ? current.source : '칸을 클릭하면 비워요.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {WOOLS.map((w) => {
          const isSelected = w.id === selected
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onSelect(w.id)}
              aria-pressed={isSelected}
              aria-label={w.name}
              title={w.name}
              className={`flex flex-col items-center gap-0.5 rounded-md border-[3px] p-0.5 text-[11px] ${
                isSelected ? 'border-gray-900 font-bold text-gray-900' : 'border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <WoolSwatch
                wool={w}
                textures={textures}
                onTextureError={onTextureError}
                className="aspect-square w-full max-w-10 border border-gray-300"
              />
              {w.color}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        className={`mt-2 flex w-full items-center gap-2 rounded-md border-[3px] px-2 py-1 text-sm ${
          selected === null ? 'border-gray-900 font-bold text-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="checker block size-5 border border-gray-300" aria-hidden="true" />
        지우개
      </button>

      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        팁: 칸을 <strong className="text-gray-700">우클릭</strong>하면 그 칸의 색을 바로 골라요(스포이트).{' '}
        <kbd className="rounded border border-gray-300 px-1">Ctrl</kbd>+
        <kbd className="rounded border border-gray-300 px-1">Z</kbd>로 되돌려요.
      </p>
    </section>
  )
}

export default Palette
