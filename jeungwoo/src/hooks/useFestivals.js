import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchFestivals } from '../api/festivalApi.js'

const INITIAL = {
  key: null, // 이 상태가 어떤 조건(기간|지역|재시도 번호)의 결과인지
  items: [],
  totalCount: 0,
  page: 0,
  status: 'loading', // 'loading' | 'success' | 'error' (첫 페이지 기준)
  error: null,
  isLoadingMore: false,
  loadMoreError: null,
}

/** 같은 축제가 두 페이지에 걸쳐 나와도 한 번만 보이게 한다 */
function mergeUnique(prev, next) {
  const seen = new Set(prev.map((item) => item.id))
  return [...prev, ...next.filter((item) => !seen.has(item.id))]
}

/**
 * 축제 목록 + 필터 + 페이지
 * 필터가 바뀌면 1페이지부터 다시 불러오고, 늦게 도착한 이전 응답은 버린다.
 */
export function useFestivals({ period, areaCode }) {
  const [stored, setState] = useState(INITIAL)
  const [reloadKey, setReloadKey] = useState(0)
  const key = `${period}|${areaCode}|${reloadKey}`
  // 조건이 바뀐 직후에는 이전 결과 대신 "로딩 중"으로 보이게 렌더 중에 계산한다
  const state = stored.key === key ? stored : INITIAL

  // 요청 세대 번호. 필터 변경·재시도마다 올라가며, 번호가 다른 응답은 무시한다.
  const generationRef = useRef(0)
  const loadingMoreRef = useRef(false)

  useEffect(() => {
    const generation = ++generationRef.current
    loadingMoreRef.current = false

    fetchFestivals({ period, areaCode, page: 1 })
      .then(({ items, totalCount }) => {
        if (generation !== generationRef.current) return
        setState({ ...INITIAL, key, items, totalCount, page: 1, status: 'success' })
      })
      .catch((error) => {
        if (generation !== generationRef.current) return
        setState({ ...INITIAL, key, status: 'error', error })
      })
  }, [period, areaCode, key])

  const hasMore = state.status === 'success' && state.items.length < state.totalCount

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMoreRef.current) return
    const generation = generationRef.current
    const nextPage = state.page + 1
    loadingMoreRef.current = true
    setState((s) => ({ ...s, isLoadingMore: true, loadMoreError: null }))

    fetchFestivals({ period, areaCode, page: nextPage })
      .then(({ items, totalCount }) => {
        if (generation !== generationRef.current) return
        setState((s) => ({
          ...s,
          items: mergeUnique(s.items, items),
          totalCount,
          page: nextPage,
          isLoadingMore: false,
        }))
      })
      .catch((error) => {
        if (generation !== generationRef.current) return
        setState((s) => ({ ...s, isLoadingMore: false, loadMoreError: error }))
      })
      .finally(() => {
        if (generation === generationRef.current) loadingMoreRef.current = false
      })
  }, [hasMore, state.page, period, areaCode])

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  return { ...state, hasMore, loadMore, retry }
}
