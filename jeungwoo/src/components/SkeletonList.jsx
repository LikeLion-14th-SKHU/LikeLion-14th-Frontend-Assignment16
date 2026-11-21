/** 로딩 중 카드 모양 자리표시 (FestivalCard와 같은 크기·격자) */
function SkeletonList({ count = 4 }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">축제 정보를 불러오는 중</span>
      <div className="mb-3 h-5 w-16 animate-pulse rounded bg-stone-200" />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70">
            <div className="aspect-4/3 w-full animate-pulse bg-stone-200" />
            <div className="space-y-2.5 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-stone-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SkeletonList
