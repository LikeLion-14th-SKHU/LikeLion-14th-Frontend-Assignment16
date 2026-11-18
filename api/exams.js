// Vercel Function: 국가자격 시험일정 API 프록시
// 브라우저는 /api/exams?... 만 호출하고, 서비스키는 서버 환경변수에서만 붙여요.
// 쿼리 파라미터는 그대로 전달해요. (파라미터 이름은 data.go.kr 상세 페이지 기준)

const UPSTREAM =
  'https://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList'

const ONE_DAY = 60 * 60 * 24

export async function GET(request) {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) {
    return Response.json(
      { error: 'DATA_GO_KR_KEY 환경변수가 설정되지 않았어요.' },
      { status: 500 },
    )
  }

  const params = new URL(request.url).searchParams
  params.delete('serviceKey') // 클라이언트가 보낸 키는 무시해요
  // 디코딩(Decoding) 키를 넣으면 URLSearchParams가 알아서 인코딩해요
  params.set('serviceKey', key)

  let upstream
  try {
    upstream = await fetch(`${UPSTREAM}?${params}`)
  } catch {
    return Response.json(
      { error: '공공데이터포털에 연결하지 못했어요.' },
      { status: 502 },
    )
  }

  const body = await upstream.text()
  const contentType =
    upstream.headers.get('content-type') ?? 'text/plain; charset=utf-8'

  // 공공데이터포털 게이트웨이 오류(키 미등록, 호출 한도 초과 등)는
  // 200으로 와도 이 XML 형식이에요. 캐시하지 않고 오류로 돌려줘요.
  const isGatewayError = body.includes('<OpenAPI_ServiceResponse>')
  const ok = upstream.ok && !isGatewayError

  return new Response(body, {
    status: ok ? 200 : upstream.ok ? 502 : upstream.status,
    headers: {
      'content-type': contentType,
      'cache-control': ok
        ? `public, s-maxage=${ONE_DAY}, stale-while-revalidate=${ONE_DAY}`
        : 'no-store',
    },
  })
}
