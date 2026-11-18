import { useEffect, useState } from 'react'

// 테마: 사용자가 고르기 전에는 시스템 설정을 따르고, 고르면 localStorage에 저장해요.
// 첫 값은 index.html의 인라인 스크립트가 <html data-theme>에 넣어 둬요.
const KEY = 'cert-dday:theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

function stored() {
  try {
    const value = window.localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function apply(theme) {
  document.documentElement.dataset.theme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme ?? (media().matches ? 'dark' : 'light'),
  )

  // 직접 고른 적이 없으면 시스템 설정이 바뀔 때 따라가요
  useEffect(() => {
    const mq = media()
    const onChange = (event) => {
      if (stored()) return
      const next = event.matches ? 'dark' : 'light'
      apply(next)
      setTheme(next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    try {
      window.localStorage.setItem(KEY, next)
    } catch {
      // 저장하지 못해도 이번 방문 동안은 바뀐 테마로 보여요
    }
    apply(next)
    setTheme(next)
  }

  return { theme, toggle }
}
