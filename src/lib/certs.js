// 종목 목록: scripts/build-certs.mjs가 docs/의 CSV로 만든 src/data/certs.json
import certs from '../data/certs.json'

const normalize = (text) => text.replace(/\s+/g, '').toLowerCase()

const indexed = certs.map((cert) => ({ ...cert, key: normalize(cert.name) }))
const byName = new Map(certs.map((cert) => [cert.name, cert]))

export function findCert(name) {
  return byName.get(name) ?? null
}

// 일정 API와 연결되는 건 국가기술자격(T)뿐이에요
export function hasSchedule(cert) {
  return cert.qualgbCd === 'T' && Boolean(cert.grade)
}

// 띄어쓰기 무시 부분 일치. 이름이 검색어로 시작하는 것, 짧은 이름 순으로 보여줘요.
export function searchCerts(query, limit = 50) {
  const q = normalize(query)
  if (!q) return []
  return indexed
    .filter((cert) => cert.key.includes(q))
    .sort(
      (a, b) =>
        Number(b.key.startsWith(q)) - Number(a.key.startsWith(q)) ||
        Number(hasSchedule(b)) - Number(hasSchedule(a)) ||
        a.name.length - b.name.length ||
        a.name.localeCompare(b.name, 'ko'),
    )
    .slice(0, limit)
}

// CSV에서 산업기사는 "기사" 계열로 묶여 있고 일정도 기사와 같아요.
// "기사 등급"이라고 쓰면 산업기사가 기사인 것처럼 보여서 일정 이름으로 표시해요.
export function scheduleLabel(cert) {
  if (!cert.grade) return null
  return cert.grade === '기사' ? '기사·산업기사 일정' : `${cert.grade} 일정`
}

// 등급별 둘러보기 묶음. (분야별 분류는 "국가자격 계열 관련 정보" API가 있어야 해서 아직 없어요)
export const BROWSE_GROUPS = [
  { id: '기사', label: '기사·산업기사', match: (c) => c.grade === '기사' },
  { id: '기능사', label: '기능사', match: (c) => c.grade === '기능사' },
  { id: '기능장', label: '기능장', match: (c) => c.grade === '기능장' },
  { id: '기술사', label: '기술사', match: (c) => c.grade === '기술사' },
  { id: '전문', label: '국가전문자격', match: (c) => c.qualgbCd === 'S' },
].map((group) => ({ ...group, count: certs.filter(group.match).length }))

export function listGroup(id) {
  const group = BROWSE_GROUPS.find((g) => g.id === id)
  if (!group) return null
  return {
    group,
    certs: certs.filter(group.match).sort((a, b) => a.name.localeCompare(b.name, 'ko')),
  }
}

export function certPath(cert) {
  return `/cert/${encodeURIComponent(cert.name)}`
}
