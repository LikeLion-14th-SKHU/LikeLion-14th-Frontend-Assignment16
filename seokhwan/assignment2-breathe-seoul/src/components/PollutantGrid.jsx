import GradeBadge from './GradeBadge.jsx'
import { POLLUTANTS, gradeOf } from '../utils/airQuality.js'

export default function PollutantGrid({ row }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">오염물질 상세</h2>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {POLLUTANTS.map((p) => {
          const value = row[p.key]
          return (
            <li key={p.key} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-500">
                  {p.name}
                  <span className="block text-xs text-slate-400">{p.code}</span>
                </p>
                <GradeBadge grade={gradeOf(p, value)} />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {typeof value === 'number' ? value : '-'}
                <span className="ml-1 text-xs font-normal text-slate-400">{p.unit}</span>
              </p>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-xs text-slate-400">등급 기준: 환경부 대기환경기준</p>
    </section>
  )
}
