// 브라우저는 서울 API를 직접 부르지 않고, 우리 서버 함수(/api/air)만 부른다
export async function fetchAir() {
  const res = await fetch('/api/air')
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message ?? '대기질 정보를 불러오지 못했어요.')
  return data
}
