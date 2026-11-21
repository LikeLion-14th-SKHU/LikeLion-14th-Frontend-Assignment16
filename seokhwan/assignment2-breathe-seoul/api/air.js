// Vercel 서버 함수 (개발 서버에서도 vite.config.js가 같은 함수를 연결한다)
// - 인증키를 브라우저에 노출하지 않는다
// - 서울 API는 http만 지원하므로, https 페이지에서 부를 수 있게 중계한다
export default async function handler(req, res) {
  const key = process.env.SEOUL_API_KEY || 'sample'
  const sample = key === 'sample'
  const end = sample ? 5 : 25 // sample 키는 한 번에 최대 5건 (ERROR-335)
  const url = `http://openapi.seoul.go.kr:8088/${encodeURIComponent(key)}/json/RealtimeCityAir/1/${end}/`

  try {
    const text = await (await fetch(url)).text()
    let data
    try {
      data = JSON.parse(text).RealtimeCityAir
    } catch {
      // 에러는 JSON이 아니라 XML로 온다
    }
    if (!data?.row) {
      const message = text.match(/<MESSAGE><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? '대기질 정보를 불러오지 못했어요.'
      return send(res, 502, { message: message.trim() })
    }
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    send(res, 200, { rows: data.row, total: data.list_total_count, sample })
  } catch {
    send(res, 502, { message: '서울 열린데이터광장에 연결하지 못했어요.' })
  }
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}
