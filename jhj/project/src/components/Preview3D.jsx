import { useEffect, useState } from 'react'
import { VIEWS, estimateRenderCredits, renderBuild } from '../api/mcApi.js'

// mc-api 3D 렌더로 "게임에 지으면 이렇게 보인다"를 미리 본다.
// 렌더는 크레딧이 드니까 버튼을 눌렀을 때만 호출한다.
function Preview3D({ grid, size, blockCount, onCredits }) {
  const [view, setView] = useState('angled')
  const [state, setState] = useState({ status: 'idle' }) // idle | loading | done | error
  const [renderedFor, setRenderedFor] = useState(null) // 어떤 grid·각도로 렌더했는지

  // 이전 이미지 URL 정리
  useEffect(() => {
    const url = state.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [state.url])

  const render = async () => {
    setState((s) => ({ ...s, status: 'loading' }))
    try {
      const { url, credits } = await renderBuild(grid, size, view)
      setState({ status: 'done', url })
      setRenderedFor({ grid, view })
      onCredits(credits)
    } catch (err) {
      setState((s) => ({ ...s, status: 'error', error: err.message }))
    }
  }

  const stale = state.url && (renderedFor?.grid !== grid || renderedFor?.view !== view)

  return (
    <section aria-labelledby="preview-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="preview-title" className="font-semibold text-gray-900">
        게임 속 3D 미리보기
      </h2>
      <p className="mb-3 text-xs text-gray-500">mc-api가 실제 블록으로 렌더링해요.</p>

      <div className="mb-2 flex flex-wrap gap-1" role="group" aria-label="보는 각도">
        {Object.entries(VIEWS).map(([key, v]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            aria-pressed={view === key}
            className={`rounded-md border-2 px-2 py-0.5 text-xs ${
              view === key ? 'border-gray-900 font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="relative mb-2 aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {state.url ? (
          <img
            src={state.url}
            alt="도안을 마인크래프트 블록으로 쌓은 3D 렌더"
            className={`size-full object-contain ${stale ? 'opacity-50' : ''}`}
          />
        ) : (
          <p className="flex size-full items-center justify-center p-4 text-center text-xs text-gray-500">
            {blockCount === 0 ? '칸을 칠하면 렌더링할 수 있어요.' : '아래 버튼을 누르면 렌더링해요.'}
          </p>
        )}
        {state.status === 'loading' && (
          <p className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-gray-700">
            렌더링 중…
          </p>
        )}
      </div>

      {stale && state.status !== 'loading' && (
        <p className="mb-2 text-xs text-gray-600">도안이나 각도가 바뀌었어요. 다시 렌더링해 보세요.</p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="mb-2 text-xs text-gray-700">
          {state.error}
        </p>
      )}

      <button
        type="button"
        onClick={render}
        disabled={blockCount === 0 || state.status === 'loading'}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state.url ? '다시 렌더링' : '3D로 렌더링'}
        {blockCount > 0 && (
          <span className="ml-1 text-xs font-normal text-gray-500">(약 {estimateRenderCredits(blockCount)} 크레딧)</span>
        )}
      </button>
    </section>
  )
}

export default Preview3D
