// GET /api/festival-detail?id=123456
// detailCommon2(소개글·주소·연락처) + detailIntro2(행사 기간·장소·이용요금)를 함께 조회한다.

import { HttpError, callTour, sendError } from './_tour.js'

const FESTIVAL_CONTENT_TYPE = '15'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw new HttpError(405, 'GET만 지원합니다')

    const id = String(req.query.id ?? '')
    if (!/^\d{1,12}$/.test(id)) throw new HttpError(400, 'id가 올바르지 않습니다')

    const [common, intro] = await Promise.all([
      callTour('detailCommon2', { contentId: id }),
      callTour('detailIntro2', { contentId: id, contentTypeId: FESTIVAL_CONTENT_TYPE }),
    ])

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json({ common, intro })
  } catch (error) {
    sendError(res, error)
  }
}
