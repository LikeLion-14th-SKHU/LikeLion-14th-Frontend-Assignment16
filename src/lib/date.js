// 날짜는 시간을 빼고 "그 날의 0시(로컬)"로만 다뤄요.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// "20260801" → Date. 빈 문자열이나 잘못된 값이면 null
export function parseYmd(value) {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(value ?? '')
  if (!m) return null
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// "07.20(월)" 형식. withYear면 "2026.07.20(월)"
export function formatDate(date, { withYear = false } = {}) {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const text = `${mm}.${dd}(${WEEKDAYS[date.getDay()]})`
  return withYear ? `${date.getFullYear()}.${text}` : text
}

// 시작~끝. 같은 날이면 하루만 보여줘요
export function formatRange(start, end) {
  if (!start) return null
  if (!end || start.getTime() === end.getTime()) return formatDate(start)
  return `${formatDate(start)} ~ ${formatDate(end)}`
}
