const API_URL = 'https://api.open-meteo.com/v1/forecast';

export function buildWeatherUrl(city) {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'Asia/Seoul',
    forecast_days: '7',
  });

  return `${API_URL}?${params.toString()}`;
}

export async function fetchWeather(city, signal) {
  const response = await fetch(buildWeatherUrl(city), { signal });
  if (!response.ok) throw new Error(`날씨 서버 응답 오류 (${response.status})`);

  const data = await response.json();
  if (data.error || !data.current || !data.daily || !data.hourly) {
    throw new Error(data.reason || '날씨 데이터를 불러오지 못했습니다.');
  }
  if (!Array.isArray(data.daily.time) || !Array.isArray(data.hourly.time)) {
    throw new Error('예상하지 못한 날씨 데이터 형식입니다.');
  }

  return data;
}
