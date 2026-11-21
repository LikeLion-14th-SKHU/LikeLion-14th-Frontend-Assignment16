import { formatPeriod } from '../utils/date.js'
import FestivalImage from './FestivalImage.jsx'
import LikeButton from './LikeButton.jsx'
import StatusBadge from './StatusBadge.jsx'

/** "서울 · 영등포구" 형태의 지역 표시 */
function regionLabel({ region, address }) {
  const district = address.split(' ')[1] ?? ''
  return [region, district].filter(Boolean).join(' · ')
}

/**
 * 축제 카드: 사진·축제명·기간·지역·상태 뱃지
 * 카드 본문은 버튼이고, 찜 버튼은 그 옆(형제)에 올린다 (버튼 안 버튼 방지).
 */
function FestivalCard({ festival, onSelect, liked = false, onToggleLike }) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70">
      <button
        type="button"
        onClick={() => onSelect?.(festival)}
        className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
      >
        <div className="relative">
          <FestivalImage src={festival.image} className="aspect-4/3 w-full" />
          <StatusBadge startDate={festival.startDate} endDate={festival.endDate} className="absolute top-3 left-3" />
        </div>

        <div className="space-y-1 p-4">
          <h3 className="line-clamp-2 text-base leading-snug font-bold break-keep">{festival.title}</h3>
          <p className="text-sm text-stone-600">{formatPeriod(festival.startDate, festival.endDate)}</p>
          <p className="truncate text-sm text-stone-500">{regionLabel(festival)}</p>
        </div>
      </button>
      {onToggleLike && (
        <LikeButton liked={liked} onToggle={() => onToggleLike(festival)} className="absolute top-2.5 right-2.5" />
      )}
    </article>
  )
}

export default FestivalCard
