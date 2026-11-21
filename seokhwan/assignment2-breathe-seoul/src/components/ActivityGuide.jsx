import { activityGuide, overallGrade } from '../utils/airQuality.js'

const ICON = { 산책: '🚶', 운동: '🏃', 환기: '🪟', 마스크: '😷' }

export default function ActivityGuide({ row }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900">지금 할 수 있는 것</h2>
      <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {activityGuide(overallGrade(row)).map(({ activity, status, text }) => (
          <li key={activity} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              <span aria-hidden="true">{ICON[activity]}</span> {activity}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">{status}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
