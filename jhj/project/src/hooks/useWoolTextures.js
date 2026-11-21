import { useCallback, useEffect, useState } from 'react'
import { WOOLS } from '../data/wools.js'
import { fetchBlocks, textureUrl } from '../api/mcApi.js'

/**
 * 앱 시작 시 블록 목록을 한 번 받아 양털 16종의 텍스처를 준비한다.
 * 반환값
 * - textures: { [woolId]: url } — <img>용. 아직 없거나 실패한 양털은 키가 없다(대체 단색 사용)
 * - images:   { [woolId]: HTMLImageElement } — canvas용. 다 불러온 이미지만 들어 있다
 * - status: 'loading' | 'ready' | 'error'
 * - failedIds: 이미지 로딩에 실패한 양털 ID 목록
 * - markFailed(id): <img onError>에서 호출 → 그 양털은 어디서나 대체 단색으로 바뀐다
 */
export function useWoolTextures() {
  const [urls, setUrls] = useState({})
  const [images, setImages] = useState({})
  const [status, setStatus] = useState('loading')
  const [failedIds, setFailedIds] = useState([])

  const markFailed = useCallback((id) => {
    setFailedIds((ids) => (ids.includes(id) ? ids : [...ids, id]))
  }, [])

  useEffect(() => {
    let active = true
    fetchBlocks()
      .then((data) => {
        if (!active) return
        const blocks = data.blocks ?? []
        const map = {}
        for (const wool of WOOLS) {
          // carpet, slab 등이 섞여 있으므로 id는 반드시 === 로 비교한다
          const block = blocks.find((b) => b.id === wool.id)
          if (!block?.icon) continue
          map[wool.id] = textureUrl(block.icon)
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => active && setImages((m) => ({ ...m, [wool.id]: img }))
          img.onerror = () => active && markFailed(wool.id)
          img.src = map[wool.id]
        }
        setUrls(map)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [markFailed])

  const textures = Object.fromEntries(Object.entries(urls).filter(([id]) => !failedIds.includes(id)))

  return { textures, images, status, failedIds, markFailed }
}
