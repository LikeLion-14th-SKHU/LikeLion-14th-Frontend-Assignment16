import { CITIES } from '../data/cities.js';

export default function CityPicker({ selectedId, onSelect, disabled = false }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf0fa] text-[#4071b5]" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.7"/></svg>
        </span>
        <span className="text-sm font-semibold text-slate-700">도시 선택</span>
      </div>
      <div role="group" aria-label="날씨를 조회할 도시" className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {CITIES.map(city => (
          <button
            key={city.id}
            type="button"
            onClick={() => onSelect(city.id)}
            disabled={disabled && selectedId === city.id}
            aria-pressed={city.id === selectedId}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${city.id === selectedId ? 'bg-[#243c61] text-white shadow-[0_5px_14px_rgba(31,61,107,.18)]' : 'bg-white text-slate-500 ring-1 ring-slate-200/90 hover:bg-[#f0f5fc] hover:text-[#274d81]'}`}
          >{city.name}</button>
        ))}
      </div>
    </div>
  );
}
