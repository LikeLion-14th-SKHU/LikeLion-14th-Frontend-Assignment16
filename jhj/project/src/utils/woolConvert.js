// 사진 → 양털 도안 변환 (브라우저 안에서 바로 계산한다)
//
// 왜 직접 계산하나: mc-api 사진 변환(/v1/mapart)은 게임 '지도' 색을 기준으로 색을 고르는데,
// 지도 색은 실제 양털 색과 많이 달라서(예: 하늘색 지도색 #6699d8 ↔ 하늘색 양털 #3AAFD9) 결과가 어긋난다.
// 여기서는 mc-api 텍스처에서 구한 실제 양털 색(wools.js)을 기준으로 맞춘다.
import { WOOL_COLORS, countColors, labDistance2, rgbToLab } from './colors.js'

const clamp = (v) => Math.max(0, Math.min(255, v))

// 1) 사진을 size×size 로 줄인다. 한 번에 확 줄이면 계단·잡티가 생기므로 절반씩 단계적으로 줄인다.
function sample(img, size, fit) {
  const sw = img.naturalWidth
  const sh = img.naturalHeight
  let sx = 0, sy = 0, sW = sw, sH = sh // 원본에서 가져올 영역
  let dx = 0, dy = 0, dW = size, dH = size // 결과에서 차지할 영역
  if (fit === 'crop') {
    const s = Math.min(sw, sh)
    sx = (sw - s) / 2
    sy = (sh - s) / 2
    sW = sH = s
  } else {
    const scale = size / Math.max(sw, sh)
    dW = Math.max(1, Math.round(sw * scale))
    dH = Math.max(1, Math.round(sh * scale))
    dx = Math.floor((size - dW) / 2)
    dy = Math.floor((size - dH) / 2)
  }

  let cur = document.createElement('canvas')
  cur.width = Math.round(sW)
  cur.height = Math.round(sH)
  let ctx = cur.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sW, sH, 0, 0, cur.width, cur.height)
  while (cur.width > dW * 2 || cur.height > dH * 2) {
    const next = document.createElement('canvas')
    next.width = Math.max(dW, Math.ceil(cur.width / 2))
    next.height = Math.max(dH, Math.ceil(cur.height / 2))
    ctx = next.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(cur, 0, 0, next.width, next.height)
    cur = next
  }
  const out = document.createElement('canvas')
  out.width = size
  out.height = size
  ctx = out.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(cur, 0, 0, cur.width, cur.height, dx, dy, dW, dH)
  return ctx.getImageData(0, 0, size, size).data
}

// 2) 자동 밝기 보정: 어둡거나 밝기 범위가 좁은 사진은 대부분 한두 가지 양털로 뭉개진다.
// 밝기 분포의 양 끝 2%를 잘라 내고 0~255 로 펼쳐서 눈·그림자 같은 디테일이 살아나게 한다.
function autoLevels(data) {
  const hist = new Uint32Array(256)
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    hist[Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])]++
    count++
  }
  if (count === 0) return
  const percentile = (p) => {
    let acc = 0
    for (let v = 0; v < 256; v++) {
      acc += hist[v]
      if (acc >= count * p) return v
    }
    return 255
  }
  const lo = percentile(0.02)
  const hi = percentile(0.98)
  if (hi - lo < 16) return // 거의 한 색인 사진은 건드리지 않는다
  const scale = 255 / (hi - lo)
  for (let i = 0; i < data.length; i += 4) {
    for (let k = 0; k < 3; k++) data[i + k] = clamp((data[i + k] - lo) * scale)
  }
}

// 3) 선명하게: 양털은 16색뿐이라 사진을 그대로 맞추면 칙칙해진다. 채도와 대비를 조금 올려 둔다.
function boostPixels(data, { saturation, contrast }) {
  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    for (let k = 0; k < 3; k++) {
      const v = luma + (data[i + k] - luma) * saturation
      data[i + k] = clamp((v - 128) * contrast + 128)
    }
  }
}

// 4) 각 칸을 팔레트에서 눈으로 가장 비슷한 양털로 바꾼다.
// dither 이면 규칙적인 격자 무늬(Bayer)로 두 색을 섞어 중간 색을 흉내 낸다. 무작위 점보다 도트 그림답게 보인다.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]
const DITHER_SPREAD = 44

function quantize(data, size, palette, dither) {
  const out = new Array(size * size).fill(null)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x
      if (data[i * 4 + 3] < 128) continue // 투명한 곳은 빈칸
      const shift = dither ? (BAYER[y % 4][x % 4] / 16 - 0.47) * DITHER_SPREAD : 0
      const lab = rgbToLab(
        clamp(data[i * 4] + shift),
        clamp(data[i * 4 + 1] + shift),
        clamp(data[i * 4 + 2] + shift),
      )
      let best = palette[0]
      let bestD = Infinity
      for (const p of palette) {
        const d = labDistance2(lab, p.lab)
        if (d < bestD) {
          bestD = d
          best = p
        }
      }
      out[i] = best.id
    }
  }
  return out
}

/**
 * img: 불러온 사진(<img>), size: 16/32/48/64
 * options: { fit: 'crop' | 'contain', dither, boost, maxColors }
 * 반환: 길이 size×size 의 grid (양털 ID 또는 null)
 */
export function imageToWool(img, size, { fit = 'crop', dither = false, boost = true, maxColors = 16 } = {}) {
  const data = sample(img, size, fit)
  autoLevels(data)
  if (boost) boostPixels(data, { saturation: 1.25, contrast: 1.1 })

  // 먼저 16색 전부로 맞춰 보고, 색이 maxColors 보다 많으면 많이 쓴 색만 남겨서 그 색들로 다시 맞춘다.
  const first = quantize(data, size, WOOL_COLORS, false)
  let palette = WOOL_COLORS
  if (countColors(first) > maxColors) {
    const counts = {}
    for (const id of first) if (id) counts[id] = (counts[id] ?? 0) + 1
    const keep = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, maxColors)
    palette = WOOL_COLORS.filter((p) => keep.includes(p.id))
  }
  return dither || palette !== WOOL_COLORS ? quantize(data, size, palette, dither) : first
}
