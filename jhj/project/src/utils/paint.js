// 칠하기 도구용 계산 (순수 함수)

// 두 칸 사이를 잇는 칸들 (브레젠햄 직선) — 드래그가 빨라도 칸이 빠지지 않게
export function lineCells(from, to, size) {
  let r0 = Math.floor(from / size), c0 = from % size
  const r1 = Math.floor(to / size), c1 = to % size
  const dr = Math.abs(r1 - r0), dc = Math.abs(c1 - c0)
  const sr = r0 < r1 ? 1 : -1, sc = c0 < c1 ? 1 : -1
  let err = dc - dr
  const cells = []
  for (;;) {
    cells.push(r0 * size + c0)
    if (r0 === r1 && c0 === c1) break
    const e2 = 2 * err
    if (e2 > -dr) { err -= dr; c0 += sc }
    if (e2 < dc) { err += dc; r0 += sr }
  }
  return cells
}

// 채우기(페인트 통): start 와 같은 값으로 상하좌우 이어진 칸들
export function floodCells(grid, size, start) {
  const target = grid[start]
  const seen = new Uint8Array(grid.length)
  const stack = [start]
  const cells = []
  seen[start] = 1
  while (stack.length) {
    const i = stack.pop()
    cells.push(i)
    const r = Math.floor(i / size), c = i % size
    const next = []
    if (r > 0) next.push(i - size)
    if (r < size - 1) next.push(i + size)
    if (c > 0) next.push(i - 1)
    if (c < size - 1) next.push(i + 1)
    for (const n of next) {
      if (!seen[n] && grid[n] === target) {
        seen[n] = 1
        stack.push(n)
      }
    }
  }
  return cells
}

// cells 를 value 로 칠한 새 배열. 바뀌는 칸이 없으면 원래 배열을 그대로 돌려준다(상태 변경 없음).
export function applyCells(grid, cells, value) {
  if (cells.every((i) => grid[i] === value)) return grid
  const next = grid.slice()
  for (const i of cells) next[i] = value
  return next
}
