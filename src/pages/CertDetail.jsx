import { useParams } from 'react-router'
import EmptyState from '../components/EmptyState.jsx'

function CertDetail() {
  // id에 무엇을 쓸지(종목 코드 등)는 API 응답 확인 후 정해요
  const { id } = useParams()

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-muted">{id}</p>
        <h1 className="text-2xl font-bold">자격증 상세</h1>
      </header>

      <div className="flex flex-wrap gap-2 text-xs font-medium" aria-label="일정 종류 범례">
        <span className="rounded-full bg-apply-soft px-2.5 py-1 text-apply">접수</span>
        <span className="rounded-full bg-exam-soft px-2.5 py-1 text-exam">시험</span>
        <span className="rounded-full bg-result-soft px-2.5 py-1 text-result">발표</span>
      </div>

      {/* TODO(2주차): API 응답 구조 확인 후 회차별 필기·실기 일정 표 연결 */}
      <EmptyState icon="📄" title="회차별 일정 표는 API 연결 후에 보여요" />
    </div>
  )
}

export default CertDetail
