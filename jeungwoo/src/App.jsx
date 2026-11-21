import { useCallback, useState } from 'react'
import DetailSheet from './components/DetailSheet.jsx'
import FestivalList from './components/FestivalList.jsx'
import LikeButton from './components/LikeButton.jsx'
import PeriodFilter from './components/PeriodFilter.jsx'
import RegionFilter from './components/RegionFilter.jsx'
import TabBar from './components/TabBar.jsx'
import { useFestivals } from './hooks/useFestivals.js'
import { useLikes } from './hooks/useLikes.js'

function App() {
  const [tab, setTab] = useState('all')
  const [period, setPeriod] = useState('weekend')
  const [areaCode, setAreaCode] = useState('')
  const festivals = useFestivals({ period, areaCode })
  const { likes, isLiked, toggleLike } = useLikes()
  const [selected, setSelected] = useState(null)
  const closeDetail = useCallback(() => setSelected(null), [])

  const listProps =
    tab === 'all'
      ? {
          status: festivals.status,
          error: festivals.error,
          items: festivals.items,
          totalCount: festivals.totalCount,
          hasMore: festivals.hasMore,
          isLoadingMore: festivals.isLoadingMore,
          loadMoreError: festivals.loadMoreError,
          onLoadMore: festivals.loadMore,
          onRetry: festivals.retry,
        }
      : {
          status: 'success',
          items: likes,
          totalCount: likes.length,
          hasMore: false,
          emptyTitle: '아직 찜한 축제가 없어요',
          emptyDescription: '마음에 드는 축제의 하트를 눌러 모아 보세요.',
        }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-16">
      <header className="pt-8 pb-4">
        <h1 className="text-2xl font-bold">
          <span className="text-orange-500">주말</span>축제
        </h1>
        <p className="mt-1 text-sm text-stone-500">이번 주말 뭐 하지?</p>
      </header>

      <div className="sticky top-0 z-10 -mx-4 mb-4 space-y-3 bg-stone-50/95 px-4 pt-2 pb-3 backdrop-blur">
        <TabBar value={tab} onChange={setTab} likeCount={likes.length} />
        {tab === 'all' && (
          <>
            <PeriodFilter value={period} onChange={setPeriod} />
            <RegionFilter value={areaCode} onChange={setAreaCode} />
          </>
        )}
      </div>

      <main>
        <FestivalList {...listProps} onSelect={setSelected} isLiked={isLiked} onToggleLike={toggleLike} />
      </main>

      {selected && (
        <DetailSheet key={selected.id} festival={selected} onClose={closeDetail}>
          <LikeButton liked={isLiked(selected.id)} onToggle={() => toggleLike(selected)} />
        </DetailSheet>
      )}
    </div>
  )
}

export default App
