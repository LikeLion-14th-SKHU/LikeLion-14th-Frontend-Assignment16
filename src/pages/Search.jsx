import { Link, useSearchParams } from 'react-router'
import SearchBox from '../components/SearchBox.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CertList from '../components/CertList.jsx'
import { BROWSE_GROUPS, listGroup, searchCerts } from '../lib/certs.js'

function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const browse = listGroup(searchParams.get('grade'))

  return (
    <div className="space-y-6">
      {/* key로 검색어가 바뀌면 입력창도 새 값으로 다시 그려요 */}
      <SearchBox key={q} defaultValue={q} autoFocus={!q && !browse} />

      {q.trim() ? (
        <Results q={q} />
      ) : browse ? (
        <section aria-labelledby="browse-title">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="browse-title" className="text-lg font-bold">
              {browse.group.label}{' '}
              <span className="text-sm font-medium text-ink-muted">{browse.certs.length}개</span>
            </h2>
            <Link to="/search" className="text-sm font-medium text-brand-600">
              ‹ 등급 목록
            </Link>
          </div>
          <CertList certs={browse.certs} />
        </section>
      ) : (
        <section aria-labelledby="browse-groups">
          <h2 id="browse-groups" className="mb-3 text-lg font-bold">
            등급별로 둘러보기
          </h2>
          <ul className="grid grid-cols-2 gap-2">
            {BROWSE_GROUPS.map((group) => (
              <li key={group.id}>
                <Link
                  to={`/search?grade=${encodeURIComponent(group.id)}`}
                  className="flex h-full flex-col rounded-2xl border border-line px-4 py-3 transition-colors hover:border-brand-100 hover:bg-brand-50"
                >
                  <span className="font-semibold">{group.label}</span>
                  <span className="text-sm text-ink-muted">{group.count}개</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Results({ q }) {
  const results = searchCerts(q)
  return (
    <section aria-live="polite">
      <h2 className="mb-3 text-sm text-ink-muted">
        <span className="font-semibold text-ink">“{q}”</span> 검색 결과 {results.length}건
        {results.length === 50 && ' (상위 50건)'}
      </h2>
      {results.length === 0 ? (
        <EmptyState icon="🤔" title="검색 결과가 없어요">
          자격증 이름 일부만 입력해 보세요. 예: “정보처리”
        </EmptyState>
      ) : (
        <CertList certs={results} />
      )}
    </section>
  )
}

export default Search
