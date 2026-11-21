import { WOOLS } from '../data/wools.js'

// 색 계산. 사진을 양털 16색으로 바꿀 때 "사람 눈에 가장 비슷한 양털"을 고르기 위해 CIELAB 색 공간에서 거리를 잰다.
// (RGB 숫자 차이로 재면 어두운 색과 채도가 다른 색이 엉뚱하게 짝지어진다)

export const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

const linear = (v) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const labF = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)

export function rgbToLab(r, g, b) {
  const lr = linear(r), lg = linear(g), lb = linear(b)
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb
  const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / 1.08883
  const fx = labF(x), fy = labF(y), fz = labF(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export const labDistance2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2

// 양털 16종의 실제 색 (텍스처 평균색) — wools.js 의 fallback 값
export const WOOL_COLORS = WOOLS.map((w) => {
  const rgb = hexToRgb(w.fallback)
  return { id: w.id, rgb, lab: rgbToLab(...rgb) }
})

export const countColors = (grid) => new Set(grid.filter(Boolean)).size
