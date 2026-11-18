import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import EmptyState from '../components/EmptyState.jsx'

function NotFound() {
  return (
    <EmptyState icon={Compass} title="페이지를 찾을 수 없어요">
      <Link to="/" className="font-medium text-brand-600 underline">
        홈으로 돌아가기
      </Link>
    </EmptyState>
  )
}

export default NotFound
