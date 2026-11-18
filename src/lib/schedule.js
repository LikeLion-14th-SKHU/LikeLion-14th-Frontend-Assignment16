import { parseYmd } from './date.js'

// API item의 description 예: "국가기술자격 기사 (2026년도 제3회)"
const GRADE_PATTERN = /^국가기술자격 (기술사|기능장|기사|기능사) \(/

export function gradeOf(item) {
  return GRADE_PATTERN.exec(item.description ?? '')?.[1] ?? null
}

function period(startYmd, endYmd) {
  const start = parseYmd(startYmd)
  if (!start) return null
  return { start, end: parseYmd(endYmd) ?? start }
}

const samePeriod = (a, b) =>
  a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime()

function addUnique(list, value) {
  if (value && !list.some((p) => samePeriod(p, value))) list.push(value)
}

// 단계(필기·실기)별 접수·시험·발표 키
export const STEPS = [
  {
    key: 'written',
    label: '필기',
    reg: ['docRegStartDt', 'docRegEndDt'],
    exam: ['docExamStartDt', 'docExamEndDt'],
    pass: 'docPassDt',
  },
  {
    key: 'practical',
    label: '실기',
    reg: ['pracRegStartDt', 'pracRegEndDt'],
    exam: ['pracExamStartDt', 'pracExamEndDt'],
    pass: 'pracPassDt',
  },
]

// 필기 접수 기간을 뺀 나머지 날짜들. 이게 모두 같은 행만 한 회차로 합쳐요.
const ROUND_KEY_FIELDS = [
  'docExamStartDt',
  'docExamEndDt',
  'docPassDt',
  'pracRegStartDt',
  'pracRegEndDt',
  'pracExamStartDt',
  'pracExamEndDt',
  'pracPassDt',
]

// 한 등급의 item들을 회차별로 묶어요.
// - 정기시험은 같은 회차가 필기 접수 기간만 다른 행으로 두 번 와요 → 하나로 합치고 접수 기간을 모아요.
// - 기능사는 같은 회차 번호에 시험일이 다른 일정도 있어요 → 회차 번호만으로는 합치지 않아요.
export function groupRounds(items) {
  const rounds = new Map()
  for (const item of items) {
    const id = [item.implYy, item.implSeq, ...ROUND_KEY_FIELDS.map((k) => item[k])].join('-')
    if (!rounds.has(id)) {
      rounds.set(id, {
        id,
        year: Number(item.implYy),
        seq: Number(item.implSeq),
        written: { reg: [], exam: [], pass: [] },
        practical: { reg: [], exam: [], pass: [] },
      })
    }
    const round = rounds.get(id)
    for (const step of STEPS) {
      const target = round[step.key]
      addUnique(target.reg, period(...step.reg.map((k) => item[k])))
      addUnique(target.exam, period(...step.exam.map((k) => item[k])))
      addUnique(target.pass, period(item[step.pass], item[step.pass]))
    }
  }

  const list = [...rounds.values()]
  for (const round of list) {
    for (const step of STEPS) {
      for (const periods of Object.values(round[step.key])) {
        periods.sort((a, b) => a.start - b.start)
      }
    }
    const periods = allPeriods(round)
    round.firstDate = periods.reduce((min, p) => (!min || p.start < min ? p.start : min), null)
    round.lastDate = periods.reduce((max, p) => (!max || p.end > max ? p.end : max), null)
  }
  // 날짜순(첫 일정 기준)으로 정렬해요
  return list.sort((a, b) => a.firstDate - b.firstDate || a.seq - b.seq)
}

function allPeriods(round) {
  return STEPS.flatMap((step) => Object.values(round[step.key]).flat())
}
