import { useSyncExternalStore } from 'react'

// 관심 자격증(종목명 배열)을 localStorage에 저장해요.
// 여러 컴포넌트(검색 목록, 상세, 홈)와 다른 탭이 같은 값을 보도록 외부 저장소로 다뤄요.
const KEY = 'cert-dday:favorites'
const EMPTY = []
const listeners = new Set()

function read() {
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((name) => typeof name === 'string') : EMPTY
  } catch {
    return EMPTY // 사생활 보호 모드 등에서 저장소를 못 쓰면 빈 목록으로 동작해요
  }
}

let current = typeof window === 'undefined' ? EMPTY : read()

function emit() {
  for (const listener of listeners) listener()
}

function write(next) {
  current = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // 저장에 실패해도 이번 방문 동안은 메모리 값으로 동작해요
  }
  emit()
}

function onStorage(event) {
  if (event.key !== KEY) return
  current = read()
  emit()
}

function subscribe(listener) {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

export function useFavorites() {
  const names = useSyncExternalStore(subscribe, () => current, () => EMPTY)

  return {
    names,
    has: (name) => names.includes(name),
    // 새로 담은 자격증이 앞에 오게 해요
    toggle: (name) =>
      write(names.includes(name) ? names.filter((n) => n !== name) : [name, ...names]),
    // 공유 받은 목록 담기: 이미 있는 건 건너뛰고 새것만 앞에 붙여요
    addAll: (list) => {
      const fresh = list.filter((n) => !names.includes(n))
      if (fresh.length > 0) write([...fresh, ...names])
    },
  }
}
