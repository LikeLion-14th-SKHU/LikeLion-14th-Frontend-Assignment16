import { formatPeriod, getPeriodRange } from '../utils/date.js'

const PERIODS = [
  { value: 'weekend', label: '이번 주말' },
  { value: 'thisMonth', label: '이번 달' },
  { value: 'nextMonth', label: '다음 달' },
]

/** [이번 주말]/[이번 달]/[다음 달] 세그먼트 + 선택된 기간의 실제 날짜 */
function PeriodFilter({ value, onChange }) {
  const { start, end } = getPeriodRange(value)

  return (
    <div>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-stone-200/70 p-1" role="group" aria-label="기간">
        {PERIODS.map((period) => {
          const selected = period.value === value
          return (
            <button
              key={period.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(period.value)}
              className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
                selected ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-white/60'
              }`}
            >
              {period.label}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-stone-500">{formatPeriod(start, end)}</p>
    </div>
  )
}

export default PeriodFilter
