// 도안을 파일로 내보낸다: 도면 이미지(PNG), 마인크래프트 명령어 파일(.mcfunction), 준비물 글
import { WOOLS, WOOL_BY_ID } from '../data/wools.js'
import { rowToLayer } from '../data/patterns.js'

const FONT = '"Pretendard Variable", Pretendard, system-ui, sans-serif'

export const safeName = (name) => name.replace(/[\\/:*?"<>|]/g, '_').trim() || '도안'

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── .mcfunction (Java Edition 데이터팩 함수) ─────────────────
// 기준점(~ ~ ~)에서 오른쪽(동쪽, +x)으로 열, 위쪽(+y)으로 층을 쌓는 벽.
// 같은 색이 가로로 이어진 구간은 fill 한 줄로 묶어 명령어 수를 줄인다.
export function buildMcfunction(grid, size, name) {
  const lines = [
    `# ${name} — 한 칸 도트 공방`,
    `# 서 있는 자리를 기준으로 오른쪽(동쪽)으로 ${size}칸, 위로 ${size}칸짜리 벽을 만들어요.`,
    `# 남쪽에서 북쪽을 바라보면 그림이 똑바로 보여요. 데이터팩의 function 폴더에 넣고 /function 으로 실행하세요.`,
  ]
  for (let r = 0; r < size; r++) {
    const y = size - 1 - r
    let c = 0
    while (c < size) {
      const id = grid[r * size + c]
      if (!id) {
        c++
        continue
      }
      let end = c
      while (end + 1 < size && grid[r * size + end + 1] === id) end++
      lines.push(
        c === end
          ? `setblock ~${c} ~${y} ~ minecraft:${id}`
          : `fill ~${c} ~${y} ~ ~${end} ~${y} ~ minecraft:${id}`,
      )
      c = end + 1
    }
  }
  return lines.join('\n') + '\n'
}

// ── 준비물 글 (복사용) ──────────────────────────────────
export function materialsText(counts, name) {
  const rows = WOOLS.filter((w) => counts[w.id] > 0)
  const total = rows.reduce((sum, w) => sum + counts[w.id], 0)
  return [`[${name}] 준비물`, ...rows.map((w) => `${w.name} ${counts[w.id]}개`), `합계 ${total}개`].join('\n')
}

// ── 도면 이미지 (PNG) ────────────────────────────────────
// 칸 안의 숫자 = 범례의 양털 번호. 왼쪽 눈금 = 아래에서부터 센 층. 인쇄해서 보며 지을 수 있다.
export function buildBlueprintPng(grid, size, images, counts, name) {
  const cell = Math.max(14, Math.min(30, Math.floor(1100 / size)))
  const left = 46
  const top = 28
  const pad = 24
  const gridPx = cell * size
  const used = WOOLS.map((w, i) => ({ w, n: i + 1 })).filter(({ w }) => counts[w.id] > 0)
  const total = used.reduce((sum, { w }) => sum + counts[w.id], 0)
  const width = Math.max(760, left + gridPx + pad * 2)
  const legendRows = Math.ceil(used.length / 2)
  const headerH = 64
  const height = headerH + top + gridPx + 28 + legendRows * 32 + 52 + pad

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#111827'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `700 22px ${FONT}`
  ctx.fillText(name, pad, pad + 20)
  ctx.font = `400 14px ${FONT}`
  ctx.fillStyle = '#4b5563'
  ctx.fillText(`${size}×${size} · 양털 ${total}개 · 1층(맨 아래)부터 왼쪽 → 오른쪽으로 쌓기`, pad, pad + 44)

  const ox = pad + left
  const oy = headerH + top
  const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return 0.299 * r + 0.587 * g + 0.114 * b
  }
  const indexOf = Object.fromEntries(WOOLS.map((w, i) => [w.id, i + 1]))

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const id = grid[r * size + c]
      const x = ox + c * cell
      const y = oy + r * cell
      if (id) {
        const img = images[id]
        if (img) ctx.drawImage(img, x, y, cell, cell)
        else {
          ctx.fillStyle = WOOL_BY_ID[id].fallback
          ctx.fillRect(x, y, cell, cell)
        }
        if (cell >= 18) {
          ctx.font = `700 ${Math.floor(cell * 0.45)}px ${FONT}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = luminance(WOOL_BY_ID[id].fallback) > 140 ? '#111827' : '#ffffff'
          ctx.fillText(String(indexOf[id]), x + cell / 2, y + cell / 2 + 1)
        }
      } else {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#e5e7eb'
        ctx.fillRect(x, y, cell, cell)
      }
    }
  }

  // 안내선
  const major = size <= 16 ? 4 : 8
  for (let k = 0; k <= size; k++) {
    const strong = k % major === 0
    ctx.fillStyle = strong ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.2)'
    ctx.fillRect(ox + k * cell - (strong ? 1 : 0), oy, strong ? 2 : 1, gridPx)
    ctx.fillRect(ox, oy + k * cell - (strong ? 1 : 0), gridPx, strong ? 2 : 1)
  }

  // 눈금: 위 = 왼쪽에서 몇 번째, 왼쪽 = 아래에서 몇 층
  ctx.fillStyle = '#4b5563'
  ctx.font = `400 ${cell >= 18 ? 12 : 11}px ${FONT}`
  ctx.textBaseline = 'middle'
  for (let k = 0; k < size; k++) {
    if (cell < 18 && (k + 1) % major !== 0 && k !== 0) continue
    ctx.textAlign = 'center'
    ctx.fillText(String(k + 1), ox + k * cell + cell / 2, oy - 12)
    ctx.textAlign = 'right'
    ctx.fillText(`${rowToLayer(k, size)}층`, ox - 8, oy + k * cell + cell / 2)
  }

  // 범례: 번호 · 양털 · 개수
  ctx.textAlign = 'left'
  const colW = (width - pad * 2) / 2
  const ly = oy + gridPx + 28
  used.forEach(({ w, n }, i) => {
    const x = pad + (i % 2) * colW
    const y = ly + Math.floor(i / 2) * 32
    const img = images[w.id]
    if (img) ctx.drawImage(img, x, y, 22, 22)
    else {
      ctx.fillStyle = w.fallback
      ctx.fillRect(x, y, 22, 22)
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.strokeRect(x + 0.5, y + 0.5, 21, 21)
    ctx.fillStyle = '#111827'
    ctx.font = `700 15px ${FONT}`
    ctx.textBaseline = 'middle'
    ctx.fillText(`${n}`, x + 32, y + 12)
    ctx.font = `400 15px ${FONT}`
    ctx.fillText(`${w.name}  ×${counts[w.id]}`, x + 54, y + 12)
  })
  ctx.font = `700 16px ${FONT}`
  ctx.fillStyle = '#111827'
  ctx.fillText(`합계 ${total}개`, pad, ly + legendRows * 32 + 24)

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('도면 이미지를 만들지 못했어요.'))), 'image/png'),
  )
}
