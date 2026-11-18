import { useState } from 'react'
import { useParams } from 'react-router'
import EmptyState from '../components/EmptyState.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import RoundCard from '../components/RoundCard.jsx'
import NotFound from './NotFound.jsx'
import { useExamSchedule } from '../hooks/useExamSchedule.js'
import { findCert, hasSchedule, scheduleLabel } from '../lib/certs.js'
import { startOfToday } from '../lib/date.js'
import { gradeOf, groupRounds } from '../lib/schedule.js'

function CertDetail() {
  // 주소의 id는 종목명이에요 (src/data/certs.json에서 중복 없음을 확인해요)
  const { id } = useParams()
  const cert = findCert(id)

  if (!cert) return <NotFound />

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">
            {cert.qualgbNm}
            {cert.grade && ` · ${scheduleLabel(cert)}`}
          </p>
          <h1 className="text-2xl font-bold">{cert.name}</h1>
        </div>
        <FavoriteButton name={cert.name} size="lg" />
      </header>

      {hasSchedule(cert) ? (
        <Schedule grade={cert.grade} label={scheduleLabel(cert)} />
      ) : (
        <EmptyState icon="ℹ️" title="이 자격증은 일정 정보를 제공하지 않아요">
          {cert.qualgbNm}은 시험일정 API에서 종목별 일정을 구분할 수 없어요. 시행 기관
          홈페이지에서 확인해 주세요.
        </EmptyState>
      )}
    </div>
  )
}

function Schedule({ grade, label }) {
  const { status, items, error } = useExamSchedule()
  const [showPast, setShowPast] = useState(false)

  if (status === 'loading') {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="일정 불러오는 중">
        {[0, 1].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-canvas" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <EmptyState icon="⚠️" title="일정을 불러오지 못했어요">
        {error.message}{' '}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="font-medium text-brand-600 underline"
        >
          다시 시도
        </button>
      </EmptyState>
    )
  }

  const rounds = groupRounds(items.filter((item) => gradeOf(item) === grade))
  if (rounds.length === 0) {
    return <EmptyState icon="🗓️" title="공고된 일정이 아직 없어요" />
  }

  const today = startOfToday()
  const past = rounds.filter((round) => round.lastDate < today)
  const upcoming = rounds.filter((round) => round.lastDate >= today)

  return (
    <section className="space-y-3" aria-label="회차별 일정">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium" aria-label="범례">
        <span className="rounded-full bg-apply-soft px-2.5 py-1 text-apply">접수</span>
        <span className="rounded-full bg-exam-soft px-2.5 py-1 text-exam">시험</span>
        <span className="rounded-full bg-result-soft px-2.5 py-1 text-result">발표</span>
      </div>

      {upcoming.length === 0 && (
        <EmptyState icon="🗓️" title="남은 일정이 없어요">
          다음 해 일정은 공고되면 여기에 보여요.
        </EmptyState>
      )}
      {upcoming.map((round) => (
        <RoundCard key={round.id} round={round} />
      ))}

      {past.length > 0 && (
        <button
          type="button"
          onClick={() => setShowPast((v) => !v)}
          aria-expanded={showPast}
          className="w-full rounded-xl border border-line py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas"
        >
          {showPast ? '지난 회차 접기' : `지난 회차 ${past.length}개 보기`}
        </button>
      )}
      {showPast && past.map((round) => <RoundCard key={round.id} round={round} isPast />)}

      <p className="text-xs leading-relaxed text-ink-muted">
        {label}으로 공고된 회차 전체예요. 종목에 따라 시행하지 않는 회차가 있을 수
        있으니 접수 전에 Q-Net에서 꼭 확인하세요. 접수 기간이 두 개로 표시된 회차는 공공데이터에
        기간이 두 번 등록된 경우예요.
      </p>
    </section>
  )
}

export default CertDetail
