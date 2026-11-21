// 날짜는 TourAPI와 같은 "YYYYMMDD" 문자열로 주고받는다.
// 문자열끼리 사전순 비교가 곧 날짜 비교이고, localStorage에도 그대로 저장할 수 있다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const YMD_PATTERN = /^\d{8}$/
const DAY_MS = 24 * 60 * 60 * 1000

/** "20261121" → 해당 날짜 자정의 Date. 형식이 잘못되면 null */
export function parseYmd(ymd) {
  const value = String(ymd ?? '')
  if (!YMD_PATTERN.test(value)) return null
  const date = new Date(
    Number(value.slice(0, 4)),
    Number(value.slice(4, 6)) - 1,
    Number(value.slice(6, 8)),
  )
  return Number.isNaN(date.getTime()) ? null : date
}

/** Date → "YYYYMMDD" */
export function toYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}${m}${d}`
}

/** 날짜에 n일을 더한 새 Date (자정 기준) */
export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** from에서 to까지 며칠인지 (YYYYMMDD 두 개). 형식이 잘못되면 null */
export function diffDays(fromYmd, toYmd_) {
  const from = parseYmd(fromYmd)
  const to = parseYmd(toYmd_)
  if (!from || !to) return null
  // 서머타임 등으로 생기는 시간 오차를 반올림으로 없앤다.
  return Math.round((to - from) / DAY_MS)
}

/**
 * 기간 필터 값 → { start, end } (YYYYMMDD, 양 끝 포함)
 * - weekend: 이번 주 토~일. 오늘이 토·일이면 오늘부터, 평일이면 다가오는 토·일.
 * - thisMonth: 오늘부터 이번 달 말일까지 (이미 끝난 축제는 제외)
 * - nextMonth: 다음 달 1일부터 말일까지
 */
export function getPeriodRange(period, today = new Date()) {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  if (period === 'thisMonth') {
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0)
    return { start: toYmd(base), end: toYmd(lastDay) }
  }

  if (period === 'nextMonth') {
    const firstDay = new Date(base.getFullYear(), base.getMonth() + 1, 1)
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 2, 0)
    return { start: toYmd(firstDay), end: toYmd(lastDay) }
  }

  // weekend (기본값)
  const day = base.getDay()
  if (day === 0) return { start: toYmd(base), end: toYmd(base) } // 일요일: 오늘 하루
  const saturday = addDays(base, 6 - day) // 토요일이면 오늘
  return { start: toYmd(saturday), end: toYmd(addDays(saturday, 1)) }
}

/** 축제 기간({ startDate, endDate })이 range와 하루라도 겹치는지 */
export function overlaps({ startDate, endDate }, { start, end }) {
  if (!startDate || !endDate) return false
  return startDate <= end && endDate >= start
}

function formatDay(date, withYear) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const prefix = withYear ? `${date.getFullYear()}.` : ''
  return `${prefix}${m}.${d}(${WEEKDAYS[date.getDay()]})`
}

/**
 * 기간 표시: "11.21(토) ~ 11.23(월)"
 * 하루짜리면 "11.21(토)", 연도가 다르면 연도를 붙인다. 날짜가 없으면 "".
 */
export function formatPeriod(startYmd, endYmd) {
  const start = parseYmd(startYmd)
  const end = parseYmd(endYmd)
  if (!start && !end) return ''
  if (!start || !end) return formatDay(start ?? end, false)

  const withYear = start.getFullYear() !== end.getFullYear()
  if (startYmd === endYmd) return formatDay(start, false)
  return `${formatDay(start, withYear)} ~ ${formatDay(end, withYear)}`
}
