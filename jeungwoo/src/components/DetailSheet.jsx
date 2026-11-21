import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchFestivalDetail } from '../api/festivalApi.js'
import { formatPeriod } from '../utils/date.js'
import { kakaoMapUrl, naverMapUrl } from '../utils/mapUrl.js'
import { brToLines, splitListLines } from '../utils/text.js'
import FestivalImage from './FestivalImage.jsx'
import StatusBadge from './StatusBadge.jsx'

const CLOSE_ANIMATION_MS = 200

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3 py-3 text-sm">
      <dt className="font-medium text-stone-500">{label}</dt>
      <dd className="min-w-0 wrap-break-word whitespace-pre-line text-stone-800">{children}</dd>
    </div>
  )
}

function LineSkeleton({ className = '' }) {
  return <div className={`h-4 animate-pulse rounded bg-stone-200 ${className}`} />
}

/**
 * 상세 시트: 카드를 누르면 아래에서 올라온다.
 * 목록에서 받은 요약 정보를 먼저 보여 주고, 상세(소개글·이용요금 등)는 불러와서 채운다.
 * App에서 key={festival.id}로 그려서 축제가 바뀌면 새로 만든다.
 * children: 제목 옆에 놓을 추가 버튼 (8단계 찜 버튼)
 */
function DetailSheet({ festival, onClose, children }) {
  const [visible, setVisible] = useState(false)
  const [detail, setDetail] = useState({ status: 'loading', data: null, error: null })
  const [reloadKey, setReloadKey] = useState(0)
  const closeButtonRef = useRef(null)
  const closeTimerRef = useRef(null)

  // 열릴 때: 다음 프레임에 올라오는 애니메이션 시작, 닫기 버튼에 포커스
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    closeButtonRef.current?.focus()
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(closeTimerRef.current)
    }
  }, [])

  // 열려 있는 동안 뒤 페이지 스크롤 잠금
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const close = useCallback(() => {
    setVisible(false)
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(onClose, CLOSE_ANIMATION_MS)
  }, [onClose])

  // ESC로 닫기
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close])

  // 상세 정보 불러오기
  useEffect(() => {
    let cancelled = false
    fetchFestivalDetail(festival.id)
      .then((data) => {
        if (!cancelled) setDetail({ status: 'success', data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setDetail({ status: 'error', data: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [festival.id, reloadKey])

  function retry() {
    setDetail({ status: 'loading', data: null, error: null })
    setReloadKey((key) => key + 1)
  }

  // 상세가 오면 상세 값을, 아니면 목록 요약 값을 쓴다
  const info = { ...festival, ...(detail.data ?? {}) }
  const isLoading = detail.status === 'loading'
  const overview = brToLines(info.overview)
  const fee = splitListLines(info.fee)
  const titleId = `festival-title-${festival.id}`

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] max-w-3xl flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-200 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="relative shrink-0 pt-3 pb-2">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-stone-300" aria-hidden="true" />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="닫기"
            className="absolute top-2 right-3 flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <div className="relative">
            <FestivalImage src={info.image} loading="eager" className="aspect-video w-full rounded-2xl" />
            <StatusBadge startDate={info.startDate} endDate={info.endDate} className="absolute top-3 left-3" />
          </div>

          <div className="mt-4 flex items-start gap-3">
            <h2 id={titleId} className="flex-1 text-xl leading-snug font-bold break-keep">
              {info.title}
            </h2>
            {children}
          </div>

          <dl className="mt-2 divide-y divide-stone-100">
            <InfoRow label="기간">
              {formatPeriod(info.startDate, info.endDate)}
              {info.playtime && `\n${splitListLines(info.playtime)}`}
            </InfoRow>
            <InfoRow label="장소">
              {[info.place, info.address].filter(Boolean).join('\n') || '정보 없음'}
            </InfoRow>
            <InfoRow label="연락처">
              {info.tel ? (
                <a href={`tel:${info.tel.replace(/[^\d+]/g, '')}`} className="text-orange-600 underline-offset-2 hover:underline">
                  {info.tel}
                </a>
              ) : (
                '정보 없음'
              )}
            </InfoRow>
            <InfoRow label="이용요금">{isLoading ? <LineSkeleton className="w-1/2" /> : fee || '정보 없음'}</InfoRow>
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={kakaoMapUrl(info)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-stone-100 py-3 text-center text-sm font-semibold text-stone-800 hover:bg-stone-200"
            >
              카카오맵으로 열기
            </a>
            <a
              href={naverMapUrl(info)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-stone-100 py-3 text-center text-sm font-semibold text-stone-800 hover:bg-stone-200"
            >
              네이버지도로 열기
            </a>
          </div>

          <section className="mt-6">
            <h3 className="text-base font-bold">소개</h3>
            {isLoading && (
              <div className="mt-3 space-y-2">
                <LineSkeleton />
                <LineSkeleton />
                <LineSkeleton className="w-2/3" />
              </div>
            )}
            {detail.status === 'error' && (
              <div className="mt-3 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">
                <p>{detail.error?.message || '상세 정보를 불러오지 못했어요'}</p>
                <button type="button" onClick={retry} className="mt-2 font-semibold text-orange-600 hover:underline">
                  다시 시도
                </button>
              </div>
            )}
            {detail.status === 'success' && (
              <p className="mt-3 text-sm leading-relaxed break-keep whitespace-pre-line text-stone-700">
                {overview || '소개글이 없어요.'}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default DetailSheet
