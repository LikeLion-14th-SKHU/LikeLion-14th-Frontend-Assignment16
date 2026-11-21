import { useRef, useState } from 'react'
import { GRID_SIZE } from '../data/patterns.js'
import { WOOL_BY_ID } from '../data/wools.js'

const MOVES = {
  ArrowUp: -GRID_SIZE,
  ArrowDown: GRID_SIZE,
  ArrowLeft: -1,
  ArrowRight: 1,
}

// 256개 칸 버튼. 칸 사이 1px 선은 gap-px + 바탕색으로 만든다.
// 텍스처가 있으면 이미지를 얹고, 없거나 실패하면 대체 단색 배경이 보인다.
// 키보드: Tab으로 격자에 들어와 방향키로 이동, Enter/Space로 칠하기 (roving tabindex)
function PixelGrid({ grid, onPaint, textures, onTextureError }) {
  const [focusIndex, setFocusIndex] = useState(0)
  const containerRef = useRef(null)

  const handleKeyDown = (e, i) => {
    const step = MOVES[e.key]
    if (step === undefined) return
    const col = i % GRID_SIZE
    // 왼쪽/오른쪽 끝에서 다음 줄로 넘어가지 않게
    if ((e.key === 'ArrowLeft' && col === 0) || (e.key === 'ArrowRight' && col === GRID_SIZE - 1)) return
    const next = i + step
    if (next < 0 || next >= grid.length) return
    e.preventDefault()
    setFocusIndex(next)
    containerRef.current?.querySelector(`[data-index="${next}"]`)?.focus()
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="16×16 도안 격자. 방향키로 이동하고 Enter로 칠합니다."
      className="grid aspect-square w-full max-w-[min(100%,36rem)] gap-px border border-gray-300 bg-gray-300"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
    >
      {grid.map((id, i) => {
        const wool = id ? WOOL_BY_ID[id] : null
        const src = id ? textures[id] : undefined
        const row = Math.floor(i / GRID_SIZE) + 1
        const col = (i % GRID_SIZE) + 1
        return (
          <button
            key={i}
            type="button"
            data-index={i}
            tabIndex={i === focusIndex ? 0 : -1}
            onClick={() => {
              setFocusIndex(i)
              onPaint(i)
            }}
            onKeyDown={(e) => handleKeyDown(e, i)}
            aria-label={`${row}행 ${col}열, ${wool ? wool.name : '빈칸'}`}
            className={`aspect-square w-full overflow-hidden focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-gray-900 ${wool ? '' : 'checker'}`}
            style={wool ? { backgroundColor: wool.fallback } : undefined}
          >
            {src && (
              <img
                src={src}
                alt=""
                draggable={false}
                onError={() => onTextureError(id)}
                className="pixelated block size-full"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default PixelGrid
