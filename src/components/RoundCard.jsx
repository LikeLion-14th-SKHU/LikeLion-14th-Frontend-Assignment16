import { formatRange } from '../lib/date.js'
import { STEPS } from '../lib/schedule.js'

const KINDS = [
  { key: 'reg', label: '접수', badge: 'bg-apply-soft text-apply' },
  { key: 'exam', label: '시험', badge: 'bg-exam-soft text-exam' },
  { key: 'pass', label: '발표', badge: 'bg-result-soft text-result' },
]

// 한 회차의 필기·실기 접수/시험/발표 일정 카드
function RoundCard({ round, isPast }) {
  return (
    <article
      className={`rounded-2xl border border-line p-4 ${isPast ? 'opacity-55' : 'bg-surface'}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">
          {round.year}년 제{round.seq}회
        </h3>
        {isPast && <span className="text-xs text-ink-muted">종료</span>}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((step) => {
          const data = round[step.key]
          const hasAny = KINDS.some((kind) => data[kind.key].length > 0)
          return (
            <section key={step.key}>
              <h4 className="mb-1.5 text-sm font-semibold text-ink-muted">{step.label}</h4>
              {hasAny ? (
                <dl className="space-y-1.5 text-sm">
                  {KINDS.map((kind) =>
                    data[kind.key].length > 0 ? (
                      <div key={kind.key} className="flex items-start gap-2">
                        <dt
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium ${kind.badge}`}
                        >
                          {kind.label}
                        </dt>
                        <dd className="tabular-nums">
                          {data[kind.key].map((p) => (
                            <span key={p.start.getTime()} className="block">
                              {formatRange(p.start, p.end)}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              ) : (
                <p className="text-sm text-ink-muted">일정 없음</p>
              )}
            </section>
          )
        })}
      </div>
    </article>
  )
}

export default RoundCard
