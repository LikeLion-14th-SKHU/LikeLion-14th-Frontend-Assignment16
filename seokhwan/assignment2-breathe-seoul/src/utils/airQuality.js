// 등급 순서 (index가 클수록 나쁨)
export const GRADES = ['좋음', '보통', '나쁨', '매우나쁨']

// Tailwind가 클래스를 찾을 수 있도록 전체 문자열로 적는다
export const GRADE_STYLE = {
  좋음: { badge: 'bg-blue-100 text-blue-700', hero: 'bg-blue-500', dot: 'bg-blue-500' },
  보통: { badge: 'bg-emerald-100 text-emerald-700', hero: 'bg-emerald-500', dot: 'bg-emerald-500' },
  나쁨: { badge: 'bg-orange-100 text-orange-700', hero: 'bg-orange-500', dot: 'bg-orange-500' },
  매우나쁨: { badge: 'bg-red-100 text-red-700', hero: 'bg-red-600', dot: 'bg-red-600' },
  정보없음: { badge: 'bg-stone-100 text-stone-500', hero: 'bg-stone-400', dot: 'bg-stone-300' },
}

// 환경부 대기환경기준: 좋음/보통/나쁨 상한값 (그 이상은 매우나쁨)
export const POLLUTANTS = [
  { key: 'PM', name: '미세먼지', code: 'PM10', unit: '㎍/㎥', limits: [30, 80, 150] },
  { key: 'FPM', name: '초미세먼지', code: 'PM2.5', unit: '㎍/㎥', limits: [15, 35, 75] },
  { key: 'OZON', name: '오존', code: 'O₃', unit: 'ppm', limits: [0.03, 0.09, 0.15] },
  { key: 'NTDX', name: '이산화질소', code: 'NO₂', unit: 'ppm', limits: [0.03, 0.06, 0.2] },
  { key: 'CBMX', name: '일산화탄소', code: 'CO', unit: 'ppm', limits: [2, 9, 15] },
  { key: 'SPDX', name: '아황산가스', code: 'SO₂', unit: 'ppm', limits: [0.02, 0.05, 0.15] },
]

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v)

export function gradeOf(pollutant, value) {
  if (!isNumber(value)) return '정보없음'
  const i = pollutant.limits.findIndex((limit) => value <= limit)
  return GRADES[i === -1 ? 3 : i]
}

// 통합대기환경 등급, 미세먼지, 초미세먼지 중 가장 나쁜 등급으로 판정
export function overallGrade(row) {
  const [pm, fpm] = POLLUTANTS
  const worst = Math.max(...[row.CAI_GRD, gradeOf(pm, row.PM), gradeOf(fpm, row.FPM)].map((g) => GRADES.indexOf(g)))
  return worst === -1 ? '정보없음' : GRADES[worst]
}

export const VERDICT = {
  좋음: { title: '나가기 딱 좋아요', text: '공기가 맑아요. 오래 걷거나 뛰어도 괜찮아요.' },
  보통: { title: '가볍게 나가도 괜찮아요', text: '대부분 문제없지만, 호흡기가 예민하면 격한 운동은 짧게.' },
  나쁨: { title: '밖에서는 짧게만', text: '장시간 실외 활동은 줄이고, 나간다면 마스크를 챙기세요.' },
  매우나쁨: { title: '오늘은 실내에 있어요', text: '실외 활동을 피하고 창문을 닫아 두세요.' },
  정보없음: { title: '측정 정보가 없어요', text: '측정소 점검 중일 수 있어요. 잠시 후 새로고침해 보세요.' },
}

// 활동별 가이드: [상태, 설명]
const GUIDE = {
  산책: {
    좋음: ['추천', '한강·공원 산책하기 좋은 날'],
    보통: ['괜찮아요', '1시간 안쪽 가벼운 산책'],
    나쁨: ['짧게', '꼭 필요하면 30분 이내'],
    매우나쁨: ['자제', '실내 걷기로 대체'],
  },
  운동: {
    좋음: ['추천', '러닝·자전거 모두 OK'],
    보통: ['괜찮아요', '민감하면 강도를 낮춰서'],
    나쁨: ['실내로', '헬스장·홈트로 대체'],
    매우나쁨: ['자제', '실외 운동은 쉬어 가기'],
  },
  환기: {
    좋음: ['활짝', '창문 열고 충분히 환기'],
    보통: ['괜찮아요', '하루 3번, 10분씩'],
    나쁨: ['짧게', '3분 이내로 짧게'],
    매우나쁨: ['닫기', '창문 닫고 공기청정기'],
  },
  마스크: {
    좋음: ['필요 없음', '마스크 없이 편하게'],
    보통: ['선택', '민감하면 KF80'],
    나쁨: ['KF80 이상', '외출 시 꼭 착용'],
    매우나쁨: ['KF94', '짧은 외출도 착용'],
  },
}

export function activityGuide(grade) {
  return Object.entries(GUIDE).map(([activity, byGrade]) => {
    const [status, text] = byGrade[grade] ?? ['-', '측정 정보가 없어요']
    return { activity, status, text }
  })
}

// "202611212200" → "11월 21일 22:00"
export function formatMeasuredAt(dt) {
  if (!/^\d{12}$/.test(dt ?? '')) return ''
  return `${Number(dt.slice(4, 6))}월 ${Number(dt.slice(6, 8))}일 ${dt.slice(8, 10)}:${dt.slice(10, 12)}`
}
