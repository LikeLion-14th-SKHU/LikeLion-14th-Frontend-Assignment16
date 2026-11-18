import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import EmptyState from '../components/EmptyState.jsx'
import ScheduleStatus from '../components/ScheduleStatus.jsx'
import { useFavorites } from '../hooks/useFavorites.js'
import { GRADES, useRoundsByGrade } from '../hooks/useRoundsByGrade.js'
import { certPath, findCert, hasSchedule, scheduleLabel } from '../lib/certs.js'
import { addMonths, calendarEvents, dayKey, formatMonth, monthCells, parseMonth } from '../lib/calendar.js'
import { formatDate, formatRange, startOfToday } from '../lib/date.js'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const DOT = { reg: 'bg-apply', exam: 'bg-exam', pass: 'bg-result' }
const BADGE = {
  reg: 'bg-apply-soft text-apply',
  exam: 'bg-exam-soft text-exam',
  pass: 'bg-result-soft text-result',
}

function Calendar() {
  const today = startOfToday()
  const [searchParams, setSearchParams] = useSearchParams()
  const { names } = useFavorites()
  const { status, error, roundsByGrade } = useRoundsByGrade()

  const favorites = names.map(findCert).filter(Boolean).filter(hasSchedule)
  const myGrades = GRADES.filter((g) => favorites.some((c) => c.grade === g))

  const current = parseMonth(searchParams.get('month'), {
    year: today.getFullYear(),
    month: today.getMonth(),
  })
  // 담은 자격증이 있으면 기본으로 "관심"을 보여줘요
  const view = searchParams.get('view') ?? (myGrades.length > 0 ? 'mine' : 'all')
  // 배열은 렌더링마다 새로 만들어져서, 문자열 키로 메모해요
  const gradesKey = (view === 'mine' ? myGrades : GRADES).join(',')
  const byDay = useMemo(
    () => calendarEvents(roundsByGrade, gradesKey ? gradesKey.split(',') : []),
    [roundsByGrade, gradesKey],
  )

  function update(next) {
    const params = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(next)) params.set(k, v)
    setSearchParams(params, { replace: true })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tabular-nums">
          {current.year}년 {current.month + 1}월
        </h1>
        <div className="flex items-center gap-1">
          <NavButton label="이전 달" onClick={() => update({ month: formatMonth(addMonths(current, -1)) })}>
            ‹
          </NavButton>
          <button
            type="button"
            onClick={() => update({ month: formatMonth({ year: today.getFullYear(), month: today.getMonth() }) })}
            className="h-9 rounded-lg border border-line px-3 text-sm font-medium hover:bg-canvas"
          >
            오늘
          </button>
          <NavButton label="다음 달" onClick={() => update({ month: formatMonth(addMonths(current, 1)) })}>
            ›
          </NavButton>
        </div>
      </div>

      <div role="radiogroup" aria-label="보기" className="grid grid-cols-2 rounded-xl bg-canvas p-1 text-sm font-medium">
        {[
          { value: 'mine', label: '⭐ 관심 등급' },
          { value: 'all', label: '전체' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={view === option.value}
            onClick={() => update({ view: option.value })}
            className={`h-9 rounded-lg transition ${
              view === option.value ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Legend />

      <ScheduleStatus status={status} error={error} skeleton="h-80">
        {view === 'mine' && myGrades.length === 0 ? (
          <EmptyState icon="⭐" title="담은 자격증이 없어요">
            <Link to="/search" className="font-medium text-brand-600 underline">
              자격증을 검색
            </Link>
            해서 ⭐를 누르면 그 등급의 일정만 볼 수 있어요.
          </EmptyState>
        ) : (
          // 달이나 보기가 바뀌면 선택한 날짜를 초기화해요
          <MonthView
            key={`${formatMonth(current)}-${view}`}
            current={current}
            today={today}
            byDay={byDay}
            favorites={favorites}
          />
        )}
      </ScheduleStatus>
    </div>
  )
}

function NavButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="size-9 rounded-lg border border-line text-lg leading-none hover:bg-canvas"
    >
      {children}
    </button>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-ink-muted" aria-label="범례">
      {[
        ['reg', '접수 시작·마감'],
        ['exam', '시험 시작'],
        ['pass', '발표'],
      ].map(([kind, label]) => (
        <span key={kind} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-2 rounded-full ${DOT[kind]}`} />
          {label}
        </span>
      ))}
    </div>
  )
}

function MonthView({ current, today, byDay, favorites }) {
  const cells = monthCells(current)
  const inMonth = (d) => d.getMonth() === current.month
  const isTodayInMonth = today.getFullYear() === current.year && today.getMonth() === current.month
  const [selected, setSelected] = useState(isTodayInMonth ? today : new Date(current.year, current.month, 1))
  const selectedEvents = byDay.get(dayKey(selected)) ?? []

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="grid grid-cols-7 border-b border-line bg-canvas text-center text-xs font-medium text-ink-muted">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`py-2 ${i === 0 ? 'text-urgent' : ''}`}>
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date) => {
            const events = byDay.get(dayKey(date)) ?? []
            const kinds = ['reg', 'exam', 'pass'].filter((k) => events.some((e) => e.kind === k))
            const isSelected = dayKey(date) === dayKey(selected)
            const isToday = dayKey(date) === dayKey(today)
            return (
              <button
                key={dayKey(date)}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={isSelected}
                aria-label={`${formatDate(date, { withYear: true })}, 일정 ${events.length}개`}
                className={`flex h-14 flex-col items-center gap-1 border-line pt-1.5 text-sm transition-colors [&:not(:nth-child(7n))]:border-r [&:nth-child(n+8)]:border-t ${
                  isSelected ? 'bg-brand-50' : 'hover:bg-canvas'
                } ${inMonth(date) ? '' : 'text-ink-muted/50'}`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full tabular-nums ${
                    isToday ? 'bg-brand-600 font-bold text-white' : ''
                  }`}
                >
                  {date.getDate()}
                </span>
                <span className="flex gap-0.5" aria-hidden="true">
                  {kinds.map((k) => (
                    <span key={k} className={`size-1.5 rounded-full ${DOT[k]}`} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <section aria-live="polite" aria-labelledby="day-title" className="space-y-2">
        <h2 id="day-title" className="font-bold">
          {formatDate(selected, { withYear: true })}
        </h2>
        {selectedEvents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
            이 날은 표시할 일정이 없어요
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {selectedEvents.map((event, i) => (
              <EventRow key={i} event={event} favorites={favorites} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function EventRow({ event, favorites }) {
  const mine = favorites.filter((c) => c.grade === event.grade)
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${BADGE[event.kind]}`}>
        {event.step} {event.label}
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">
          {scheduleLabel({ grade: event.grade })} · {event.round.year}년 제{event.round.seq}회
        </p>
        {event.end && event.end.getTime() !== event.date.getTime() && (
          <p className="text-ink-muted">시험 기간 {formatRange(event.date, event.end)}</p>
        )}
        {mine.length > 0 ? (
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs">
            <span className="text-ink-muted">⭐ 같은 등급:</span>
            {mine.map((c) => (
              <Link key={c.name} to={certPath(c)} className="font-medium text-brand-600 underline">
                {c.name}
              </Link>
            ))}
          </p>
        ) : (
          <Link
            to={`/search?q=${encodeURIComponent(event.grade)}`}
            className="mt-0.5 inline-block text-xs font-medium text-brand-600 underline"
          >
            이 등급 자격증 찾기
          </Link>
        )}
      </div>
    </li>
  )
}

export default Calendar
