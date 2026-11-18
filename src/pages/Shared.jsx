import { ChevronRight, Link2Off, Star } from 'lucide-react'
import { ICON } from '../lib/icons.js'
import { Link, useSearchParams } from 'react-router'
import CertList from '../components/CertList.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useFavorites } from '../hooks/useFavorites.js'
import { parseShared } from '../lib/share.js'

// 공유 링크(/share?c=...)로 들어온 목록
function Shared() {
  const [searchParams] = useSearchParams()
  const certs = parseShared(searchParams.get('c'))
  const { names, addAll } = useFavorites()
  const missing = certs.filter((c) => !names.includes(c.name))

  if (certs.length === 0) {
    return (
      <EmptyState icon={Link2Off} title="공유된 자격증을 찾지 못했어요">
        링크가 잘렸거나 잘못된 것 같아요.{' '}
        <Link to="/" className="font-medium text-brand-600 underline">
          홈으로
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">공유받은 자격증</h1>
        <p className="text-sm text-ink-muted">
          {certs.length}개 중 {certs.length - missing.length}개를 이미 담았어요
        </p>
      </header>

      {missing.length > 0 ? (
        <button
          type="button"
          onClick={() => addAll(missing.map((c) => c.name))}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-surface transition hover:bg-brand-700"
        >
          <Star size={ICON.md} />
          {missing.length}개 모두 담기
        </button>
      ) : (
        <Link
          to="/"
          className="flex h-12 w-full items-center justify-center gap-1 rounded-xl bg-brand-50 font-semibold text-brand-600"
        >
          모두 담았어요 · 홈에서 D-day 보기
          <ChevronRight size={ICON.sm} />
        </Link>
      )}

      <CertList certs={certs} />
    </div>
  )
}

export default Shared
