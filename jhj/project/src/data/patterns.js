// 도안: 길이 256인 1차원 배열, index = row * 16 + col
// 값은 양털 ID 문자열 또는 빈칸 null
export const GRID_SIZE = 16
export const CELL_COUNT = GRID_SIZE * GRID_SIZE

export const createEmptyGrid = () => Array(CELL_COUNT).fill(null)

// 글자 하나 = 칸 하나. '.'은 빈칸
const LEGEND = {
  '.': null,
  K: 'black_wool',
  W: 'white_wool',
  O: 'orange_wool',
}

// 16×16 펭귄 예시
const PENGUIN_ROWS = [
  '................',
  '......KKKK......',
  '....KKKKKKKK....',
  '...KKKKKKKKKK...',
  '...KWWWKKWWWK...',
  '...KWKWWWWKWK...',
  '...KWWWOOWWWK...',
  '..KKKWWOOWWKKK..',
  '.KKKWWWWWWWWKKK.',
  '.KKWWWWWWWWWWKK.',
  '.KKWWWWWWWWWWKK.',
  '..KWWWWWWWWWWK..',
  '..KKWWWWWWWWKK..',
  '...KKKKKKKKKK...',
  '...OOOO..OOOO...',
  '................',
]

const rowsToGrid = (rows) => rows.join('').split('').map((ch) => LEGEND[ch])

export const PATTERNS = [
  { id: 'empty', name: '빈 도안', create: createEmptyGrid },
  { id: 'penguin', name: '펭귄 예시', create: () => rowsToGrid(PENGUIN_ROWS) },
]
