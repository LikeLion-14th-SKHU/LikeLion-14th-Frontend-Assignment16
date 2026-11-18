import { STEPS } from './schedule.js'

// "2026-11" ↔ { year, month(0~11) }
export function parseMonth(value, fallback) {
  const m = /^(\d{4})-(\d{2})$/.exec(value ?? '')
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return fallback
  return { year: Number(m[1]), month: Number(m[2]) - 1 }
}

export function formatMonth({ year, month }) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function addMonths({ year, month }, delta) {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// 일요일부터 시작하는 주 단위 날짜 칸 (앞뒤 달 날짜 포함)
export function monthCells({ year, month }) {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())
  const last = new Date(year, month + 1, 0)
  const total = Math.ceil((first.getDay() + last.getDate()) / 7) * 7
  return Array.from(
    { length: total },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  )
}

const KIND_ORDER = { reg: 0, exam: 1, pass: 2 }

// 달력에 찍을 날짜들: 접수 시작·마감, 시험 시작, 발표
// 기간 전체를 칠하면 한 달 내내 칸이 차서, 의미 있는 날만 표시해요.
export function calendarEvents(roundsByGrade, grades) {
  const events = []
  for (const grade of grades) {
    for (const round of roundsByGrade.get(grade) ?? []) {
      for (const step of STEPS) {
        const data = round[step.key]
        for (const p of data.reg) {
          const oneDay = p.start.getTime() === p.end.getTime()
          events.push({ grade, round, step: step.label, kind: 'reg', date: p.start, label: oneDay ? '접수 (하루)' : '접수 시작' })
          if (!oneDay) events.push({ grade, round, step: step.label, kind: 'reg', date: p.end, label: '접수 마감' })
        }
        for (const p of data.exam) {
          events.push({ grade, round, step: step.label, kind: 'exam', date: p.start, label: '시험 시작', end: p.end })
        }
        for (const p of data.pass) {
          events.push({ grade, round, step: step.label, kind: 'pass', date: p.start, label: '발표' })
        }
      }
    }
  }
  events.sort(
    (a, b) =>
      a.date - b.date ||
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      a.grade.localeCompare(b.grade, 'ko') ||
      a.round.seq - b.round.seq,
  )

  const byDay = new Map()
  for (const event of events) {
    const key = dayKey(event.date)
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key).push(event)
  }
  return byDay
}
