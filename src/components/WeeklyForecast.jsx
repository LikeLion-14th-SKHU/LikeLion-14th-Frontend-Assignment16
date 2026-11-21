import WeatherIcon from './WeatherIcon.jsx';
import { formatTemperature, formatWeekday, getWeatherInfo } from '../utils/weather.js';

export default function WeeklyForecast({ daily }) {
  if (!daily?.time) return null;
  const maxValues = daily.temperature_2m_max.filter(Number.isFinite);
  const minValues = daily.temperature_2m_min.filter(Number.isFinite);
  const max = maxValues.length ? Math.max(...maxValues) : 30;
  const min = minValues.length ? Math.min(...minValues) : 0;
  const range = Math.max(max - min, 1);

  return (
    <section className="panel p-5 sm:p-7" aria-labelledby="weekly-heading">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow">7-DAY FORECAST</p>
          <h2 id="weekly-heading" className="mt-1 text-xl font-bold text-[#24354d]">일주일 날씨</h2>
        </div>
        <p className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400">오늘 포함 7일</p>
      </div>
      <div className="divide-y divide-slate-100">
        {daily.time.map((day, i) => {
          const low = daily.temperature_2m_min?.[i];
          const high = daily.temperature_2m_max?.[i];
          const left = Number.isFinite(low) ? ((low - min) / range) * 100 : 0;
          const width = Number.isFinite(high) && Number.isFinite(low) ? Math.max(((high - low) / range) * 100, 5) : 0;
          return (
            <div key={day} className="grid grid-cols-[45px_1fr_44px_40px] items-center gap-2 py-3.5 sm:grid-cols-[70px_1fr_70px_140px] sm:gap-4">
              <span className={`text-sm font-bold ${i === 0 ? 'text-[#447bc0]' : 'text-[#34445a]'}`}>{i === 0 ? '오늘' : formatWeekday(day)}</span>
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
                <WeatherIcon size={38} code={daily.weather_code?.[i]} />
                <span className="hidden truncate text-sm text-slate-500 sm:inline">{getWeatherInfo(daily.weather_code?.[i]).label}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#85a8d3] sm:gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8 8 5 12 5 16a7 7 0 0 0 14 0c0-4-3-8-7-14Z"/></svg>
                {daily.precipitation_probability_max?.[i] == null ? '—' : `${daily.precipitation_probability_max[i]}%`}
              </div>
              <div className="flex items-center justify-end gap-2 sm:gap-3">
                <span className="hidden text-sm font-medium text-slate-400 sm:block">{formatTemperature(low)}</span>
                <div className="hidden h-[6px] w-16 overflow-hidden rounded-full bg-[#eaf0f7] sm:relative sm:block">
                  <span className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#8fb4df] to-[#f6c389]" style={{ left: `${left}%`, width: `${width}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-bold text-[#34445a]">{formatTemperature(high)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-xs text-slate-400">예보는 기상 상황과 데이터 갱신에 따라 달라질 수 있습니다.</p>
    </section>
  );
}
