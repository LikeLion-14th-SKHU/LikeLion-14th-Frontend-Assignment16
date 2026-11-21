import { useRef, useState } from 'react'
import { GRID_SIZE, rowToLayer } from '../data/patterns.js'
import { WOOL_BY_ID } from '../data/wools.js'
import WoolSwatch from './WoolSwatch.jsx'

const MOVES = {
  ArrowUp: -GRID_SIZE,
  ArrowDown: GRID_SIZE,
  ArrowLeft: -1,
  ArrowRight: 1,
}

// 4칸마다 진한 안내선 (칸 사이 1px 틈을 그림자로 진하게 칠한다)
const GUIDE = {
  right: 'shadow-[1px_0_0_0_var(--color-gray-500)]',
  bottom: 'shadow-[0_1px_0_0_var(--color-gray-500)]',
  both: 'shadow-[1px_0_0_0_var(--color-gray-500),0_1px_0_0_var(--color-gray-500)]',
}
function guideClass(row, col) {
  const right = col % 4 === 3 && col < GRID_SIZE - 1
  const bottom = row % 4 === 3 && row < GRID_SIZE - 1
  if (right && bottom) return GUIDE.both
  if (right) return GUIDE.right
  if (bottom) return GUIDE.bottom
  return ''
}

const NUMBERS = Array.from({ length: GRID_SIZE }, (_, i) => i)

function describe(i, grid) {
  const row = Math.floor(i / GRID_SIZE)
  const col = i % GRID_SIZE
  const wool = grid[i] ? WOOL_BY_ID[grid[i]] : null
  return `${rowToLayer(row)}층 · 왼쪽에서 ${col + 1}번째 · ${wool ? wool.name : '빈칸'}`
}

// 256개 칸 버튼 + 눈금자(위: 왼쪽에서 몇 번째, 왼쪽: 아래에서 몇 층)
// - 클릭: 칠하기 / 우클릭: 스포이트(그 칸 색 고르기)
// - 키보드: Tab으로 격자에 들어와 방향키로 이동, Enter/Space로 칠하기 (roving tabindex)
// - highlightRow: 층별 가이드에서 고른 줄만 또렷하게
function PixelGrid({ grid, onPaint, onPick, textures, onTextureError, highlightRow }) {
  const [focusIndex, setFocusIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState(null)
  const gridRef = useRef(null)

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
    setHoverIndex(next)
    gridRef.current?.querySelector(`[data-index="${next}"]`)?.focus()
  }

  return (
    <div className="w-full max-w-[36rem]">
      {/* 위 눈금자 */}
      <div className="flex">
        <span className="w-6 shrink-0" />
        <div
          className="grid flex-1 gap-px border-x border-transparent pb-0.5 text-center text-[10px] text-gray-500 tabular-nums"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          aria-hidden="true"
        >
          {NUMBERS.map((c) => (
            <span key={c} className={c % 4 === 0 ? 'font-semibold text-gray-700' : ''}>
              {c + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* 왼쪽 눈금자: 게임에서 쌓는 층 (아래가 1층) */}
        <div
          className="grid w-6 shrink-0 gap-px border-y border-transparent pr-1 text-right text-[10px] text-gray-500 tabular-nums"
          style={{ gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          aria-hidden="true"
        >
          {NUMBERS.map((r) => (
            <span
              key={r}
              className={`flex items-center justify-end ${rowToLayer(r) % 4 === 1 ? 'font-semibold text-gray-700' : ''} ${highlightRow === r ? 'font-bold text-gray-900' : ''}`}
            >
              {rowToLayer(r)}
            </span>
          ))}
        </div>

        <div
          ref={gridRef}
          role="group"
          aria-label="16×16 도안 격자. 방향키로 이동하고 Enter로 칠합니다."
          onMouseLeave={() => setHoverIndex(null)}
          className="grid aspect-square flex-1 gap-px border border-gray-300 bg-gray-300"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {grid.map((id, i) => {
            const wool = id ? WOOL_BY_ID[id] : null
            const row = Math.floor(i / GRID_SIZE)
            const col = i % GRID_SIZE
            const dimmed = highlightRow !== null && highlightRow !== row
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
                onContextMenu={(e) => {
                  e.preventDefault()
                  onPick(id)
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onFocus={() => setHoverIndex(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                aria-label={`${row + 1}행 ${col + 1}열, ${wool ? wool.name : '빈칸'}`}
                className={`aspect-square w-full hover:brightness-110 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-gray-900 ${guideClass(row, col)} ${dimmed ? 'opacity-30' : ''}`}
              >
                <WoolSwatch
                  wool={wool}
                  textures={textures}
                  onTextureError={onTextureError}
                  className="size-full"
                />
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-2 min-h-5 pl-6 text-sm text-gray-600" aria-hidden="true">
        {hoverIndex !== null ? describe(hoverIndex, grid) : '칸에 마우스를 올리면 게임 속 위치가 보여요.'}
      </p>
    </div>
  )
}

export default PixelGrid
