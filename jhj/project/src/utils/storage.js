import { GRID_SIZES } from '../data/patterns.js'
import { WOOL_BY_CODE, WOOL_BY_ID, WOOL_IDS } from '../data/wools.js'

// 여러 도안을 계속 저장해 두고 쓰는 '내 도안' 보관함
// localStorage 'dot-studio:v2' = { version: 2, currentId, designs: [{ id, name, size, cells, updatedAt }] }
// cells: 칸 하나를 글자 하나로 ('.' = 빈칸, 'a'~'p' = 양털) → 64×64 도안도 4KB 정도
const STORAGE_KEY = 'dot-studio:v2'
const LEGACY_KEY = 'dot-studio:v1' // 예전 형식 (16×16 도안 1개)

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export const encodeGrid = (grid) => grid.map((id) => (id ? WOOL_BY_ID[id].code : '.')).join('')

// 글자 수가 맞지 않거나 모르는 글자가 있으면 null
export function decodeGrid(cells, size) {
  if (typeof cells !== 'string' || cells.length !== size * size) return null
  const grid = []
  for (const ch of cells) {
    if (ch === '.') grid.push(null)
    else if (WOOL_BY_CODE[ch]) grid.push(WOOL_BY_CODE[ch].id)
    else return null
  }
  return grid
}

function readDesign(raw) {
  if (!raw || typeof raw.id !== 'string' || !GRID_SIZES.includes(raw.size)) return null
  const grid = decodeGrid(raw.cells, raw.size)
  if (!grid) return null
  return {
    id: raw.id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : '이름 없는 도안',
    size: raw.size,
    grid,
    updatedAt: Number(raw.updatedAt) || 0,
  }
}

function readLegacy() {
  const data = JSON.parse(localStorage.getItem(LEGACY_KEY))
  const grid = data?.grid
  if (data?.version !== 1 || !Array.isArray(grid) || grid.length !== 256) return null
  if (!grid.every((v) => v === null || WOOL_IDS.includes(v))) return null
  return { id: newId(), name: '예전에 저장한 도안', size: 16, grid, updatedAt: Date.now() }
}

/**
 * 보관함 불러오기. 어떤 경우에도 예외를 밖으로 던지지 않는다.
 * status: 'restored' | 'none' (저장값 없음) | 'invalid' (깨진 값 → 빈 보관함)
 * 일부 도안만 깨졌으면 그 도안만 빼고 나머지는 살린다.
 */
export function loadLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = readLegacy()
      return legacy
        ? { designs: [legacy], currentId: legacy.id, status: 'restored' }
        : { designs: [], currentId: null, status: 'none' }
    }
    const data = JSON.parse(raw)
    if (data?.version !== 2 || !Array.isArray(data.designs)) {
      return { designs: [], currentId: null, status: 'invalid' }
    }
    const designs = data.designs.map(readDesign).filter(Boolean)
    if (designs.length === 0) return { designs: [], currentId: null, status: 'invalid' }
    const currentId = designs.some((d) => d.id === data.currentId) ? data.currentId : designs[0].id
    return { designs, currentId, status: 'restored' }
  } catch {
    return { designs: [], currentId: null, status: 'invalid' }
  }
}

// 보관함 전체를 저장. 성공 여부를 돌려준다.
export function saveLibrary(designs, currentId) {
  try {
    const data = {
      version: 2,
      currentId,
      designs: designs.map(({ id, name, size, grid, updatedAt }) => ({
        id,
        name,
        size,
        cells: encodeGrid(grid),
        updatedAt,
      })),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
