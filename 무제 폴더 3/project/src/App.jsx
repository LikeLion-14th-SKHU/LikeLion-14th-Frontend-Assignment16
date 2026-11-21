import { useEffect, useMemo, useState } from 'react'
import Toolbar from './components/Toolbar.jsx'
import PixelGrid from './components/PixelGrid.jsx'
import Palette from './components/Palette.jsx'
import MaterialTable from './components/MaterialTable.jsx'
import BuildGuide from './components/BuildGuide.jsx'
import { countMaterials } from './utils/countMaterials.js'
import { buildGuide } from './utils/buildGuide.js'
import { loadGrid, saveGrid } from './utils/storage.js'
import { useWoolTextures } from './hooks/useWoolTextures.js'

const UNDO_LIMIT = 100

const LOAD_MESSAGES = {
  restored: '마지막으로 저장한 도안을 불러왔어요.',
  invalid: '저장된 도안이 손상되어 빈 도안으로 시작했어요.',
  none: '',
}

function textureMessage(status, failedCount) {
  if (status === 'loading') return '양털 텍스처를 불러오는 중…'
  if (status === 'error') return '텍스처를 불러오지 못해 단색으로 표시해요. 편집은 그대로 할 수 있어요.'
  if (failedCount > 0) return '일부 텍스처를 불러오지 못해 단색으로 표시해요.'
  return ''
}

// 이전 상태를 기록하며 grid를 바꾼다 (되돌리기용)
const withHistory = (doc, grid) => ({
  ...doc,
  grid,
  past: [...doc.past.slice(-(UNDO_LIMIT - 1)), doc.grid],
})

function App() {
  // 앱 시작 시 마지막으로 저장한 도안부터 (없거나 깨졌으면 빈 도안)
  const [initial] = useState(loadGrid)
  const [doc, setDoc] = useState(() => ({
    grid: initial.grid,
    past: [], // 되돌리기 기록
    base: initial.grid, // 마지막으로 저장(또는 불러온) 도안 — 같지 않으면 '저장 안 된 변경'
    patternId: initial.status === 'restored' ? 'saved' : 'empty',
  }))
  const [selected, setSelected] = useState('black_wool') // null = 지우개
  const [highlightRow, setHighlightRow] = useState(null)
  const [notice, setNotice] = useState(LOAD_MESSAGES[initial.status])
  const { textures, status, failedIds, markFailed } = useWoolTextures()

  const { grid } = doc
  const dirty = grid !== doc.base

  // 수량·층별 가이드는 state로 두지 않고 grid에서 매번 계산
  const counts = useMemo(() => countMaterials(grid), [grid])
  const layers = useMemo(() => buildGuide(grid), [grid])

  // 같은 칸에 같은 값이면 상태를 바꾸지 않는다
  const paint = (i) => {
    setDoc((d) =>
      d.grid[i] === selected ? d : withHistory(d, d.grid.map((v, k) => (k === i ? selected : v))),
    )
    setNotice('')
  }

  const undo = () => {
    setDoc((d) => (d.past.length ? { ...d, grid: d.past.at(-1), past: d.past.slice(0, -1) } : d))
    setNotice('')
  }

  // Ctrl+Z / ⌘+Z 되돌리기
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectPattern = (pattern) => {
    if (
      dirty &&
      !window.confirm(
        `저장하지 않은 변경이 있어요.\n'${pattern.name}'(으)로 바꾸면 지금 그림이 바뀌어요.\n(바꾼 뒤에도 '되돌리기'로 돌아올 수 있어요)`,
      )
    ) {
      return
    }
    const next = pattern.create()
    setDoc((d) => ({ ...withHistory(d, next), base: next, patternId: pattern.id }))
    setHighlightRow(null)
    setNotice(`'${pattern.name}'을(를) 불러왔어요.`)
  }

  const save = () => {
    if (saveGrid(grid)) {
      setDoc((d) => ({ ...d, base: d.grid }))
      setNotice('저장 완료 — 다음에 열면 여기서부터 이어서 그려요.')
    } else {
      setNotice('저장하지 못했어요. 브라우저 저장소 설정을 확인해 주세요.')
    }
  }

  const message = [notice, textureMessage(status, failedIds.length)].filter(Boolean).join(' · ')

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Toolbar
        patternId={doc.patternId}
        dirty={dirty}
        canUndo={doc.past.length > 0}
        onSelectPattern={selectPattern}
        onUndo={undo}
        onSave={save}
        message={message}
      />

      {/* 처음 온 사람을 위한 3단계 안내 */}
      <ol className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-1 px-4 pt-4 text-sm text-gray-600">
        <li><strong className="text-gray-900">①</strong> 오른쪽에서 양털 색 고르기</li>
        <li><strong className="text-gray-900">②</strong> 칸 클릭해서 칠하기 (한 칸 = 양털 1개)</li>
        <li><strong className="text-gray-900">③</strong> 준비물 모으고, 층별 가이드대로 1층부터 쌓기</li>
      </ol>

      <main className="mx-auto grid max-w-6xl items-start gap-4 p-4 md:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex justify-center rounded-lg bg-white p-4 shadow-sm md:col-start-1 md:row-start-1">
          <PixelGrid
            grid={grid}
            onPaint={paint}
            onPick={setSelected}
            textures={textures}
            onTextureError={markFailed}
            highlightRow={highlightRow}
          />
        </div>

        <aside className="flex flex-col gap-4 md:col-start-2 md:row-span-2 md:row-start-1">
          <Palette
            selected={selected}
            onSelect={setSelected}
            textures={textures}
            onTextureError={markFailed}
          />
          <MaterialTable counts={counts} textures={textures} onTextureError={markFailed} />
        </aside>

        <div className="md:col-start-1 md:row-start-2">
          <BuildGuide
            grid={grid}
            layers={layers}
            textures={textures}
            onTextureError={markFailed}
            highlightRow={highlightRow}
            onHighlightRow={setHighlightRow}
          />
        </div>
      </main>
    </div>
  )
}

export default App
