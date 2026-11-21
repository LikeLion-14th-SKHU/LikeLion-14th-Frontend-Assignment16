import { REGIONS } from '../constants/regions.js'

/** 전국 + 17개 시·도 선택. 375px에서도 넘치지 않게 select를 쓴다 */
function RegionFilter({ value, onChange }) {
  return (
    <label className="relative block">
      <span className="sr-only">지역</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl bg-white py-2.5 pr-10 pl-4 text-sm font-medium text-stone-800 shadow-sm ring-1 ring-stone-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
      >
        {REGIONS.map((region) => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-stone-400"
        aria-hidden="true"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
      </svg>
    </label>
  )
}

export default RegionFilter
