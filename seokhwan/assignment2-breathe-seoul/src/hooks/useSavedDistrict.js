import { useState } from 'react'

const STORAGE_KEY = 'breathe-seoul:district'

// 선택한 구를 기억한다 (시크릿 모드 등 저장소가 막혀도 화면은 동작)
export function useSavedDistrict() {
  const [district, setDistrict] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })

  const save = (name) => {
    setDistrict(name)
    try {
      localStorage.setItem(STORAGE_KEY, name)
    } catch {
      // 저장 실패는 무시
    }
  }

  return [district, save]
}
