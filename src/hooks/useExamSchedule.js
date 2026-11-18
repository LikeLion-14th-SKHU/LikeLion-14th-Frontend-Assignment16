import { useEffect, useState } from 'react'
import { fetchExamSchedules } from '../lib/api.js'

// 국가기술자격(T) 일정을 올해·내년 치로 한 번만 받아 페이지끼리 공유해요.
// (내년 일정은 공고 전이면 0건이에요)
let cache = null

function loadSchedules() {
  if (!cache) {
    const year = new Date().getFullYear()
    cache = Promise.all(
      [year, year + 1].map((implYy) => fetchExamSchedules({ implYy, qualgbCd: 'T' })),
    )
      .then((lists) => lists.flat())
      .catch((error) => {
        cache = null // 실패하면 다음에 다시 시도해요
        throw error
      })
  }
  return cache
}

export function useExamSchedule() {
  const [state, setState] = useState({ status: 'loading', items: [], error: null })

  useEffect(() => {
    let active = true
    loadSchedules().then(
      (items) => active && setState({ status: 'success', items, error: null }),
      (error) => active && setState({ status: 'error', items: [], error }),
    )
    return () => {
      active = false
    }
  }, [])

  return state
}
