// mc-api (https://mc-api.bisai.dev) 호출을 한곳에 모은다. 키 없이 브라우저에서 바로 호출(CORS *).
export const API_BASE = 'https://mc-api.bisai.dev'

// 남은 크레딧(분당 한도)을 응답 헤더에서 읽는다
const creditsOf = (res) => {
  const v = res.headers.get('x-credits-remaining')
  return v === null ? null : Number(v)
}

async function failMessage(res) {
  if (res.status === 429) return '요청이 너무 많아요. 1분쯤 뒤에 다시 해 주세요.'
  try {
    const body = await res.json()
    if (body?.error) return `mc-api 오류: ${body.error}`
  } catch {
    /* 본문이 JSON이 아니면 무시 */
  }
  return `mc-api 요청이 실패했어요 (HTTP ${res.status}).`
}

// ── 1. 블록 목록 (텍스처 경로) ─────────────────────────────
// 약 1.3MB → 앱 전체에서 한 번만 받는다. 모듈 변수에 Promise를 보관해 StrictMode 재실행에도 재호출하지 않는다.
let blocksPromise = null
export function fetchBlocks() {
  if (!blocksPromise) {
    blocksPromise = fetch(`${API_BASE}/v1/assets/blocks`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    blocksPromise.catch(() => {
      blocksPromise = null // 실패하면 다음에 다시 시도
    })
  }
  return blocksPromise
}

export const textureUrl = (icon) => `${API_BASE}/v1/assets/textures/${icon}`

// ── 2. 제작법 그림 (GET /v1/recipes/{id}/image.png, 1 크레딧) ──────
export const recipeImageUrl = (wool) =>
  `${API_BASE}/v1/recipes/${wool.id}/image.png?recipe=${wool.recipe}`

// ── 3. 게임 속 3D 렌더 (POST /v1/render/3d/scene, 2 + 블록 16개당 1 크레딧, 최대 50) ──
// 도안을 세워 놓은 벽으로 보고 블록 좌표로 바꾼다. 16 유닛 = 블록 1개, y는 위쪽.
export const VIEWS = {
  front: { label: '정면', yaw: 0, pitch: 0 },
  angled: { label: '비스듬히', yaw: 30, pitch: 14 },
  low: { label: '올려다보기', yaw: -20, pitch: -12 },
}

export function estimateRenderCredits(blockCount) {
  return 2 + Math.min(48, Math.ceil(blockCount / 16))
}

export async function renderBuild(grid, size, viewKey) {
  const blocks = []
  let minC = size, maxC = -1, minR = size, maxR = -1
  grid.forEach((id, i) => {
    if (!id) return
    const r = Math.floor(i / size)
    const c = i % size
    blocks.push(`${id}.${c * 16}.${(size - 1 - r) * 16}.0`)
    minC = Math.min(minC, c); maxC = Math.max(maxC, c)
    minR = Math.min(minR, r); maxR = Math.max(maxR, r)
  })
  if (blocks.length === 0) throw new Error('칠한 칸이 없어서 렌더링할 게 없어요.')

  // 칠한 영역의 가운데를 바라보고, 영역이 화면에 다 들어오게 거리를 잡는다 (ortho: 화면 반높이 = (60 + 거리)·tan(fov/2))
  const cx = ((minC + maxC + 1) / 2) * 16
  const cy = ((size - maxR - 1 + size - minR) / 2) * 16
  const span = Math.max(maxC - minC + 1, maxR - minR + 1) * 16
  const distance = Math.max(0, Math.round((span / 2) * 1.2 / Math.tan((50 * Math.PI) / 180) - 60))
  const view = VIEWS[viewKey] ?? VIEWS.angled

  const query = new URLSearchParams({
    v: '2',
    cameraTarget: `${cx}.${cy}.8`,
    camera: `${view.yaw},${view.pitch},0,${distance}`,
    projection: 'ortho',
    sky: 'day.0',
    width: '720',
    height: '720',
  })
  // blocks 값에는 '*'와 '.'만 쓰이므로 인코딩 없이 붙인다
  const res = await fetch(`${API_BASE}/v1/render/3d/scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `${query}&blocks=${blocks.join('*')}` }),
  })
  if (!res.ok) throw new Error(await failMessage(res))
  const blob = await res.blob()
  return { url: URL.createObjectURL(blob), credits: creditsOf(res) }
}
