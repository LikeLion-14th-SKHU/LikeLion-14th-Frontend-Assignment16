// GET /api/festivals?start=YYYYMMDD&end=YYYYMMDD&areaCode=11&page=1&size=12
// searchFestival2를 조회 시작일 기준으로 전국 단위로 모두 받아 온 뒤,
// 기간 겹침·지역을 여기서 걸러 종료일 순으로 정렬해 페이지로 잘라 보낸다. (totalCount가 실제 결과와 맞도록)

import { matchesRegion } from '../src/constants/regions.js'
import { overlaps } from '../src/utils/date.js'
import { HttpError, callTour, intParam, itemsOf, sendError, tourShape } from './_tour.js'

const FETCH_ROWS = 500
const MAX_FETCH_PAGES = 6
const CACHE_TTL_MS = 10 * 60 * 1000
const YMD = /^\d{8}$/

// 같은 인스턴스가 살아 있는 동안 조회 시작일별 결과를 재사용한다 (TourAPI 호출 횟수 절약)
const cache = new Map()

async function fetchAllFrom(start) {
  const hit = cache.get(start)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.items

  const items = []
  for (let pageNo = 1; pageNo <= MAX_FETCH_PAGES; pageNo += 1) {
    const json = await callTour('searchFestival2', {
      eventStartDate: start,
      numOfRows: String(FETCH_ROWS),
      pageNo: String(pageNo),
    })
    const page = itemsOf(json)
    items.push(...page)
    const total = Number(json.response.body?.totalCount) || 0
    if (page.length < FETCH_ROWS || items.length >= total) break
  }

  cache.set(start, { at: Date.now(), items })
  return items
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw new HttpError(405, 'GET만 지원합니다')

    const { start, end } = req.query
    if (!YMD.test(start ?? '') || !YMD.test(end ?? '') || start > end) {
      throw new HttpError(400, 'start, end는 YYYYMMDD 형식이어야 합니다')
    }
    const areaCode = /^\d{2}$/.test(req.query.areaCode ?? '') ? req.query.areaCode : ''
    const page = intParam(req.query.page, { min: 1, max: 100, fallback: 1 })
    const size = intParam(req.query.size, { min: 1, max: 50, fallback: 12 })

    const matched = (await fetchAllFrom(start))
      .filter((item) => overlaps({ startDate: item.eventstartdate, endDate: item.eventenddate }, { start, end }))
      .filter((item) => matchesRegion(item.lDongRegnCd || item.areacode, areaCode))
      // 곧 끝나는 축제가 먼저 (장기 상설 공연은 뒤로). 종료일이 같으면 먼저 시작한 순
      .sort(
        (a, b) =>
          String(a.eventenddate).localeCompare(String(b.eventenddate)) ||
          String(a.eventstartdate).localeCompare(String(b.eventstartdate)),
      )

    const from = (page - 1) * size
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
    res.status(200).json(tourShape(matched.slice(from, from + size), { pageNo: page, numOfRows: size, totalCount: matched.length }))
  } catch (error) {
    sendError(res, error)
  }
}
