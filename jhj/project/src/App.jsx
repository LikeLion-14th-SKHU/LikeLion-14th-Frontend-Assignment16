import { useEffect, useMemo, useState } from 'react'
import Toolbar from './components/Toolbar.jsx'
import DesignLibrary from './components/DesignLibrary.jsx'
import PixelGrid from './components/PixelGrid.jsx'
import Palette from './components/Palette.jsx'
import MaterialTable from './components/MaterialTable.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import BuildGuide from './components/BuildGuide.jsx'
import Preview3D from './components/Preview3D.jsx'
import NewDesignDialog from './components/NewDesignDialog.jsx'
import PhotoImportDialog from './components/PhotoImportDialog.jsx'
import { DEFAULT_SIZE, EXAMPLES, createEmptyGrid } from './data/patterns.js'
import { countMaterials } from './utils/countMaterials.js'
import { buildGuide } from './utils/buildGuide.js'
import { applyCells, floodCells } from './utils/paint.js'
import { loadLibrary, newId, saveLibrary } from './utils/storage.js'
import { useWoolTextures } from './hooks/useWoolTextures.js'

const UNDO_LIMIT = 100

const LOAD_MESSAGES = {
  restored: '지난번에 그리던 도안을 불러왔어요.',
  invalid: '저장된 도안이 손상되어 새로 시작했어요.',
  none: '펭귄 예시로 시작해요. 마음대로 고치거나 "+ 새 도안"을 눌러 보세요.',
}

function textureMessage(status, failedCount) {
  if (status === 'loading') return '양털 텍스처를 불러오는 중…'
  if (status === 'error') return '텍스처를 불러오지 못해 단색으로 표시해요. 편집은 그대로 할 수 있어요.'
  if (failedCount > 0) return '일부 텍스처를 불러오지 못해 단색으로 표시해요.'
  return ''
}

const makeDesign = ({ name, size, grid }) => ({
  id: newId(),
  name,
  size,
  grid,
  updatedAt: Date.now(),
  done: [], // 제작 체크리스트: 다 놓은 층
})

// 처음 실행: 저장된 보관함 → 없으면 펭귄 예시 하나로 시작
function initStudio() {
  const lib = loadLibrary()
  let { designs, currentId } = lib
  if (designs.length === 0) {
    const penguin = EXAMPLES[0]
    const first = makeDesign({ name: penguin.name, size: penguin.size, grid: penguin.create() })
    designs = [first]
    currentId = first.id
  }
  return { designs, currentId, past: [], stroke: null, loadStatus: lib.status }
}

function App() {
  // studio: 보관함(designs) + 지금 도안 id + 되돌리기 기록(past) + 진행 중인 드래그 번호(stroke)
  const [studio, setStudio] = useState(initStudio)
  const [selected, setSelected] = useState('black_wool') // null = 지우개
  const [tool, setTool] = useState('brush') // 'brush' | 'fill'
  const [highlightRow, setHighlightRow] = useState(null)
  const [dialog, setDialog] = useState(null) // null | 'new' | 'photo'
  const [notice, setNotice] = useState(() => LOAD_MESSAGES[studio.loadStatus])
  const [saveFailed, setSaveFailed] = useState(false)
  const [credits, setCredits] = useState(null)
  const { textures, images, status, failedIds, markFailed } = useWoolTextures()

  const current = studio.designs.find((d) => d.id === studio.currentId)
  const { grid, size } = current

  // 수량·층별 가이드는 state로 두지 않고 grid에서 매번 계산
  const counts = useMemo(() => countMaterials(grid), [grid])
  const layers = useMemo(() => buildGuide(grid, size), [grid, size])
  const blockCount = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts])

  // 자동 저장: 보관함이 바뀌면 잠깐 뒤에 localStorage 에 기록
  useEffect(() => {
    const t = setTimeout(() => setSaveFailed(!saveLibrary(studio.designs, studio.currentId)), 300)
    return () => clearTimeout(t)
  }, [studio.designs, studio.currentId])

  // 지금 도안의 grid 를 바꾼다. 같은 드래그(strokeId) 안에서는 되돌리기 기록을 한 번만 남긴다.
  // 칠한 층은 다시 "아직 안 놓음"으로 돌려 놓는다(그림이 바뀌었으니 다시 확인하도록).
  const changeGrid = (cellsOf, value, strokeId) =>
    setStudio((s) => {
      const d = s.designs.find((x) => x.id === s.currentId)
      const cells = cellsOf(d.grid)
      const next = applyCells(d.grid, cells, value)
      if (next === d.grid) return s // 바뀐 칸이 없으면 상태도 그대로
      const touched = new Set()
      for (const i of cells) if (next[i] !== d.grid[i]) touched.add(d.size - Math.floor(i / d.size))
      const sameStroke = strokeId !== undefined && s.stroke === strokeId
      return {
        ...s,
        designs: s.designs.map((x) =>
          x.id === d.id
            ? { ...x, grid: next, updatedAt: Date.now(), done: x.done.filter((l) => !touched.has(l)) }
            : x,
        ),
        past: sameStroke ? s.past : [...s.past.slice(-(UNDO_LIMIT - 1)), d.grid],
        stroke: strokeId ?? null,
      }
    })

  const paint = (cells, strokeId) => changeGrid(() => cells, selected, strokeId)
  const fill = (start, strokeId) => changeGrid((g) => floodCells(g, size, start), selected, strokeId)

  const undo = () =>
    setStudio((s) => {
      if (!s.past.length) return s
      const prev = s.past.at(-1)
      return {
        ...s,
        designs: s.designs.map((x) => (x.id === s.currentId ? { ...x, grid: prev, updatedAt: Date.now() } : x)),
        past: s.past.slice(0, -1),
        stroke: null,
      }
    })

  // 단축키: Ctrl/⌘+Z 되돌리기, B 붓, F 채우기, E 지우개 (입력칸·대화상자 안에서는 쓰지 않는다)
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, dialog')) return
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const key = e.key.toLowerCase()
      if (key === 'b') setTool('brush')
      else if (key === 'f') setTool('fill')
      else if (key === 'e') {
        setTool('brush')
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── 제작 체크리스트 ──
  const updateCurrent = (fn) =>
    setStudio((s) => ({ ...s, designs: s.designs.map((x) => (x.id === s.currentId ? fn(x) : x)) }))
  const toggleDone = (layer) =>
    updateCurrent((x) => ({
      ...x,
      done: x.done.includes(layer) ? x.done.filter((l) => l !== layer) : [...x.done, layer],
    }))
  const clearDone = () => updateCurrent((x) => ({ ...x, done: [] }))

  // ── 보관함 ──
  const openDesign = (id) => {
    setStudio((s) => (s.currentId === id ? s : { ...s, currentId: id, past: [], stroke: null }))
    setHighlightRow(null)
  }

  const addDesign = (data, message) => {
    const d = makeDesign(data)
    setStudio((s) => ({ ...s, designs: [...s.designs, d], currentId: d.id, past: [], stroke: null }))
    setHighlightRow(null)
    setDialog(null)
    setNotice(message ?? `'${d.name}'을(를) 만들었어요. 그리는 대로 자동 저장돼요.`)
  }

  const renameDesign = (id, name) =>
    setStudio((s) => ({ ...s, designs: s.designs.map((x) => (x.id === id ? { ...x, name } : x)) }))

  const duplicateDesign = (id) => {
    const d = studio.designs.find((x) => x.id === id)
    addDesign({ name: `${d.name} 복사본`, size: d.size, grid: d.grid }, `'${d.name}'을(를) 복제했어요.`)
  }

  const deleteDesign = (id) => {
    setStudio((s) => {
      let designs = s.designs.filter((x) => x.id !== id)
      if (designs.length === 0) {
        designs = [makeDesign({ name: '새 도안', size: DEFAULT_SIZE, grid: createEmptyGrid(DEFAULT_SIZE) })]
      }
      const currentId = s.currentId === id ? designs[0].id : s.currentId
      return { ...s, designs, currentId, past: s.currentId === id ? [] : s.past, stroke: null }
    })
    setHighlightRow(null)
    setNotice('도안을 삭제했어요.')
  }

  const message = [
    saveFailed ? '저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.' : notice,
    textureMessage(status, failedIds.length),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Toolbar
        canUndo={studio.past.length > 0}
        onNew={() => setDialog('new')}
        onPhoto={() => setDialog('photo')}
        onUndo={undo}
        message={message}
        credits={credits}
      />

      <DesignLibrary
        designs={studio.designs}
        currentId={studio.currentId}
        onOpen={openDesign}
        onRename={renameDesign}
        onDuplicate={duplicateDesign}
        onDelete={deleteDesign}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-start gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section
          aria-label={`그림판: ${current.name}`}
          className="rounded-lg bg-white p-3 shadow-sm sm:p-4 lg:col-start-1 lg:row-start-1"
        >
          <div className="mb-2 flex items-baseline gap-2 pl-9">
            <h2 className="truncate font-semibold">{current.name}</h2>
            <span className="text-sm text-gray-500">
              {size}×{size} · 양털 {blockCount}개
            </span>
          </div>
          <PixelGrid
            grid={grid}
            size={size}
            images={images}
            tool={tool}
            selected={selected}
            onPaint={paint}
            onFill={fill}
            onPick={(id) => {
              setSelected(id)
              setTool('brush')
            }}
            highlightRow={highlightRow}
          />
        </section>

        <aside className="flex flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Palette
            selected={selected}
            onSelect={setSelected}
            tool={tool}
            onTool={setTool}
            textures={textures}
            onTextureError={markFailed}
          />
          <MaterialTable counts={counts} textures={textures} onTextureError={markFailed} />
          <ExportPanel
            name={current.name}
            grid={grid}
            size={size}
            images={images}
            counts={counts}
            blockCount={blockCount}
            onNotice={setNotice}
          />
          <Preview3D grid={grid} size={size} blockCount={blockCount} onCredits={setCredits} />
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">
          <BuildGuide
            layers={layers}
            done={current.done}
            onToggleDone={toggleDone}
            onClearDone={clearDone}
            textures={textures}
            onTextureError={markFailed}
            highlightRow={highlightRow}
            onHighlightRow={setHighlightRow}
          />
        </div>
      </main>

      <NewDesignDialog open={dialog === 'new'} onClose={() => setDialog(null)} onCreate={(d) => addDesign(d)} />
      <PhotoImportDialog
        open={dialog === 'photo'}
        onClose={() => setDialog(null)}
        onCreate={(d) => addDesign(d, `사진으로 '${d.name}' 도안을 만들었어요.`)}
      />
    </div>
  )
}

export default App
