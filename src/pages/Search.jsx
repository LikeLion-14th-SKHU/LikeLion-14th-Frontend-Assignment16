import { Link, useSearchParams } from 'react-router'
import SearchBox from '../components/SearchBox.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FavoriteButton from '../components/FavoriteButton.jsx'
import { certPath, hasSchedule, scheduleLabel, searchCerts } from '../lib/certs.js'

function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const results = searchCerts(q)

  return (
    <div className="space-y-6">
      {/* key로 검색어가 바뀌면 입력창도 새 값으로 다시 그려요 */}
      <SearchBox key={q} defaultValue={q} autoFocus={!q} />

      {!q.trim() ? (
        <EmptyState icon="🔍" title="찾고 싶은 자격증 이름을 입력해 보세요">
          예: 정보처리기사, 전기기사, 산업안전기사
        </EmptyState>
      ) : (
        <section aria-live="polite">
          <h2 className="mb-3 text-sm text-ink-muted">
            <span className="font-semibold text-ink">“{q}”</span> 검색 결과{' '}
            {results.length}건{results.length === 50 && ' (상위 50건)'}
          </h2>

          {results.length === 0 ? (
            <EmptyState icon="🤔" title="검색 결과가 없어요">
              자격증 이름 일부만 입력해 보세요. 예: “정보처리”
            </EmptyState>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {results.map((cert) => (
                <li key={cert.name} className="flex items-center pr-2 transition-colors hover:bg-canvas">
                  <Link
                    to={certPath(cert)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3.5 pr-1 pl-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{cert.name}</span>
                      <span className="text-xs text-ink-muted">
                        {cert.qualgbNm}
                        {cert.grade && ` · ${scheduleLabel(cert)}`}
                      </span>
                    </span>
                    {hasSchedule(cert) ? (
                      <span aria-hidden="true" className="shrink-0 text-ink-muted">
                        ›
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-muted">
                        일정 미제공
                      </span>
                    )}
                  </Link>
                  <FavoriteButton name={cert.name} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}

export default Search
