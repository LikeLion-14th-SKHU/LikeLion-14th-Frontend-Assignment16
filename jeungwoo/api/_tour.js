// TourAPI(KorService2) 공통 호출 헬퍼. 인증키는 서버에서만 쓴다.
// 파일 이름이 _로 시작하면 Vercel이 엔드포인트로 만들지 않는다.

const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2'
const TIMEOUT_MS = 8000

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/**
 * 공공데이터포털은 "인코딩 키"와 "디코딩 키"를 함께 준다.
 * 어느 쪽을 넣어도 동작하도록 한 번 디코딩한 뒤 URLSearchParams가 다시 인코딩하게 한다.
 */
function getServiceKey() {
  const raw = process.env.TOUR_API_KEY
  if (!raw) throw new HttpError(500, '서버에 TOUR_API_KEY가 설정되지 않았습니다')
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** TourAPI 호출 → JSON. 실패(XML 에러 응답, resultCode≠0000, 타임아웃)는 HttpError(502)로 */
export async function callTour(operation, params = {}) {
  const url = new URL(`${BASE_URL}/${operation}`)
  url.search = new URLSearchParams({
    serviceKey: getServiceKey(),
    MobileOS: 'ETC',
    MobileApp: 'WeekendFest',
    _type: 'json',
    ...params,
  }).toString()

  let response
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch {
    throw new HttpError(504, 'TourAPI 응답이 없습니다')
  }

  const body = await response.text()
  let json
  try {
    json = JSON.parse(body)
  } catch {
    // 인증키 오류 등은 JSON이 아니라 XML로 온다
    const reason = body.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/)?.[1]
    throw new HttpError(502, `TourAPI 오류${reason ? `: ${reason}` : ` (HTTP ${response.status})`}`)
  }

  const header = json?.response?.header
  if (!response.ok || header?.resultCode !== '0000') {
    throw new HttpError(502, `TourAPI 오류: ${header?.resultMsg ?? `HTTP ${response.status}`}`)
  }
  return json
}

/** items가 "", 객체 하나, 배열 어느 쪽이어도 배열로 */
export function itemsOf(json) {
  const item = json?.response?.body?.items?.item
  if (Array.isArray(item)) return item
  return item && typeof item === 'object' ? [item] : []
}

/** 프론트(src/api/normalize.js의 readBody)가 그대로 읽을 수 있는 TourAPI 모양 응답 */
export function tourShape(items, { pageNo = 1, numOfRows = items.length, totalCount = items.length } = {}) {
  return {
    response: {
      header: { resultCode: '0000', resultMsg: 'OK' },
      body: { items: items.length ? { item: items } : '', numOfRows, pageNo, totalCount },
    },
  }
}

/** 에러 응답. 인증키나 요청 URL은 절대 내보내지 않는다 */
export function sendError(res, error) {
  const status = error instanceof HttpError ? error.status : 500
  const message = error instanceof HttpError ? error.message : '서버 오류가 발생했습니다'
  console.error(`[api] ${status} ${error?.message}`)
  res.setHeader('Cache-Control', 'no-store')
  res.status(status).json({ error: message })
}

export function intParam(value, { min, max, fallback }) {
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}
