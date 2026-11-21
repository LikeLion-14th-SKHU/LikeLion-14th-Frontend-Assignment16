// TourAPI 응답 → 화면에서 쓰는 모양으로 정리한다.
// 예시 데이터와 실제 /api 응답이 모두 이 함수들을 거친다.

import { getRegionName } from '../constants/regions.js'

/** "", null, 객체 하나, 배열 → 항상 배열 */
export function toArray(value) {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined || value === '') return []
  if (typeof value === 'object') return [value]
  return []
}

function text(value) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

function numberOrNull(value) {
  const n = Number(value)
  return value === '' || value == null || !Number.isFinite(n) || n === 0 ? null : n
}

/** TourAPI 이미지는 http로 오는 경우가 있어 https 배포에서 막히지 않게 바꾼다 */
function secureUrl(url) {
  const value = text(url)
  return value.startsWith('http://') ? `https://${value.slice('http://'.length)}` : value
}

/**
 * TourAPI JSON 응답 본문을 꺼낸다. resultCode가 0000이 아니면 에러를 던진다.
 * @returns {{ items: object[], totalCount: number, pageNo: number, numOfRows: number }}
 */
export function readBody(json) {
  const header = json?.response?.header
  if (!header || header.resultCode !== '0000') {
    throw new Error(header?.resultMsg || '응답 형식이 올바르지 않습니다')
  }
  const body = json.response.body ?? {}
  return {
    // items가 ""이면 items.item이 undefined → toArray가 []로 바꾼다
    items: toArray(body.items?.item),
    totalCount: Number(body.totalCount) || 0,
    pageNo: Number(body.pageNo) || 1,
    numOfRows: Number(body.numOfRows) || 0,
  }
}

/** 목록 카드용 축제 요약 (localStorage에 그대로 저장할 수 있게 문자열·숫자만 쓴다) */
export function normalizeFestival(raw) {
  const address = [text(raw.addr1), text(raw.addr2)].filter(Boolean).join(' ')
  // KorService2는 areacode 대신 법정동 시·도 코드(lDongRegnCd)를 준다
  const areaCode = text(raw.lDongRegnCd) || text(raw.areacode)
  return {
    id: text(raw.contentid),
    title: text(raw.title),
    image: secureUrl(raw.firstimage) || secureUrl(raw.firstimage2),
    startDate: text(raw.eventstartdate),
    endDate: text(raw.eventenddate),
    address,
    areaCode,
    // 지역 코드를 모르면 주소 첫 단어(예: "경기도")로 대신한다
    region: getRegionName(areaCode) || address.split(' ')[0] || '',
    tel: text(raw.tel),
    mapX: numberOrNull(raw.mapx),
    mapY: numberOrNull(raw.mapy),
  }
}

/**
 * 상세 시트용 정보 (detailCommon2 + detailIntro2)
 * overview, fee 등의 <br> 처리는 화면에서 한다 (7단계 utils/text.js).
 */
export function normalizeDetail(common = {}, intro = {}) {
  const base = normalizeFestival({ ...common, ...intro })
  return {
    ...base,
    overview: text(common.overview),
    homepage: text(common.homepage),
    place: text(intro.eventplace),
    playtime: text(intro.playtime),
    fee: text(intro.usetimefestival),
    tel: text(common.tel) || text(intro.sponsor1tel),
  }
}
