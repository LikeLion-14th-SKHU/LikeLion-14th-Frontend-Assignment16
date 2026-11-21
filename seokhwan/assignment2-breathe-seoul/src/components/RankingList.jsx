import GradeBadge from './GradeBadge.jsx'
import { overallGrade } from '../utils/airQuality.js'

// 통합대기환경지수가 낮을수록(공기가 좋을수록) 위로. 지수가 없으면 맨 아래
const byIndex = (a, b) => (a.CAI_IDX ?? Infinity) - (b.CAI_IDX ?? Infinity)

export default function RankingList({ rows, selected, onSelect }) {
  const ranked = [...rows].sort(byIndex)

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">지금 공기 좋은 구 순위</h2>
      <ol className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        {ranked.map((row, i) => (
          <li key={row.MSRSTN_NM}>
            <button
              type="button"
              onClick={() => onSelect(row.MSRSTN_NM)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                row.MSRSTN_NM === selected ? 'bg-sky-50' : ''
              }`}
            >
              <span className="w-6 shrink-0 text-sm font-bold text-slate-400">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">{row.MSRSTN_NM}</span>
                <span className="block text-xs text-slate-400">
                  {row.SAREA_NM} · 미세 {row.PM ?? '-'} · 초미세 {row.FPM ?? '-'}
                </span>
              </span>
              <GradeBadge grade={overallGrade(row)} />
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
