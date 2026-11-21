import WeatherIcon from './WeatherIcon.jsx';
import { formatTemperature } from '../utils/weather.js';

export default function HourlyForecast({ hours }) {
  return (
    <section className="panel p-5 sm:p-7" aria-labelledby="hourly-heading">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="eyebrow">HOURLY FORECAST</p>
          <h2 id="hourly-heading" className="mt-1 text-xl font-bold text-[#24354d]">시간대별 날씨</h2>
        </div>
        <p className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400">현재부터 12시간</p>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {hours.map((hour, index) => (
          <div key={hour.time} className={`flex min-w-[82px] flex-1 flex-col items-center rounded-2xl px-3 py-4 ${index === 0 ? 'bg-[#eef4fd] ring-1 ring-[#d7e6fc]' : 'bg-[#f8fafc]'}`}>
            <span className={`text-xs font-bold ${index === 0 ? 'text-[#4775b6]' : 'text-slate-400'}`}>{index === 0 ? '지금' : `${hour.time.slice(11, 13)}시`}</span>
            <WeatherIcon code={hour.weatherCode} isDay={Number(hour.time.slice(11, 13)) >= 6 && Number(hour.time.slice(11, 13)) < 19} size={43} className="my-2" />
            <span className="text-base font-bold text-[#283c57]">{formatTemperature(hour.temperature)}</span>
            <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#82a4d1]"><span aria-hidden="true">●</span>{hour.precipitationProbability == null ? '—' : `${hour.precipitationProbability}%`}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
