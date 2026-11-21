// 양털 8종. 2단계에서는 대체 단색(fallback)만 사용하고,
// 4단계에서 texturePath로 mc-api 텍스처를 입힌다.
export const WOOLS = [
  { id: 'white_wool', name: '흰색 양털', texturePath: 'block/white_wool.png', fallback: '#EAECED' },
  { id: 'gray_wool', name: '회색 양털', texturePath: 'block/gray_wool.png', fallback: '#3F4448' },
  { id: 'black_wool', name: '검은색 양털', texturePath: 'block/black_wool.png', fallback: '#15151A' },
  { id: 'blue_wool', name: '파란색 양털', texturePath: 'block/blue_wool.png', fallback: '#35399D' },
  { id: 'light_blue_wool', name: '하늘색 양털', texturePath: 'block/light_blue_wool.png', fallback: '#3AAFD9' },
  { id: 'yellow_wool', name: '노란색 양털', texturePath: 'block/yellow_wool.png', fallback: '#F9C628' },
  { id: 'orange_wool', name: '주황색 양털', texturePath: 'block/orange_wool.png', fallback: '#F17614' },
  { id: 'red_wool', name: '빨간색 양털', texturePath: 'block/red_wool.png', fallback: '#A12723' },
]

// id → 양털 정보 빠른 조회용
export const WOOL_BY_ID = Object.fromEntries(WOOLS.map((w) => [w.id, w]))

export const WOOL_IDS = WOOLS.map((w) => w.id)
