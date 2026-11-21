import { useCallback, useEffect, useState } from 'react'
import { fetchAir } from '../api/air.js'

export function useAir() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const run = useCallback(
    () =>
      fetchAir()
        .then((result) => {
          setData(result)
          setError('')
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    run()
  }, [run])

  const reload = () => {
    setLoading(true)
    run()
  }

  return { data, error, loading, reload }
}
