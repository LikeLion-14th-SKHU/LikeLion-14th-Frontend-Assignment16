// 화면은 이 파일의 함수만 쓴다.
// 기본은 /api(Vercel 서버리스 함수 → TourAPI)를 호출한다.
// 주소에 ?mock을 붙이면 예시 데이터를, ?mockError를 붙이면 일부러 에러를 낸다.

import { getPeriodRange } from '../utils/date.js'
import { mockFestivalDetail, mockSearchFestival } from './mockFestivals.js'
import { normalizeDetail, normalizeFestival, readBody } from './normalize.js'

export const PAGE_SIZE = 12
const MOCK_DELAY_MS = 600

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hasQuery(name) {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has(name)
}

const isMockMode = () => hasQuery('mock')
const shouldMockFail = () => hasQuery('mockError')

/** /api 호출. 실패하면 화면에 보여 줄 짧은 메시지로 에러를 던지고, 원인은 콘솔에 남긴다 */
async function getJson(path, userMessage) {
  let response
  try {
    response = await fetch(path, { headers: { Accept: 'application/json' } })
  } catch (cause) {
    console.error('[festivalApi] 네트워크 오류', cause)
    throw new Error('네트워크 연결을 확인해 주세요')
  }

  let body = null
  try {
    body = await response.json()
  } catch {
    // vite dev만 켜면 /api가 없어 HTML이 온다 → vercel dev로 실행하거나 ?mock 사용
  }
  if (!response.ok || !body) {
    console.error(`[festivalApi] ${path} → ${response.status}`, body?.error ?? '(JSON 아님: vercel dev로 실행했는지 확인)')
    throw new Error(userMessage)
  }
  return body
}

/**
 * 축제 목록
 * @param {{ period?: 'weekend'|'thisMonth'|'nextMonth', areaCode?: string, page?: number, size?: number }} options
 * @returns {Promise<{ items: object[], totalCount: number }>}
 */
export async function fetchFestivals({ period = 'weekend', areaCode = '', page = 1, size = PAGE_SIZE } = {}) {
  const { start, end } = getPeriodRange(period)
  const errorMessage = '축제 정보를 불러오지 못했어요'

  let json
  if (isMockMode() || shouldMockFail()) {
    await delay(MOCK_DELAY_MS)
    if (shouldMockFail()) throw new Error(errorMessage)
    json = mockSearchFestival({ start, end, areaCode, pageNo: page, numOfRows: size })
  } else {
    const params = new URLSearchParams({ start, end, page: String(page), size: String(size) })
    if (areaCode) params.set('areaCode', areaCode)
    json = await getJson(`/api/festivals?${params}`, errorMessage)
  }

  const { items, totalCount } = readBody(json)
  return { items: items.map(normalizeFestival), totalCount }
}

/** 축제 상세 (기간·주소·연락처·소개글·이용요금) */
export async function fetchFestivalDetail(id) {
  const errorMessage = '상세 정보를 불러오지 못했어요'

  let result
  if (isMockMode() || shouldMockFail()) {
    await delay(MOCK_DELAY_MS)
    if (shouldMockFail()) throw new Error(errorMessage)
    result = mockFestivalDetail(id)
  } else {
    result = await getJson(`/api/festival-detail?id=${encodeURIComponent(id)}`, errorMessage)
  }

  const [commonItem] = readBody(result.common).items
  const [introItem] = readBody(result.intro).items
  if (!commonItem) throw new Error('축제 정보를 찾을 수 없어요')
  return normalizeDetail(commonItem, introItem)
}
