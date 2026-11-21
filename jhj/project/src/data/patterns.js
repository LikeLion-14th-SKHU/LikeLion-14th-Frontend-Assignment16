// 도안: 길이 size×size 인 1차원 배열, index = row * size + col
// 값은 양털 ID 문자열 또는 빈칸 null
export const GRID_SIZES = [16, 32, 48, 64]
export const DEFAULT_SIZE = 32

export const createEmptyGrid = (size = DEFAULT_SIZE) => Array(size * size).fill(null)

// 화면의 행(위에서부터, 0부터) → 게임에서 쌓는 층(아래에서부터, 1부터)
export const rowToLayer = (row, size) => size - row

// 도형으로 그리는 도우미. (cx, cy)는 칸 단위 좌표, 칸의 중심이 (c + 0.5, r + 0.5)
function draw(size, paint) {
  const grid = createEmptyGrid(size)
  const set = (r, c, id) => {
    if (r >= 0 && r < size && c >= 0 && c < size) grid[r * size + c] = id
  }
  const ellipse = (cx, cy, rx, ry, id) => {
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (((c + 0.5 - cx) / rx) ** 2 + ((r + 0.5 - cy) / ry) ** 2 <= 1) set(r, c, id)
  }
  const rect = (r0, c0, r1, c1, id) => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) set(r, c, id)
  }
  // 좌우 대칭: c 와 (size - 1 - c) 에 같이 칠한다
  const mirror = (r, c, id) => {
    set(r, c, id)
    set(r, size - 1 - c, id)
  }
  paint({ set, ellipse, rect, mirror })
  return grid
}

// 32×32 펭귄: 좌우 대칭, 가운데 기준선은 15열과 16열 사이
const createPenguin = () =>
  draw(32, ({ ellipse, rect, mirror }) => {
    const K = 'black_wool'
    const W = 'white_wool'
    const O = 'orange_wool'
    ellipse(16, 20.5, 10.5, 10.5, K) // 몸통
    ellipse(6.5, 22, 2.5, 5.5, K) // 왼쪽 날개
    ellipse(25.5, 22, 2.5, 5.5, K) // 오른쪽 날개
    ellipse(16, 10.5, 8.5, 7.5, K) // 머리
    ellipse(16, 23.5, 7, 7, W) // 배
    ellipse(12.5, 10.5, 3.2, 3.4, W) // 왼쪽 눈 주변
    ellipse(19.5, 10.5, 3.2, 3.4, W) // 오른쪽 눈 주변
    ellipse(16, 13, 4.5, 2.6, W) // 얼굴 아래쪽
    rect(10, 13, 11, 14, K) // 왼쪽 눈동자
    rect(10, 17, 11, 18, K) // 오른쪽 눈동자
    mirror(10, 13, W) // 눈 반짝임
    rect(12, 14, 12, 17, O) // 부리
    rect(13, 15, 13, 16, O)
    mirror(13, 11, 'pink_wool') // 볼
    rect(17, 7, 17, 24, 'red_wool') // 목도리
    rect(18, 19, 20, 20, 'red_wool') // 목도리 끝
    ellipse(11.5, 30.5, 3.5, 1.5, O) // 발
    ellipse(20.5, 30.5, 3.5, 1.5, O)
  })

// 16×16 하트
const HEART_ROWS = [
  '................',
  '................',
  '...RRR....RRR...',
  '..RRRRR..RRRRR..',
  '.RRPRRRRRRRRRRR.',
  '.RPPRRRRRRRRRRR.',
  '.RRRRRRRRRRRRRR.',
  '.RRRRRRRRRRRRRR.',
  '..RRRRRRRRRRRR..',
  '...RRRRRRRRRR...',
  '....RRRRRRRR....',
  '.....RRRRRR.....',
  '......RRRR......',
  '.......RR.......',
  '................',
  '................',
]
const LEGEND = { '.': null, R: 'red_wool', P: 'pink_wool' }
const createHeart = () => HEART_ROWS.join('').split('').map((ch) => LEGEND[ch])

export const EXAMPLES = [
  { id: 'penguin', name: '펭귄 예시', size: 32, create: createPenguin },
  { id: 'heart', name: '하트 예시', size: 16, create: createHeart },
]
