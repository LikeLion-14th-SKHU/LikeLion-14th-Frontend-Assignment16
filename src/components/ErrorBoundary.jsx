import { Component } from 'react'
import EmptyState from './EmptyState.jsx'

// 페이지 렌더링 중 예상치 못한 오류가 나도 헤더와 탭바는 남겨 두고 안내를 보여줘요.
// Layout에서 주소가 바뀔 때마다 key로 초기화해요.
class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <EmptyState icon="😵" title="화면을 그리다 문제가 생겼어요">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-medium text-brand-600 underline"
          >
            새로고침
          </button>
        </EmptyState>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
