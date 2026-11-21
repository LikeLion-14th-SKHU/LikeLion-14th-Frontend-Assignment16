import { useEffect, useState } from 'react';
import CityPicker from './components/CityPicker.jsx';
import HourlyForecast from './components/HourlyForecast.jsx';
import MetricCard from './components/MetricCard.jsx';
import WeatherIcon from './components/WeatherIcon.jsx';
import WeeklyForecast from './components/WeeklyForecast.jsx';
import { CITIES, DEFAULT_CITY_ID } from './data/cities.js';
import { useWeather } from './hooks/useWeather.js';
import { formatKoreanDate, formatTemperature, formatValue, getNextHours, getOutfitRecommendation, getWeatherInfo } from './utils/weather.js';

function getSavedCity() {
  try {
    const saved = localStorage.getItem('today-sky-city');
    return CITIES.find(city => city.id === saved)?.id ?? DEFAULT_CITY_ID;
  } catch { return DEFAULT_CITY_ID; }
}

function Symbol({ name, size = 20 }) {
  if (name === 'refresh') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14-5L4 8m0-4v4h4M4 13a8 8 0 0 0 14 5l2-2m0 4v-4h-4"/></svg>;
  if (name === 'arrow') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>;
  return null;
}

function WeatherLoading() {
  return <div role="status" aria-live="polite" className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
    <div className="h-[350px] animate-pulse rounded-[28px] bg-[#dbe5f3]"/>
    <div className="h-[350px] animate-pulse rounded-[28px] bg-[#e7edf5]"/>
    <div className="h-[150px] animate-pulse rounded-[25px] bg-white lg:col-span-2"/>
    <div className="h-[320px] animate-pulse rounded-[25px] bg-white lg:col-span-2"/>
    <span className="sr-only">날씨 정보를 불러오는 중입니다.</span>
  </div>;
}

function WeatherError({ cityName, error, onRetry }) {
  return <div role="alert" className="panel flex min-h-[360px] flex-col items-center justify-center px-8 py-14 text-center">
    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#eff5fd] text-[#527eba]">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 9v4m0 4h.01M10.3 4.5 2.4 18.2A1.7 1.7 0 0 0 3.9 21h16.2a1.7 1.7 0 0 0 1.5-2.8L13.7 4.5a1.95 1.95 0 0 0-3.4 0Z"/></svg>
    </div>
    <h2 className="mt-5 text-2xl font-bold">{cityName} 날씨를 불러오지 못했어요</h2>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">잠시 후 다시 시도해 주세요. 네트워크 연결과 API 상태를 확인해 볼 수 있어요.</p>
    <p className="mt-1 max-w-md break-words text-xs text-slate-400">{error}</p>
    <button onClick={onRetry} type="button" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#294b78] px-5 py-3 text-sm font-bold text-white hover:bg-[#1c3d66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"><Symbol name="refresh" size={17}/>다시 시도</button>
  </div>;
}

function MainWeather({ weather, city, onRetry }) {
  const current = weather.current;
  const daily = weather.daily;
  const info = getWeatherInfo(current.weather_code, Boolean(current.is_day));
  const outfit = getOutfitRecommendation(current.apparent_temperature, current.weather_code, daily.precipitation_probability_max?.[0]);
  const hours = getNextHours(weather.hourly, current.time);

  return <div className="space-y-5">
    <div className="grid items-stretch gap-5 lg:grid-cols-[1.65fr_1fr]">
      <section className="sky-panel relative isolate min-h-[350px] overflow-hidden rounded-[28px] px-7 py-7 text-white sm:px-10 sm:py-9" aria-labelledby="current-heading">
        <div className="absolute -right-20 -top-32 -z-10 h-[440px] w-[440px] rounded-full border border-white/10"/>
        <div className="absolute -right-8 -top-16 -z-10 h-[335px] w-[335px] rounded-full border border-white/10"/>
        <div className="weather-orb absolute -right-12 top-1/3 -z-10 h-[380px] w-[380px]"/>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-100"><span className="inline-block h-2 w-2 rounded-full bg-[#a4e2ca]"/>현재 날씨</div>
            <h2 id="current-heading" className="mt-3 text-2xl font-bold sm:text-[29px]">{city.name}<span className="ml-2 text-sm font-normal text-blue-100/75">{city.region}</span></h2>
            <p className="mt-1 text-sm text-blue-100/75">{formatKoreanDate(current.time)} · {current.time.slice(11, 16)} 기준</p>
          </div>
          <button onClick={onRetry} type="button" aria-label="날씨 새로고침" title="새로고침" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Symbol name="refresh" size={17}/></button>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 sm:mt-4">
          <div>
            <p className="text-[82px] font-semibold leading-none tracking-[-.085em] sm:text-[108px]">{formatTemperature(current.temperature_2m)}</p>
            <p className="mt-4 text-lg font-semibold">{info.label}</p>
            <p className="mt-1 text-sm text-blue-100/80">{info.detail}</p>
          </div>
          <div className="shrink-0"><WeatherIcon size={140} className="drop-shadow-[0_14px_32px_rgba(17,39,71,.15)] sm:scale-110" code={current.weather_code} isDay={Boolean(current.is_day)} /></div>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-[13px] text-blue-50/85">
          <span>체감 <strong className="ml-1 font-semibold text-white">{formatTemperature(current.apparent_temperature)}</strong></span>
          <span>최고 <strong className="ml-1 font-semibold text-white">{formatTemperature(daily.temperature_2m_max?.[0])}</strong></span>
          <span>최저 <strong className="ml-1 font-semibold text-white">{formatTemperature(daily.temperature_2m_min?.[0])}</strong></span>
        </div>
      </section>
      <section className="panel flex flex-col justify-between overflow-hidden px-6 py-7 sm:px-8 sm:py-8" aria-labelledby="outfit-heading">
        <div>
          <div className="flex items-center justify-between">
            <p className="eyebrow">TODAY'S TIP</p>
            <span className="rounded-full bg-[#eff6f0] px-3 py-1 text-[11px] font-bold text-[#73977f]">DAILY GUIDE</span>
          </div>
          <div className="mt-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#f5f0e8] text-[28px]" aria-hidden="true">🧥</div>
          <h2 id="outfit-heading" className="mt-4 text-[23px] font-bold leading-[1.35] tracking-tight text-[#2d3b50]">{outfit.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">{outfit.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {outfit.items.map(item => <span key={item} className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-slate-600">{item}</span>)}
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7fa9d7]"/>체감온도 기반 간단 추천 · 참고용</div>
      </section>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard icon="humidity" label="습도" value={formatValue(current.relative_humidity_2m, '%')} description="현재 대기의 상대습도" tone="blue" />
      <MetricCard icon="wind" label="풍속" value={formatValue(current.wind_speed_10m, ' km/h')} description="지상 10m 기준 풍속" tone="sky" />
      <MetricCard icon="rain" label="강수량" value={Number.isFinite(current.precipitation) ? `${current.precipitation.toFixed(1)} mm` : '—'} description="최근 관측 구간 강수량" tone="gold" />
    </div>

    {hours.length > 0 && <HourlyForecast hours={hours} />}
    <WeeklyForecast daily={daily} />
  </div>;
}

export default function App() {
  const [cityId, setCityId] = useState(getSavedCity);
  const city = CITIES.find(item => item.id === cityId) ?? CITIES[0];
  const { weather, loading, error, retry } = useWeather(city);

  useEffect(() => {
    try { localStorage.setItem('today-sky-city', cityId); } catch { /* storage may be unavailable */ }
  }, [cityId]);

  return <div className="min-h-screen bg-[#f5f7fb]">
    <div className="mx-auto max-w-[1160px] px-5 pb-12 pt-7 sm:px-8 sm:pt-10">
      <header className="flex items-center justify-between gap-4 border-b border-[#e4e9f1] pb-7">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#284b78] shadow-[0_5px_16px_rgba(40,75,120,.2)]" aria-hidden="true">
            <svg width="25" height="25" viewBox="0 0 32 32"><circle cx="15" cy="13" r="7" fill="#ffd88f"/><path d="M9 23c0-4 3-7 7-7 3 0 5 1 6 4 5-1 8 2 8 5 0 3-3 5-6 5H10c-5 0-8-4-7-7 1-2 3-3 6-3Z" fill="#fff"/></svg>
          </div>
          <div><p className="text-[19px] font-extrabold tracking-[-.05em] text-[#243b59]">오늘의 하늘</p><p className="text-[10px] font-semibold tracking-[.15em] text-[#91a1b6]">YOUR DAILY WEATHER NOTE</p></div>
        </div>
        <a className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#547399] ring-1 ring-[#e3e9f2] transition hover:bg-blue-50 sm:inline-flex" href="https://open-meteo.com/en/docs" target="_blank" rel="noreferrer">API 데이터 출처 <Symbol name="arrow" size={14}/></a>
      </header>

      <main>
        <div className="pb-7 pt-10 sm:pb-8 sm:pt-12">
          <p className="eyebrow">A LITTLE WEATHER, A BETTER DAY</p>
          <h1 className="mt-3 text-[30px] font-extrabold leading-[1.3] tracking-[-.065em] text-[#263b55] sm:text-[41px]">오늘, 어떤 하늘을 만날까요<span className="text-[#749fce]">?</span></h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-500 sm:text-[15px]">날씨부터 옷차림까지, 오늘 필요한 정보를 가볍게 확인하세요.</p>
        </div>

        <div className="mb-5 rounded-[23px] border border-[#e6ebf2] bg-[#f9fafc] px-4 py-4 sm:px-6 sm:py-5"><CityPicker selectedId={cityId} onSelect={setCityId}/></div>

        {loading ? <WeatherLoading/> : error ? <WeatherError cityName={city.name} error={error} onRetry={retry}/> : weather ? <MainWeather weather={weather} city={city} onRetry={retry}/> : null}
      </main>

      <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-[#e4e9f1] pt-6 text-xs leading-6 text-[#8a98ac] sm:flex-row sm:items-center">
        <p><strong className="font-bold text-[#5c7496]">오늘의 하늘</strong> · 오늘을 위한 작은 날씨 노트</p>
        <p>날씨 데이터: <a href="https://open-meteo.com/" className="underline decoration-slate-300 underline-offset-4 hover:text-[#4e78b4]" target="_blank" rel="noreferrer">Open-Meteo</a> · 참고용 예보, 공식 특보 확인 권장</p>
      </footer>
    </div>
  </div>;
}
