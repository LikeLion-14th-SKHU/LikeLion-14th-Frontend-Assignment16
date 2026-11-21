import { diffDays, toYmd } from './date.js'

const ENDING_SOON_DAYS = 3

/**
 * 축제 진행 상태 뱃지 정보
 * - upcoming:   시작 전 → "D-n"
 * - endingSoon: 진행 중이고 종료일까지 3일 이내 → "곧 종료"
 * - ongoing:    진행 중 → "진행 중"
 * - ended:      이미 종료 → "종료" (목록에는 보통 나오지 않지만 찜 목록 등에 대비)
 * 날짜가 잘못되면 null을 돌려준다.
 */
export function getStatus(startYmd, endYmd, today = new Date()) {
  const todayYmd = toYmd(today)
  const untilStart = diffDays(todayYmd, startYmd)
  const untilEnd = diffDays(todayYmd, endYmd)
  if (untilStart === null || untilEnd === null) return null

  if (untilStart > 0) return { type: 'upcoming', label: `D-${untilStart}` }
  if (untilEnd < 0) return { type: 'ended', label: '종료' }
  if (untilEnd <= ENDING_SOON_DAYS) return { type: 'endingSoon', label: '곧 종료' }
  return { type: 'ongoing', label: '진행 중' }
}
