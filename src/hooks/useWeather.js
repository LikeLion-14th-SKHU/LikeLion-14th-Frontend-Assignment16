import { useCallback, useEffect, useState } from 'react';
import { fetchWeather } from '../api/weather.js';

export function useWeather(city) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const retry = useCallback(() => setRefreshKey(key => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setWeather(null);
    setLoading(true);
    setError('');

    fetchWeather(city, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setWeather(data);
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : '네트워크 연결을 확인해 주세요.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [city, refreshKey]);

  return { weather, loading, error, retry };
}
