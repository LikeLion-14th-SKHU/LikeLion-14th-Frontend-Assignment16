/** 에러 화면 + [다시 시도] */
function ErrorState({ message = '축제 정보를 불러오지 못했어요', onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-stone-200/70"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5" />
          <path d="M12 16.2h.01" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-base font-semibold text-stone-800">{message}</p>
      <p className="mt-1 text-sm text-stone-500">잠시 후 다시 시도해 주세요.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 active:bg-orange-700"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}

export default ErrorState
