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
  if (!response.ok || data?.header?.resultCode !== '00') {
    throw new Error(data?.header?.resultMsg || data?.error || '시험일정을 불러오지 못했어요.')
  }
  return data.body
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
