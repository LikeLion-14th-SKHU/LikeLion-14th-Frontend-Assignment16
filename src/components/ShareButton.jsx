import { useState } from 'react'
import { shareUrl } from '../lib/share.js'

// 휴대폰에서는 기본 공유 창을, 그 외에는 클립보드 복사를 써요.
// 둘 다 안 되면 링크를 직접 복사할 수 있게 보여줘요.
function ShareButton({ names }) {
  const [message, setMessage] = useState(null)
  const [fallbackUrl, setFallbackUrl] = useState(null)

  async function handleShare() {
    const url = shareUrl(names)
    setFallbackUrl(null)
    if (navigator.share) {
      try {
        await navigator.share({ title: '내 자격증 D-day 목록', url })
        return
      } catch (error) {
        if (error?.name === 'AbortError') return // 사용자가 공유 창을 닫았어요
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setMessage('링크를 복사했어요')
      setTimeout(() => setMessage(null), 2500)
    } catch {
      setFallbackUrl(url)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
      >
        <span aria-hidden="true">🔗</span> 공유
      </button>
      <p role="status" className="absolute top-full right-0 z-10 mt-1 whitespace-nowrap">
        {message && (
          <span className="rounded-lg bg-ink px-2.5 py-1 text-xs text-surface">{message}</span>
        )}
      </p>
      {fallbackUrl && (
        <label className="absolute top-full right-0 z-10 mt-1 block w-64 rounded-xl border border-line bg-surface p-2 text-xs shadow-lg">
          <span className="mb-1 block text-ink-muted">링크를 길게 눌러 복사하세요</span>
          <input
            readOnly
            value={fallbackUrl}
            onFocus={(event) => event.target.select()}
            className="w-full rounded-md bg-canvas px-2 py-1"
          />
        </label>
      )}
    </div>
  )
}

export default ShareButton
