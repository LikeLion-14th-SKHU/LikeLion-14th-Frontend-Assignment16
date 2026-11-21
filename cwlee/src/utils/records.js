export function parseTime(value) {
  const input = value.trim()
  if (!/^\d+:(?:[0-5]\d:)?[0-5]\d(?:\.\d{1,3})?$/.test(input)) return null
  const seconds = input.split(':').reduce((total, part) => total * 60 + Number(part), 0)
  return Number.isSafeInteger(Math.round(seconds * 1000)) && seconds > 0 ? seconds : null
}

export function formatTime(seconds) {
  const ms = Math.round(seconds * 1000)
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor(ms / 60000) % 60
  const wholeSeconds = Math.floor(ms / 1000) % 60
  const fraction = ms % 1000
  const clock = hours + ':' + String(minutes).padStart(2, '0') + ':' + String(wholeSeconds).padStart(2, '0')
  return fraction ? clock + '.' + String(fraction).padStart(3, '0') : clock
}

export function recordProgression(runs) {
  const byDay = new Map()
  for (const { date, seconds } of runs) {
    byDay.set(date, Math.min(seconds, byDay.get(date) ?? Infinity))
  }
  let best = Infinity
  const points = []
  for (const date of [...byDay.keys()].sort()) {
    const seconds = byDay.get(date)
    if (seconds < best) {
      best = seconds
      points.push({ date, timestamp: Date.parse(date), seconds })
    }
  }
  return points
}

export function estimatedRank(board, seconds) {
  return 1 + board.runs.filter(({ run }) => {
    const time = run.times[board.timing + '_t']
    return Number.isFinite(time) && time > 0 && time < seconds
  }).length
}
