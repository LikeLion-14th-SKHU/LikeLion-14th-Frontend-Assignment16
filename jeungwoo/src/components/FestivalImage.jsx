import { useState } from 'react'

/** 사진이 없거나 불러오지 못했을 때의 대체 화면 */
function PhotoFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-200 text-stone-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m21 16-5-5-8 8" />
      </svg>
      <span className="text-xs font-medium">사진 없음</span>
    </div>
  )
}

/** 축제 사진. 주소가 없거나 로딩에 실패하면 대체 화면을 보여 준다 */
function FestivalImage({ src, className = '', loading = 'lazy' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = src && failedSrc !== src

  return (
    <div className={`overflow-hidden bg-stone-100 ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt=""
          width="800"
          height="600"
          loading={loading}
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        <PhotoFallback />
      )}
    </div>
  )
}

export default FestivalImage
