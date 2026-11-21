import { CELL_COUNT, createEmptyGrid } from '../data/patterns.js'
import { WOOL_IDS } from '../data/wools.js'

const STORAGE_KEY = 'dot-studio:v1'

// 길이 256, 값은 알려진 양털 ID 또는 null 만 허용
export function isValidGrid(grid) {
  return (
    Array.isArray(grid) &&
    grid.length === CELL_COUNT &&
    grid.every((v) => v === null || WOOL_IDS.includes(v))
  )
}

// 저장값이 없거나 깨졌으면 빈 도안. 어떤 경우에도 예외를 밖으로 던지지 않는다.
export function loadGrid() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyGrid()
    const data = JSON.parse(raw)
    if (data?.version !== 1 || !isValidGrid(data.grid)) return createEmptyGrid()
    return data.grid
  } catch {
    return createEmptyGrid()
  }
}

// 도안 1개만 덮어써서 저장. 성공 여부를 돌려준다.
export function saveGrid(grid) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, grid }))
    return true
  } catch {
    return false
  }
}
