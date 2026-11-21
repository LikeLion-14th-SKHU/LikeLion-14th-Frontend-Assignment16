// 마인크래프트 양털 16종 (크리에이티브 인벤토리 순서)
// - name: 게임 속 한국어 이름 (mc-api /v1/lang/ko_kr 기준) → 게임에서 그대로 검색할 수 있다
// - fallback: 텍스처 PNG의 평균색 (mc-api 텍스처로 계산). 텍스처 로딩 실패 시 사용
// - recipe: mc-api /v1/recipes/{id} 의 레시피 이름 (제작법 그림용)
// - code: 저장할 때 칸 하나를 글자 하나로 줄이는 코드
const RAW = [
  ['white_wool', '하얀색', '#EAECED'],
  ['light_gray_wool', '회백색', '#8E8E87'],
  ['gray_wool', '회색', '#3F4448'],
  ['black_wool', '검은색', '#15151A'],
  ['brown_wool', '갈색', '#724829'],
  ['red_wool', '빨간색', '#A12723'],
  ['orange_wool', '주황색', '#F17614'],
  ['yellow_wool', '노란색', '#F9C628'],
  ['lime_wool', '연두색', '#70B91A'],
  ['green_wool', '초록색', '#556E1C'],
  ['cyan_wool', '청록색', '#158A91'],
  ['light_blue_wool', '하늘색', '#3AAFD9'],
  ['blue_wool', '파란색', '#35399D'],
  ['purple_wool', '보라색', '#7A2AAD'],
  ['magenta_wool', '자홍색', '#BE45B4'],
  ['pink_wool', '분홍색', '#EE8DAC'],
]

export const WOOLS = RAW.map(([id, color, fallback], i) => ({
  id,
  color, // '파란색' — 팔레트처럼 좁은 곳에 쓰는 짧은 이름
  name: `${color} 양털`,
  texturePath: `block/${id}.png`,
  fallback,
  code: String.fromCharCode(97 + i), // 'a' ~ 'p'
  recipe: id === 'white_wool' ? 'white_wool_from_string' : `dye_${id}`,
  // 서바이벌에서 구하는 법 (짧게)
  source:
    id === 'white_wool'
      ? '양 털 깎기 · 실 4개 조합'
      : `${color} 양 털 깎기 · 양털 + ${color} 염료`,
}))

// id → 양털 정보 빠른 조회용
export const WOOL_BY_ID = Object.fromEntries(WOOLS.map((w) => [w.id, w]))
export const WOOL_BY_CODE = Object.fromEntries(WOOLS.map((w) => [w.code, w]))

export const WOOL_IDS = WOOLS.map((w) => w.id)
