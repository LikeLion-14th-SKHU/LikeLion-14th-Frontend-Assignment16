import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'weekend-fest:likes'

// 찜 목록은 축제 요약 객체로 저장한다. 찜 탭은 필터·API와 상관없이 바로 보여야 하기 때문이다.
const SAVED_FIELDS = ['id', 'title', 'image', 'startDate', 'endDate', 'address', 'areaCode', 'region', 'tel', 'mapX', 'mapY']

function pick(festival) {
  return Object.fromEntries(SAVED_FIELDS.map((field) => [field, festival[field] ?? '']))
}

/** localStorage가 막혀 있거나(시크릿 모드 등) 값이 깨져 있어도 빈 목록으로 시작한다 */
function readLikes() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.id) : []
  } catch {
    return []
  }
}

function writeLikes(likes) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(likes))
  } catch {
    // 저장 실패 시에도 이번 화면에서는 찜 상태를 유지한다
  }
}

/** 찜하기: localStorage에 저장되어 새로고침 후에도 유지된다. 최근 찜이 앞에 온다 */
export function useLikes() {
  const [likes, setLikes] = useState(readLikes)

  // 다른 탭에서 찜을 바꾸면 이 탭에도 반영
  useEffect(() => {
    function onStorage(event) {
      if (event.key === STORAGE_KEY) setLikes(readLikes())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const likedIds = useMemo(() => new Set(likes.map((item) => item.id)), [likes])
  const isLiked = useCallback((id) => likedIds.has(id), [likedIds])

  const toggleLike = useCallback((festival) => {
    setLikes((prev) => {
      const next = prev.some((item) => item.id === festival.id)
        ? prev.filter((item) => item.id !== festival.id)
        : [pick(festival), ...prev]
      writeLikes(next)
      return next
    })
  }, [])

  return { likes, isLiked, toggleLike }
}
