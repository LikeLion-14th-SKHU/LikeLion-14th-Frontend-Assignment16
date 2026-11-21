import { GRADE_STYLE } from '../utils/airQuality.js'

export default function GradeBadge({ grade }) {
  const style = GRADE_STYLE[grade] ?? GRADE_STYLE.정보없음
  return (
    <span className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
      {GRADE_STYLE[grade] ? grade : '정보없음'}
    </span>
  )
}
