const base = 'https://www.speedrun.com/api/v1'

async function request(path, params, signal) {
  const url = new URL(path.startsWith('/') ? base + path : path)
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value))
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error([420, 429].includes(response.status)
      ? '요청이 많습니다. 잠시 후 다시 시도해 주세요.'
      : '기록을 불러오지 못했습니다 (' + response.status + ').')
  }
  return response.json()
}

export async function searchGames(name, signal) {
  return (await request('/games', { name, max: 20 }, signal)).data
}

export async function getGame(gameId, signal) {
  const [game, categories] = await Promise.all([
    request('/games/' + encodeURIComponent(gameId), null, signal),
    request('/games/' + encodeURIComponent(gameId) + '/categories', null, signal),
  ])
  return { game: game.data, categories: categories.data.filter(item => item.type === 'per-game') }
}

export async function getVariables(categoryId, signal) {
  const result = await request('/categories/' + encodeURIComponent(categoryId) + '/variables', null, signal)
  return result.data.filter(item => item['is-subcategory'] &&
    ['global', 'full-game'].includes(item.scope.type) && Object.keys(item.values.values).length)
}

export async function getLeaderboard(game, category, values, top, signal) {
  const params = Object.fromEntries(Object.entries(values).map(([key, value]) => ['var-' + key, value]))
  if (top) Object.assign(params, { top, embed: 'players' })
  const path = '/leaderboards/' + encodeURIComponent(game) + '/category/' + encodeURIComponent(category)
  return (await request(path, params, signal)).data
}

export async function getHistory(game, category, values, timing, signal, onProgress) {
  const runs = new Map()
  let path = '/runs'
  let params = { game, category, status: 'verified', orderby: 'date', direction: 'asc', max: 200 }
  const visited = new Set()
  while (path) {
    if (visited.has(path)) throw new Error('기록 페이지를 계속 조회할 수 없습니다.')
    visited.add(path)
    const page = await request(path, params, signal)
    for (const run of page.data) {
      const seconds = run.times[timing + '_t']
      if (!run.level && run.date && Number.isFinite(seconds) && seconds > 0 &&
          Object.entries(values).every(([key, value]) => run.values?.[key] === value)) {
        runs.set(run.id, { date: run.date, seconds })
      }
    }
    onProgress(visited.size)
    path = page.pagination?.links?.find(link => link.rel === 'next')?.uri
    params = null
  }
  return [...runs.values()]
}
