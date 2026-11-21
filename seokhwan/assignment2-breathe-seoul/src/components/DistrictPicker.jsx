export default function DistrictPicker({ rows, selected, onSelect }) {
  return (
    <section aria-label="구 선택">
      <h2 className="text-sm font-semibold text-slate-700">우리 구 고르기</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map((row) => {
          const active = row.MSRSTN_NM === selected
          return (
            <button
              key={row.MSRSTN_NM}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(row.MSRSTN_NM)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                active ? 'bg-slate-900 font-semibold text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
              }`}
            >
              {row.MSRSTN_NM}
            </button>
          )
        })}
      </div>
    </section>
  )
}
