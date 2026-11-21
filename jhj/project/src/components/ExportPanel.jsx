import { useState } from 'react'
import { buildBlueprintPng, buildMcfunction, downloadBlob, materialsText, safeName } from '../utils/exporters.js'

// 내보내기: 인쇄해서 보며 지을 도면 이미지, 명령어로 한 번에 짓는 .mcfunction, 준비물 글 복사
function ExportPanel({ name, grid, size, images, counts, blockCount, onNotice }) {
  const [busy, setBusy] = useState(false)
  const empty = blockCount === 0

  const savePng = async () => {
    setBusy(true)
    try {
      const blob = await buildBlueprintPng(grid, size, images, counts, name)
      downloadBlob(blob, `${safeName(name)}-도면.png`)
      onNotice('도면 이미지를 저장했어요. 칸 안의 숫자는 범례의 양털 번호예요.')
    } catch (err) {
      onNotice(err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveFunction = () => {
    const blob = new Blob([buildMcfunction(grid, size, name)], { type: 'text/plain;charset=utf-8' })
    // 데이터팩 함수 이름은 영문 소문자·숫자·_ 만 쓸 수 있어서 파일 이름은 고정 규칙으로 만든다
    downloadBlob(blob, `dot_art_${size}x${size}.mcfunction`)
    onNotice('명령어 파일을 저장했어요. (Java Edition 데이터팩의 function 폴더에 넣고 /function 으로 실행)')
  }

  const copyMaterials = async () => {
    try {
      await navigator.clipboard.writeText(materialsText(counts, name))
      onNotice('준비물 목록을 복사했어요.')
    } catch {
      onNotice('복사하지 못했어요. 브라우저의 클립보드 권한을 확인해 주세요.')
    }
  }

  const btn =
    'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-left text-sm text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <section aria-labelledby="export-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="export-title" className="font-semibold text-gray-900">
        내보내기
      </h2>
      <p className="mb-3 text-xs text-gray-500">파일로 저장해서 게임 옆에 두고 지어요.</p>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={savePng} disabled={empty || busy} className={btn}>
          도면 이미지 저장 <span className="text-xs text-gray-500">PNG · 인쇄용</span>
        </button>
        <button type="button" onClick={saveFunction} disabled={empty} className={btn}>
          명령어 파일 저장 <span className="text-xs text-gray-500">.mcfunction · Java</span>
        </button>
        <button type="button" onClick={copyMaterials} disabled={empty} className={btn}>
          준비물 목록 복사 <span className="text-xs text-gray-500">글</span>
        </button>
      </div>
    </section>
  )
}

export default ExportPanel
