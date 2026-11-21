import { useCallback, useEffect, useState } from 'react'
import { WOOLS } from '../data/wools.js'

const API_BASE = 'https://mc-api.bisai.dev'

// 블록 목록(약 1.3MB)은 앱 전체에서 한 번만 받는다.
// 모듈 변수에 Promise를 보관해서 StrictMode의 effect 재실행에도 다시 호출하지 않는다.
let blocksPromise = null
function fetchBlocks() {
  if (!blocksPromise) {
    blocksPromise = fetch(`${API_BASE}/v1/assets/blocks`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    // 실패하면 다음 앱 실행 때 다시 시도할 수 있게 비운다
    blocksPromise.catch(() => {
      blocksPromise = null
    })
  }
  return blocksPromise
}

// 블록 목록 → { [woolId]: 텍스처 URL }
// carpet, slab 등이 섞여 있으므로 id는 반드시 === 로 비교한다.
function toTextureMap(blocks) {
  const map = {}
  for (const wool of WOOLS) {
    const block = blocks.find((b) => b.id === wool.id)
    if (block?.icon) map[wool.id] = `${API_BASE}/v1/assets/textures/${block.icon}`
  }
  return map
}

/**
 * 반환값
 * - textures: { [woolId]: url } — 아직 없거나 실패한 양털은 키가 없다(대체 단색 사용)
 * - status: 'loading' | 'ready' | 'error'
 * - failedIds: 이미지 로딩(onError)에 실패한 양털 ID 목록
 * - markFailed(id): <img onError>에서 호출 → 그 양털은 대체 단색으로 바뀐다
 */
export function useWoolTextures() {
  const [urls, setUrls] = useState({})
  const [status, setStatus] = useState('loading')
  const [failedIds, setFailedIds] = useState([])

  useEffect(() => {
    let active = true
    fetchBlocks()
      .then((data) => {
        if (!active) return
        setUrls(toTextureMap(data.blocks ?? []))
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  const markFailed = useCallback((id) => {
    setFailedIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
  }, [])

  const textures = Object.fromEntries(
    Object.entries(urls).filter(([id]) => !failedIds.includes(id)),
  )

  return { textures, status, failedIds, markFailed }
}
