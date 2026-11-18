import { CloudOff } from 'lucide-react'
import EmptyState from './EmptyState.jsx'

// 일정 API를 쓰는 화면의 공통 로딩·오류 처리.
// status가 'success'일 때만 children을 그려요.
function ScheduleStatus({ status, error, skeleton = 'h-24', children }) {
  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="일정 불러오는 중"
        className={`${skeleton} animate-pulse rounded-2xl bg-canvas`}
      />
    )
  }
  if (status === 'error') {
    return (
      <EmptyState icon={CloudOff} title="일정을 불러오지 못했어요">
        {error?.message}{' '}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="font-medium text-brand-600 underline"
        >
          다시 시도
        </button>
      </EmptyState>
    )
  }
  return children
}

export default ScheduleStatus
