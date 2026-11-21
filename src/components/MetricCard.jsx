const icons = {
  humidity: <><path d="M12 2s-7 8.5-7 13a7 7 0 0 0 14 0c0-4.5-7-13-7-13Z"/><path d="M8.5 15a3.5 3.5 0 0 0 3.5 3.5"/></>,
  wind: <><path d="M3 8h12c4 0 4-6 0-6-2 0-3 1-3 2"/><path d="M2 13h17c4 0 4 6 0 6-2 0-3-1-3-2"/><path d="M3 18h7"/></>,
  rain: <><path d="M7 17a5 5 0 1 1 9.6-1.8A4 4 0 1 1 18 23H7a4 4 0 0 1 0-8" transform="translate(0 -4)"/><path d="M9 19v2M15 19v2"/></>,
};

export default function MetricCard({ icon, label, value, description, tone = 'blue' }) {
  const colors = {
    blue: 'bg-[#e9f1ff] text-[#5683cd]',
    sky: 'bg-[#e6f5fc] text-[#5ba6c9]',
    gold: 'bg-[#fff4e5] text-[#d5a15f]',
  };
  return (
    <div className="panel flex items-center gap-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-[16px] ${colors[tone]}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" aria-hidden="true">{icons[icon]}</svg>
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold tracking-[.02em] text-slate-400">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-[25px] font-bold leading-none tracking-tight text-[#24354d]">{value}</p>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}
