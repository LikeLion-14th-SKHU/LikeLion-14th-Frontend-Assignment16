import { useEffect, useRef, useState } from 'react'
import { rowToLayer } from '../data/patterns.js'
import { WOOL_BY_ID } from '../data/wools.js'
import { lineCells } from '../utils/paint.js'

// 큰 그림판 (최대 64×64 = 4,096칸)을 canvas 하나로 그린다.
// - 클릭/드래그: 칠하기 (빠르게 끌어도 칸이 빠지지 않게 직선으로 잇는다)
// - 채우기 도구: 같은 색으로 이어진 영역 한 번에
// - 우클릭 또는 Alt+클릭: 스포이트 (그 칸의 색 고르기)
// - 키보드: 그림판에 포커스 → 방향키 이동, Enter/Space 칠하기, 위치는 스크린리더로 읽어 준다
// - highlightRow: 층별 가이드에서 고른 줄만 또렷하게

const cssVar = (el, name) => getComputedStyle(el).getPropertyValue(name).trim()

function describe(grid, size, i) {
  const row = Math.floor(i / size)
  const col = i % size
  const wool = grid[i] ? WOOL_BY_ID[grid[i]] : null
  return {
    aria: `${row + 1}행 ${col + 1}열, ${wool ? wool.name : '빈칸'}`,
    text: `아래에서 ${rowToLayer(row, size)}층 · 왼쪽에서 ${col + 1}번째 · ${wool ? wool.name : '빈칸'}`,
  }
}

// 굵은 안내선 간격: 작은 그림판은 4칸, 큰 그림판은 8칸마다
const majorStep = (size) => (size <= 16 ? 4 : 8)

function PixelGrid({ grid, size, images, tool, onPaint, onFill, onPick, highlightRow }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const baseRef = useRef(null) // 칸 그림을 미리 그려 둔 캔버스 (호버 때마다 4,096칸을 다시 그리지 않게)
  const strokeRef = useRef(null) // { id, last }
  const strokeCounter = useRef(0)
  const [px, setPx] = useState(0)
  const [hover, setHover] = useState(null)
  const [cursorRaw, setCursor] = useState(0)
  const cursor = Math.min(cursorRaw, size * size - 1) // 작은 도안으로 바꿔도 커서가 밖으로 나가지 않게
  const [focused, setFocused] = useState(false)
  const [announce, setAnnounce] = useState('')

  // 화면 크기에 맞춰 그림판 크기 조정
  useEffect(() => {
    const el = wrapRef.current
    const ro = new ResizeObserver(([entry]) => setPx(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 1) 칸 그림 (grid, 텍스처, 크기가 바뀔 때만)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || px === 0) return
    const dpr = window.devicePixelRatio || 1
    const W = Math.round(px * dpr)
    const base = baseRef.current ?? (baseRef.current = document.createElement('canvas'))
    base.width = W
    base.height = W
    const ctx = base.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const cell = W / size
    const edge = (k) => Math.round(k * cell)
    const checkerA = cssVar(canvas, '--canvas-checker-a')
    const checkerB = cssVar(canvas, '--canvas-checker-b')

    for (let i = 0; i < grid.length; i++) {
      const r = Math.floor(i / size)
      const c = i % size
      const x = edge(c), y = edge(r), w = edge(c + 1) - x, h = edge(r + 1) - y
      const id = grid[i]
      if (id) {
        const img = images[id]
        if (img) ctx.drawImage(img, x, y, w, h)
        else {
          ctx.fillStyle = WOOL_BY_ID[id].fallback
          ctx.fillRect(x, y, w, h)
        }
      } else {
        ctx.fillStyle = checkerA
        ctx.fillRect(x, y, w, h)
        ctx.fillStyle = checkerB
        const hw = Math.ceil(w / 2), hh = Math.ceil(h / 2)
        ctx.fillRect(x, y, hw, hh)
        ctx.fillRect(x + hw, y + hh, w - hw, h - hh)
      }
    }

    // 안내선: 칸이 충분히 크면 가는 선 + 4/8칸마다 굵은 선
    const line = Math.max(1, Math.round(dpr))
    const thinOk = cell / dpr >= 7
    const step = majorStep(size)
    for (let k = 1; k < size; k++) {
      const major = k % step === 0
      if (!major && !thinOk) continue
      ctx.fillStyle = cssVar(canvas, major ? '--canvas-line-strong' : '--canvas-line')
      const p = edge(k) - (major ? line : 0)
      const t = major ? line * 2 : line
      ctx.fillRect(p, 0, t, W)
      ctx.fillRect(0, p, W, t)
    }

    // 층 강조: 고른 줄 말고는 흐리게
    if (highlightRow !== null) {
      ctx.fillStyle = cssVar(canvas, '--canvas-dim')
      ctx.fillRect(0, 0, W, edge(highlightRow))
      ctx.fillRect(0, edge(highlightRow + 1), W, W - edge(highlightRow + 1))
    }
    // 화면 캔버스 크기 맞추기 (아래 2번 effect가 바로 다시 그린다)
    if (canvas.width !== W) {
      canvas.width = W
      canvas.height = W
    }
  }, [grid, size, images, px, highlightRow])

  // 2) 화면 = 칸 그림 + 호버/키보드 커서 표시
  useEffect(() => {
    const canvas = canvasRef.current
    const base = baseRef.current
    if (!canvas || !base || px === 0) return
    const ctx = canvas.getContext('2d')
    ctx.drawImage(base, 0, 0)
    const W = canvas.width
    const cell = W / size
    const mark = (i, thick) => {
      const r = Math.floor(i / size), c = i % size
      const t = Math.max(2, Math.round(thick * (window.devicePixelRatio || 1)))
      const x = Math.round(c * cell), y = Math.round(r * cell)
      const s = Math.round((c + 1) * cell) - x
      ctx.fillStyle = cssVar(canvas, '--canvas-cursor-inner')
      ctx.fillRect(x - t, y - t, s + 2 * t, t)
      ctx.fillRect(x - t, y + s, s + 2 * t, t)
      ctx.fillRect(x - t, y, t, s)
      ctx.fillRect(x + s, y, t, s)
      ctx.fillStyle = cssVar(canvas, '--canvas-cursor')
      ctx.fillRect(x, y, s, t / 2)
      ctx.fillRect(x, y + s - t / 2, s, t / 2)
      ctx.fillRect(x, y, t / 2, s)
      ctx.fillRect(x + s - t / 2, y, t / 2, s)
    }
    if (hover !== null) mark(hover, 1.5)
    if (focused && cursor !== hover) mark(cursor, 2)
  })

  const cellAt = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * size)
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * size)
    if (c < 0 || r < 0 || c >= size || r >= size) return null
    return r * size + c
  }

  const handlePointerDown = (e) => {
    const i = cellAt(e)
    if (i === null) return
    if (e.button === 2 || e.altKey) {
      onPick(grid[i])
      return
    }
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const id = ++strokeCounter.current
    setCursor(i)
    if (tool === 'fill') {
      onFill(i, id)
      return
    }
    strokeRef.current = { id, last: i }
    onPaint([i], id)
  }

  const handlePointerMove = (e) => {
    const i = cellAt(e)
    setHover(i)
    const stroke = strokeRef.current
    if (!stroke || i === null || i === stroke.last) return
    onPaint(lineCells(stroke.last, i, size), stroke.id)
    stroke.last = i
  }

  const endStroke = () => {
    strokeRef.current = null
  }

  const handleKeyDown = (e) => {
    const r = Math.floor(cursor / size), c = cursor % size
    const moves = { ArrowUp: [r - 1, c], ArrowDown: [r + 1, c], ArrowLeft: [r, c - 1], ArrowRight: [r, c + 1] }
    if (moves[e.key]) {
      e.preventDefault()
      const [nr, nc] = moves[e.key]
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) return
      const next = nr * size + nc
      setCursor(next)
      setAnnounce(describe(grid, size, next).aria)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const id = ++strokeCounter.current
      if (tool === 'fill') onFill(cursor, id)
      else onPaint([cursor], id)
    }
  }

  const info = hover !== null ? hover : focused ? cursor : null
  const labels = Array.from({ length: size }, (_, k) => k).filter(
    (k) => k === 0 || (k + 1) % majorStep(size) === 0,
  )

  return (
    <div className="w-full">
      <div className="flex">
        <span className="w-7 shrink-0" />
        {/* 위 눈금: 왼쪽에서 몇 번째 */}
        <div className="relative h-4 flex-1 text-[10px] text-gray-500 tabular-nums" aria-hidden="true">
          {labels.map((k) => (
            <span
              key={k}
              className="absolute -translate-x-1/2"
              style={{ left: `${((k + 0.5) / size) * 100}%` }}
            >
              {k + 1}
            </span>
          ))}
        </div>
      </div>
      <div className="flex">
        {/* 왼쪽 눈금: 아래에서 몇 층 */}
        <div className="relative w-7 shrink-0 text-[10px] text-gray-500 tabular-nums" aria-hidden="true">
          {labels.map((k) => {
            const row = size - 1 - k
            return (
              <span
                key={k}
                className={`absolute right-1.5 -translate-y-1/2 ${highlightRow === row ? 'font-bold text-gray-900' : ''}`}
                style={{ top: `${((row + 0.5) / size) * 100}%` }}
              >
                {k + 1}층
              </span>
            )
          })}
        </div>
        <div ref={wrapRef} className="aspect-square min-w-0 flex-1">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            role="img"
            aria-label={`${size}×${size} 도안 그림판. 방향키로 칸을 옮기고 Enter로 칠합니다. 채우기·지우개는 팔레트에서 고르세요.`}
            aria-describedby="grid-help"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            onPointerLeave={() => setHover(null)}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`block touch-none border border-gray-300 outline-none focus-visible:ring-4 focus-visible:ring-gray-400 ${
              tool === 'fill' ? 'cursor-cell' : 'cursor-crosshair'
            }`}
            style={{ width: px, height: px }}
          />
        </div>
      </div>
      <p id="grid-help" className="mt-2 min-h-5 pl-7 text-sm text-gray-600">
        {info !== null ? describe(grid, size, info).text : '끌면서 칠할 수 있어요 · 우클릭은 스포이트 · Ctrl+Z는 되돌리기'}
      </p>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}

export default PixelGrid
