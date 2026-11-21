/** 결과 없음 화면. 8단계 찜 탭에서도 문구만 바꿔 다시 쓴다 */
function EmptyState({
  title = '조건에 맞는 축제가 없어요',
  description = '기간이나 지역을 바꿔서 다시 찾아보세요.',
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-stone-200/70">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <p className="text-base font-semibold text-stone-800">{title}</p>
      {description && <p className="mt-1 text-sm break-keep text-stone-500">{description}</p>}
    </div>
  )
}

export default EmptyState
