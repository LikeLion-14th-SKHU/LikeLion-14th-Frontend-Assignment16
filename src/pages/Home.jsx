import SearchBox from '../components/SearchBox.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Home() {
  return (
    <div className="space-y-8">
      <SearchBox />

      <section aria-labelledby="closing-soon">
        <h2 id="closing-soon" className="mb-3 text-lg font-bold">
          🔥 곧 마감 <span className="text-sm font-medium text-ink-muted">7일 이내</span>
        </h2>
        {/* 3주차: 접수 중·곧 마감 시험 목록 */}
        <EmptyState icon="🗓️" title="곧 마감되는 시험이 여기에 보여요">
          3주차에 연결해요.
        </EmptyState>
      </section>

      <section aria-labelledby="my-dday">
        <h2 id="my-dday" className="mb-3 text-lg font-bold">
          ⭐ 내 자격증 D-day
        </h2>
        {/* 3주차: 관심 자격증 D-day 카드 */}
        <EmptyState icon="⭐" title="아직 담은 자격증이 없어요">
          자격증을 검색해서 ⭐를 눌러 담아 보세요.
        </EmptyState>
      </section>
    </div>
  )
}

export default Home
