import { useMemo, useState } from 'react'
import Toolbar from './components/Toolbar.jsx'
import PixelGrid from './components/PixelGrid.jsx'
import Palette from './components/Palette.jsx'
import MaterialTable from './components/MaterialTable.jsx'
import { countMaterials } from './utils/countMaterials.js'
import { loadGrid, saveGrid } from './utils/storage.js'
import { useWoolTextures } from './hooks/useWoolTextures.js'

function textureMessage(status, failedCount) {
  if (status === 'loading') return '양털 텍스처를 불러오는 중…'
  if (status === 'error') return '텍스처를 불러오지 못해 단색으로 표시해요.'
  if (failedCount > 0) return '일부 텍스처를 불러오지 못해 단색으로 표시해요.'
  return ''
}

function App() {
  // 앱 시작 시 마지막으로 저장한 도안부터 (없거나 깨졌으면 빈 도안)
  const [grid, setGrid] = useState(loadGrid)
  const [selected, setSelected] = useState('white_wool') // null = 지우개
  const [saveMessage, setSaveMessage] = useState('')
  const { textures, status, failedIds, markFailed } = useWoolTextures()

  // 수량은 state로 두지 않고 grid에서 매번 계산
  const counts = useMemo(() => countMaterials(grid), [grid])

  // 같은 칸에 같은 값이면 상태를 바꾸지 않는다
  const paint = (i) => {
    setGrid((g) => (g[i] === selected ? g : g.map((v, k) => (k === i ? selected : v))))
    setSaveMessage('')
  }

  const selectPattern = (newGrid) => {
    setGrid(newGrid)
    setSaveMessage('')
  }

  const save = () => {
    setSaveMessage(saveGrid(grid) ? '저장 완료' : '저장하지 못했어요. 브라우저 저장소를 확인해 주세요.')
  }

  const message = [saveMessage, textureMessage(status, failedIds.length)].filter(Boolean).join(' · ')

  return (
    <div className="min-h-screen bg-gray-100">
      <Toolbar onSelectPattern={selectPattern} onSave={save} message={message} />
      <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:flex-row md:items-start">
        <div className="flex flex-1 justify-center">
          <PixelGrid grid={grid} onPaint={paint} textures={textures} onTextureError={markFailed} />
        </div>
        <aside className="flex flex-col gap-4 md:w-72">
          <Palette
            selected={selected}
            onSelect={setSelected}
            textures={textures}
            onTextureError={markFailed}
          />
          <MaterialTable counts={counts} textures={textures} onTextureError={markFailed} />
        </aside>
      </main>
    </div>
  )
}

export default App
