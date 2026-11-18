import { CalendarCheck, Flame, Star } from 'lucide-react'
import InlineStar from '../components/InlineStar.jsx'
import { ICON } from '../lib/icons.js'
import { useState } from 'react'
import { Link } from 'react-router'
import SearchBox from '../components/SearchBox.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ScheduleStatus from '../components/ScheduleStatus.jsx'
import ShareButton from '../components/ShareButton.jsx'
import DdayBadge from '../components/DdayBadge.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import { useFavorites } from '../hooks/useFavorites.js'
import { useRoundsByGrade } from '../hooks/useRoundsByGrade.js'
import { certPath, findCert, hasSchedule, scheduleLabel } from '../lib/certs.js'
import { formatDate, formatRange, startOfToday } from '../lib/date.js'
import { nextMilestone, registrationAlerts } from '../lib/dday.js'

const KIND_TEXT = { reg: 'text-apply', exam: 'text-exam', pass: 'text-result' }
const ALERT_LIMIT = 5

function Home() {
  const { names } = useFavorites()
  const { status, error, roundsByGrade } = useRoundsByGrade()
  const favorites = names.map(findCert).filter(Boolean)
  const today = startOfToday()

  return (
    <div className="space-y-8">
      <SearchBox />

      <section aria-labelledby="closing-soon">
        <h2 id="closing-soon" className="mb-1 flex items-center gap-1.5 text-lg font-bold">
          <Flame size={ICON.md} className="text-urgent" />
          곧 마감
        </h2>
        <p className="mb-3 text-sm text-ink-muted">지금 접수 중이거나 7일 안에 접수가 시작돼요</p>
        <ScheduleStatus status={status} error={error}>
          <ClosingSoon roundsByGrade={roundsByGrade} today={today} favorites={favorites} />
        </ScheduleStatus>
      </section>

      <section aria-labelledby="my-dday">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 id="my-dday" className="flex items-center gap-1.5 text-lg font-bold">
            <Star size={ICON.md} className="text-brand-600" />
            내 자격증 D-day
          </h2>
          {favorites.length > 0 && <ShareButton names={favorites.map((c) => c.name)} />}
        </div>
        <p className="mb-3 text-sm text-ink-muted">
          등급(기사·기능사 등) 공통 일정 기준이에요. 종목별 시행 여부는 Q-Net에서 확인하세요.
        </p>
        {favorites.length === 0 ? (
          <EmptyState icon={Star} title="아직 담은 자격증이 없어요">
            <Link to="/search" className="font-medium text-brand-600 underline">
              자격증을 검색
            </Link>
            해서 <InlineStar /> 별 버튼을 눌러 담아 보세요.
          </EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {favorites.map((cert) => (
              <li key={cert.name}>
                <DdayCard cert={cert} status={status} roundsByGrade={roundsByGrade} today={today} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ClosingSoon({ roundsByGrade, today, favorites }) {
  const [expanded, setExpanded] = useState(false)
  const myGrades = new Set(favorites.filter(hasSchedule).map((c) => c.grade))
  // 내 자격증과 같은 등급을 먼저 보여줘요 (그 안에서는 기존 순서 유지)
  const alerts = registrationAlerts(roundsByGrade, today).sort(
    (a, b) => Number(myGrades.has(b.grade)) - Number(myGrades.has(a.grade)),
  )

  if (alerts.length === 0) {
    return (
      <EmptyState icon={CalendarCheck} title="지금 챙길 접수 일정이 없어요">
        새 일정이 공고되면 여기에 보여요.
      </EmptyState>
    )
  }

  const visible = expanded ? alerts : alerts.slice(0, ALERT_LIMIT)
  return (
    <div className="space-y-2">
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {visible.map((alert) => {
          const mine = favorites.filter((c) => c.grade === alert.grade)
          return (
            <li
              key={`${alert.round.id}-${alert.step}-${alert.period.start.getTime()}`}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {scheduleLabel({ grade: alert.grade })} · 제{alert.round.seq}회 {alert.step} 접수
                </p>
                <p className="text-sm text-ink-muted">
                  <span className={alert.open ? 'font-medium text-apply' : ''}>
                    {alert.open ? '접수 중' : '접수 예정'}
                  </span>{' '}
                  · {formatRange(alert.period.start, alert.period.end)}
                </p>
                {mine.length > 0 && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-600">
                    <Star size={ICON.xs} className="shrink-0" />
                    <span className="truncate">같은 등급: {mine.map((c) => c.name).join(', ')}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-muted">{alert.open ? '마감' : '시작'}</p>
                <DdayBadge days={alert.days} />
              </div>
            </li>
          )
        })}
      </ul>
      {alerts.length > ALERT_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="w-full rounded-xl border border-line py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas"
        >
          {expanded ? '접기' : `${alerts.length - ALERT_LIMIT}건 더 보기`}
        </button>
      )}
    </div>
  )
}

function DdayCard({ cert, status, roundsByGrade, today }) {
  let body
  if (!hasSchedule(cert)) {
    body = <p className="text-sm text-ink-muted">일정 미제공</p>
  } else if (status === 'loading') {
    body = <div className="h-10 animate-pulse rounded-lg bg-canvas" />
  } else if (status === 'error') {
    body = <p className="text-sm text-ink-muted">일정을 불러오지 못했어요</p>
  } else {
    const next = nextMilestone(roundsByGrade.get(cert.grade) ?? [], today)
    body = next ? (
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${KIND_TEXT[next.kind]}`}>
            {next.label}
            {next.ongoing && <span className="ml-1 font-normal text-ink-muted">(진행 중)</span>}
          </p>
          <p className="text-xs text-ink-muted">
            제{next.round.seq}회 · {formatDate(next.date)}
          </p>
        </div>
        <DdayBadge days={next.days} className="text-base" />
      </div>
    ) : (
      <p className="text-sm text-ink-muted">남은 일정이 없어요. 새 일정 공고를 기다려 주세요.</p>
    )
  }

  return (
    <article className="relative rounded-2xl border border-line p-4 transition-colors hover:border-brand-100 hover:bg-brand-50/40">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="min-w-0 font-bold">
          {/* 카드 전체를 누르면 상세로 가요. 별 버튼은 그 위에 따로 떠 있어요 */}
          <Link to={certPath(cert)} className="after:absolute after:inset-0">
            {cert.name}
          </Link>
        </h3>
        <div className="relative -mt-2 -mr-2">
          <FavoriteButton name={cert.name} />
        </div>
      </div>
      {body}
    </article>
  )
}

export default Home
