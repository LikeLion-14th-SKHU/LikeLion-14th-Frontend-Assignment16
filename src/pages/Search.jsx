import { useSearchParams } from 'react-router'
import SearchBox from '../components/SearchBox.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  return (
    <div className="space-y-6">
      {/* key로 검색어가 바뀌면 입력창도 새 값으로 다시 그려요 */}
      <SearchBox key={q} defaultValue={q} autoFocus={!q} />

      {q ? (
        <section aria-live="polite">
          <h2 className="mb-3 text-sm text-ink-muted">
            <span className="font-semibold text-ink">“{q}”</span> 검색 결과
          </h2>
          {/* TODO(2주차): API 응답 구조 확인 후 결과 목록 연결 */}
          <EmptyState icon="🔌" title="검색 결과는 API 연결 후에 보여요">
            실제 응답 구조를 확인한 뒤 연결할게요.
          </EmptyState>
        </section>
      ) : (
        <EmptyState icon="🔍" title="찾고 싶은 자격증 이름을 입력해 보세요">
          예: 정보처리기사, 전기기사, 산업안전기사
        </EmptyState>
      )}
    </div>
  )
}

export default Search
