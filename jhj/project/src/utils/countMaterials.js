// grid → { [woolId]: count }. 빈칸(null)은 세지 않는다.
export function countMaterials(grid) {
  const counts = {}
  for (const id of grid) {
    if (id === null) continue
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}
