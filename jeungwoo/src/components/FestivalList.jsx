import EmptyState from './EmptyState.jsx'
import ErrorState from './ErrorState.jsx'
import FestivalCard from './FestivalCard.jsx'
import SkeletonList from './SkeletonList.jsx'

function LoadMoreButton({ shown, total, isLoading, error, onClick }) {
  let label = `더 보기 (${shown}/${total})`
  if (isLoading) label = '불러오는 중…'
  else if (error) label = '불러오지 못했어요 · 다시 시도'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="mt-6 w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 active:bg-orange-700 disabled:cursor-wait disabled:bg-orange-300"
    >
      {label}
    </button>
  )
}

/**
 * 축제 카드 목록 (모바일 1열, sm 이상 2열) + [더 보기]
 * 상태별로 스켈레톤 / 에러 + 다시 시도 / 결과 없음 / 목록을 보여 준다.
 */
function FestivalList({
  status,
  error,
  items,
  totalCount,
  hasMore,
  isLoadingMore,
  loadMoreError,
  onLoadMore,
  onRetry,
  onSelect,
  isLiked,
  onToggleLike,
  emptyTitle,
  emptyDescription,
}) {
  if (status === 'loading') return <SkeletonList />
  if (status === 'error') return <ErrorState message={error?.message} onRetry={onRetry} />
  if (items.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />

  return (
    <section aria-label="축제 목록">
      <p className="mb-3 text-sm text-stone-500">
        총 <strong className="font-semibold text-stone-800">{totalCount}</strong>개
      </p>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((festival) => (
          <li key={festival.id}>
            <FestivalCard
              festival={festival}
              onSelect={onSelect}
              liked={isLiked?.(festival.id) ?? false}
              onToggleLike={onToggleLike}
            />
          </li>
        ))}
      </ul>
      {hasMore && (
        <LoadMoreButton
          shown={items.length}
          total={totalCount}
          isLoading={isLoadingMore}
          error={loadMoreError}
          onClick={onLoadMore}
        />
      )}
    </section>
  )
}

export default FestivalList
