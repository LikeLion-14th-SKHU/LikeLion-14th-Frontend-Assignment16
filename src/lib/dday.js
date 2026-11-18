// D-day 계산. 모든 날짜는 lib/date.js의 "그 날 0시" Date예요.
import { STEPS } from './schedule.js'

const DAY = 24 * 60 * 60 * 1000

export function daysUntil(date, today) {
  return Math.round((date - today) / DAY)
}

export function ddayText(days) {
  if (days === 0) return 'D-day'
  return days > 0 ? `D-${days}` : `D+${-days}`
}

// 긴급도 배지: D-3 이하 urgent, D-7 이하 soon
export function urgencyOf(days) {
  if (days <= 3) return 'urgent'
  if (days <= 7) return 'soon'
  return null
}

const RANGED = [
  { key: 'reg', name: '접수', startLabel: '접수 시작', endLabel: '접수 마감' },
  { key: 'exam', name: '시험', startLabel: '시험', endLabel: '시험 종료' },
]

// 회차 하나에서 "오늘 기준으로 의미 있는 다음 날짜"들을 뽑아요.
// - 기간(접수·시험)이 진행 중이면 끝나는 날, 아직 안 왔으면 시작하는 날
// - 발표는 그 날
function milestonesOf(round, today) {
  const result = []
  for (const step of STEPS) {
    const data = round[step.key]
    for (const kind of RANGED) {
      for (const p of data[kind.key]) {
        if (p.end < today) continue
        const ongoing = p.start <= today
        result.push({
          round,
          step: step.label,
          kind: kind.key,
          label: `${step.label} ${ongoing ? kind.endLabel : kind.startLabel}`,
          date: ongoing ? p.end : p.start,
          ongoing,
        })
      }
    }
    for (const p of data.pass) {
      if (p.start < today) continue
      result.push({
        round,
        step: step.label,
        kind: 'pass',
        label: `${step.label} 발표`,
        date: p.start,
        ongoing: false,
      })
    }
  }
  return result
}

// 여러 회차 중 가장 가까운 다음 일정. 없으면 null
export function nextMilestone(rounds, today) {
  let best = null
  for (const round of rounds) {
    for (const m of milestonesOf(round, today)) {
      // 같은 날이면 진행 중인 것(마감)을 먼저 보여줘요
      if (!best || m.date < best.date || (m.date.getTime() === best.date.getTime() && m.ongoing)) {
        best = m
      }
    }
  }
  if (!best) return null
  return { ...best, days: daysUntil(best.date, today) }
}

// 접수 중이거나 7일 안에 접수가 시작되는 회차들 (등급 단위)
// roundsByGrade: Map<등급, 회차[]>
export function registrationAlerts(roundsByGrade, today, withinDays = 7) {
  const alerts = []
  for (const [grade, rounds] of roundsByGrade) {
    for (const round of rounds) {
      for (const step of STEPS) {
        for (const p of round[step.key].reg) {
          if (p.end < today) continue
          if (p.start <= today) {
            alerts.push({ grade, round, step: step.label, period: p, open: true, days: daysUntil(p.end, today) })
          } else if (daysUntil(p.start, today) <= withinDays) {
            alerts.push({ grade, round, step: step.label, period: p, open: false, days: daysUntil(p.start, today) })
          }
        }
      }
    }
  }
  // 접수 중(마감 임박 순) → 접수 예정(시작 임박 순)
  return alerts.sort((a, b) => Number(b.open) - Number(a.open) || a.days - b.days)
}
