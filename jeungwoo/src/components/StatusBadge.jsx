import { getStatus } from '../utils/status.js'

const STYLES = {
  ongoing: 'bg-orange-500 text-white',
  endingSoon: 'bg-red-500 text-white',
  upcoming: 'bg-white/90 text-stone-800 ring-1 ring-stone-200',
  ended: 'bg-stone-500 text-white',
}

/** 진행 중 / 곧 종료 / D-n 뱃지. 날짜가 잘못되면 아무것도 그리지 않는다 */
function StatusBadge({ startDate, endDate, className = '' }) {
  const status = getStatus(startDate, endDate)
  if (!status) return null

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${STYLES[status.type]} ${className}`}
    >
      {status.label}
    </span>
  )
}

export default StatusBadge
