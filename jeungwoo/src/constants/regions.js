// 지역 코드: 법정동 시·도 코드(lDongRegnCd). KorService2는 areaCode 대신 이 값을 쓴다.
// code가 ''이면 전국(필터 없음).
// 강원·전북은 특별자치도 전환 전 코드(42·45)가 섞여 있을 수 있어 aliases로 함께 받는다.
// 광주·전남은 실제 데이터에서 전남광주통합특별시(12)로 오므로 하나로 합치고, 옛 코드(29·46)도 받는다.
export const REGIONS = [
  { code: '', name: '전국' },
  { code: '11', name: '서울' },
  { code: '26', name: '부산' },
  { code: '27', name: '대구' },
  { code: '28', name: '인천' },
  { code: '12', name: '광주·전남', aliases: ['29', '46'] },
  { code: '30', name: '대전' },
  { code: '31', name: '울산' },
  { code: '36', name: '세종' },
  { code: '41', name: '경기' },
  { code: '51', name: '강원', aliases: ['42'] },
  { code: '43', name: '충북' },
  { code: '44', name: '충남' },
  { code: '52', name: '전북', aliases: ['45'] },
  { code: '47', name: '경북' },
  { code: '48', name: '경남' },
  { code: '50', name: '제주' },
]

function findRegion(code) {
  const value = String(code ?? '')
  return REGIONS.find((region) => region.code === value || region.aliases?.includes(value))
}

/** 지역 코드 → 이름. 모르는 코드면 '' */
export function getRegionName(code) {
  return findRegion(code)?.name ?? ''
}

/** 축제의 지역 코드가 선택한 지역에 속하는지 (선택이 ''이면 전국 → 항상 true) */
export function matchesRegion(itemCode, selectedCode) {
  if (!selectedCode) return true
  const region = findRegion(selectedCode)
  if (!region) return false
  const value = String(itemCode ?? '')
  return value === region.code || Boolean(region.aliases?.includes(value))
}
