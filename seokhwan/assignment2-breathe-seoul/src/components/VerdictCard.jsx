import { GRADE_STYLE, VERDICT, overallGrade } from '../utils/airQuality.js'

export default function VerdictCard({ row }) {
  const grade = overallGrade(row)
  const { title, text } = VERDICT[grade]

  return (
    <section className={`rounded-3xl p-6 text-white sm:p-8 ${GRADE_STYLE[grade].hero}`}>
      <p className="text-sm font-medium opacity-90">
        {row.SAREA_NM} · {row.MSRSTN_NM}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
        <p className="text-5xl font-bold sm:text-6xl">{grade}</p>
        {row.CAI_IDX != null && <p className="pb-1.5 text-sm opacity-90">통합대기환경지수 {row.CAI_IDX}</p>}
      </div>
      <h2 className="mt-5 text-xl font-bold sm:text-2xl">{title}</h2>
      <p className="mt-1 opacity-90">{text}</p>
      {row.CRST_SBSTN && <p className="mt-4 text-xs opacity-80">지수 결정 물질: {row.CRST_SBSTN}</p>}
    </section>
  )
}
