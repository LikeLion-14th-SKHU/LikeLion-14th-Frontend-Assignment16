import { useEffect, useState } from 'react'

export function useRequest(load, delay = 0) {
  const [state, setState] = useState({})
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!load) return
    const controller = new AbortController()
    const update = result => {
      if (!controller.signal.aborted) setState({ load, attempt, ...result })
    }
    const timer = setTimeout(async () => {
      try {
        const data = await load(controller.signal, progress => update({ progress }))
        update({ data })
      } catch (error) {
        update({ error: error.message || '요청에 실패했습니다.' })
      }
    }, delay)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [load, delay, attempt])

  const current = state.load === load && state.attempt === attempt ? state : {}
  return { ...current, pending: Boolean(load && !current.data && !current.error), retry: () => setAttempt(n => n + 1) }
}
