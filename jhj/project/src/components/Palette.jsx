import { useState } from 'react'
import { WOOLS, WOOL_BY_ID } from '../data/wools.js'
import { recipeImageUrl } from '../api/mcApi.js'
import WoolSwatch from './WoolSwatch.jsx'

const TOOLS = [
  { id: 'brush', label: '붓', hint: '클릭·드래그' },
  { id: 'fill', label: '채우기', hint: '이어진 영역' },
]

// 도구(붓/채우기) + 양털 16색 + 지우개(selected = null) + 고른 양털의 제작법(mc-api)
function Palette({ selected, onSelect, tool, onTool, textures, onTextureError }) {
  const current = selected ? WOOL_BY_ID[selected] : null
  const [showRecipe, setShowRecipe] = useState(false)
  const [recipeError, setRecipeError] = useState(null)

  return (
    <section aria-labelledby="palette-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="palette-title" className="mb-3 font-semibold text-gray-900">
        도구 · 양털
      </h2>

      <div className="mb-3 grid grid-cols-2 gap-1" role="group" aria-label="도구">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTool(t.id)}
            aria-pressed={tool === t.id}
            className={`rounded-md border-[3px] px-2 py-1 text-sm ${
              tool === t.id ? 'border-gray-900 font-bold text-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t.label} <span className="text-xs font-normal text-gray-500">{t.hint}</span>
          </button>
        ))}
      </div>

      {/* 지금 고른 것: 큰 미리보기 + 게임 속 이름 + 구하는 법 */}
      <div className="mb-3 rounded-md bg-gray-50 p-2" aria-live="polite">
        <div className="flex items-center gap-3">
          <WoolSwatch
            wool={current}
            textures={textures}
            onTextureError={onTextureError}
            className="size-12 shrink-0 border border-gray-300"
          />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold text-gray-900">{current ? current.name : '지우개'}</p>
            <p className="text-xs text-gray-600">{current ? current.source : '칸을 비워요.'}</p>
          </div>
        </div>
        {current && (
          <button
            type="button"
            onClick={() => setShowRecipe((v) => !v)}
            aria-expanded={showRecipe}
            className="mt-2 text-xs text-gray-700 underline underline-offset-2 hover:text-gray-900"
          >
            {showRecipe ? '제작법 접기' : '제작대 조합법 보기'}
          </button>
        )}
        {current && showRecipe && (
          <figure className="mt-2">
            {recipeError === current.id ? (
              <p className="text-xs text-gray-500">제작법 그림을 불러오지 못했어요. ({current.source})</p>
            ) : (
              <img
                key={current.id}
                src={recipeImageUrl(current)}
                alt={`${current.name} 제작법: ${current.source}`}
                onError={() => setRecipeError(current.id)}
                className="pixelated w-full rounded border border-gray-200"
              />
            )}
            <figcaption className="mt-1 text-[11px] text-gray-500">mc-api 레시피 렌더</figcaption>
          </figure>
        )}
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
    </section>
  )
}

export default Palette
