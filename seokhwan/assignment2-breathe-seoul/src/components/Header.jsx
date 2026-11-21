export default function Header({ measuredAt, loading, onReload }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-widest text-sky-600">BREATHE SEOUL</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">숨쉬는 서울</h1>
        <p className="mt-1 text-sm text-slate-500">
          {measuredAt ? `${measuredAt} 측정 · 서울 구별 실시간 대기질` : '서울 구별 실시간 대기질'}
        </p>
      </div>
      <button
        type="button"
        onClick={onReload}
        disabled={loading}
        className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        {loading ? '불러오는 중…' : '새로고침'}
      </button>
    </header>
  )
}
