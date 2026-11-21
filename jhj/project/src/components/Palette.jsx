import { WOOLS } from '../data/wools.js'

// 양털 8색 + 지우개. 지우개는 selected = null.
function Palette({ selected, onSelect, textures, onTextureError }) {
  const items = [...WOOLS, { id: null, name: '지우개', fallback: null }]
  const selectedName = items.find((w) => w.id === selected)?.name

  return (
    <section aria-labelledby="palette-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="palette-title" className="mb-1 font-semibold text-gray-900">
        색상 팔레트
      </h2>
      <p className="mb-3 text-sm text-gray-600" aria-live="polite">
        선택: <strong className="text-gray-900">{selectedName}</strong>
      </p>
      <div className="grid grid-cols-3 gap-2">
        {items.map((w) => {
          const isSelected = w.id === selected
          return (
            <button
              key={w.id ?? 'eraser'}
              type="button"
              onClick={() => onSelect(w.id)}
              aria-pressed={isSelected}
              className={`flex flex-col items-center gap-1 rounded-md p-1 text-xs ${
                isSelected ? 'border-[3px] border-gray-900 font-bold text-gray-900' : 'border-[3px] border-transparent text-gray-600'
              }`}
            >
              <span
                className={`block aspect-square w-10 overflow-hidden border border-gray-300 ${w.id ? '' : 'checker'}`}
                style={w.id ? { backgroundColor: w.fallback } : undefined}
                aria-hidden="true"
              >
                {w.id && textures[w.id] && (
                  <img
                    src={textures[w.id]}
                    alt=""
                    draggable={false}
                    onError={() => onTextureError(w.id)}
                    className="pixelated block size-full"
                  />
                )}
              </span>
              {w.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default Palette
