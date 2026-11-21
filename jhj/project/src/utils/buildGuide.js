import { rowToLayer } from '../data/patterns.js'

// grid → 층별 쌓기 순서. 아래층(1층)부터, 각 층은 왼쪽 → 오른쪽 연속 구간(run)으로 묶는다.
// 예: [{ layer: 1, row: 31, total: 8, runs: [{ id: null, count: 3 }, { id: 'orange_wool', count: 4 }, ...] }]
// 양털이 하나도 없는 층은 건너뛴다.
export function buildGuide(grid, size) {
  const layers = []
  for (let row = size - 1; row >= 0; row--) {
    const cells = grid.slice(row * size, (row + 1) * size)
    const total = cells.filter((v) => v !== null).length
    if (total === 0) continue

    const runs = []
    for (const id of cells) {
      const last = runs.at(-1)
      if (last && last.id === id) last.count += 1
      else runs.push({ id, count: 1 })
    }
    // 오른쪽 끝 빈칸은 놓을 게 없으니 생략
    if (runs.at(-1).id === null) runs.pop()

    layers.push({ layer: rowToLayer(row, size), row, total, runs })
  }
  return layers
}
