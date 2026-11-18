import { ddayText, urgencyOf } from '../lib/dday.js'

const STYLES = {
  urgent: 'bg-urgent-soft text-urgent',
  soon: 'bg-soon-soft text-soon',
  normal: 'bg-brand-50 text-brand-600',
}

// D-3 이하 빨강, D-7 이하 주황, 그 외 남색
function DdayBadge({ days, className = '' }) {
  const style = STYLES[urgencyOf(days) ?? 'normal']
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-sm font-bold tabular-nums ${style} ${className}`}
    >
      {ddayText(days)}
    </span>
  )
}

export default DdayBadge
