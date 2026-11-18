// /api/exams 프록시 호출. 필드 정의는 docs/기획서.md 1-1절을 참고해요.

const PAGE_SIZE = 50 // API 최대값

async function fetchPage(params) {
  const response = await fetch(`/api/exams?${new URLSearchParams(params)}`)
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('시험일정 응답을 읽지 못했어요.')
  }
  const code = data?.header?.resultCode
  if (!response.ok || code !== '00') {
    throw new Error(errorMessage(code, data))
  }
  return data.body
}

// 공공데이터포털 오류 메시지는 영어 원문이라 사용자용 문구로 바꿔요. (원문은 콘솔에 남겨요)
function errorMessage(code, data) {
  console.error('[api/exams]', code, data?.header?.resultMsg ?? data?.error)
  if (code === '22') return '오늘 사용할 수 있는 조회 횟수를 모두 썼어요. 내일 다시 시도해 주세요.'
  if (code === '20' || code === '30' || code === '31') return '서비스 설정에 문제가 있어요. 잠시 후 다시 시도해 주세요.'
  return code ? `잠시 후 다시 시도해 주세요. (오류 코드 ${code})` : '잠시 후 다시 시도해 주세요.'
}

// 한 해의 일정을 페이지를 넘겨 가며 모두 가져와요.
export async function fetchExamSchedules({ implYy, qualgbCd }) {
  const params = { implYy, numOfRows: PAGE_SIZE, pageNo: 1 }
  if (qualgbCd) params.qualgbCd = qualgbCd

  const first = await fetchPage(params)
  const items = [...(first.items ?? [])]
  const pages = Math.ceil((first.totalCount ?? 0) / PAGE_SIZE)

  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      fetchPage({ ...params, pageNo: i + 2 }),
    ),
  )
  for (const body of rest) items.push(...(body.items ?? []))
  return items
}
