import { getWeatherInfo } from '../utils/weather.js';

export default function WeatherIcon({ code, isDay = true, size = 48, className = '' }) {
  const { icon } = getWeatherInfo(code, isDay);
  const base = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.8 };
  const sun = (
    <g>
      <circle cx="33" cy="30" r="10" fill="#FFD686" stroke="#FDBD5B" strokeWidth="1.4" />
      <path d="M33 10v6M33 44v6M13 30h6M47 30h6M19 16l4 4M43 40l4 4M47 16l-4 4M23 40l-4 4" stroke="#FFD686" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
  const cloud = (
    <path d="M19.2 48h29.4c7 0 11.6-4.2 11.6-10.1 0-5.7-4.2-9.9-9.8-10.2-2-7.7-8.2-12.7-16.3-12.7-7.8 0-14.2 5-16.1 12.3C11 28.3 6.5 32.2 6.5 38.4 6.5 44 11.3 48 19.2 48Z" fill="#F7FBFF" stroke="#BDDAEE" strokeWidth="1.5" />
  );

  let drawing;
  if (icon === 'sun') drawing = sun;
  else if (icon === 'moon') drawing = <><path d="M45 11C28 15 22 33 31 46c4 6 11 9 18 8C43 60 33 61 25 57 12 51 8 35 15 23 21 11 34 7 45 11Z" fill="#F8E3AB" stroke="#FFE7B6" strokeWidth="1.5"/><circle cx="48" cy="15" r="2" fill="#FFEFCA"/></>;
  else if (icon === 'partly' || icon === 'night-cloud') drawing = <>{icon === 'partly' ? <g transform="translate(0 -7)">{sun}</g> : <path d="M31 7c-10 5-12 17-4 25 3 3 7 4 11 4-12 6-23-1-25-11C11 16 20 8 31 7Z" fill="#F8E3AB" />}{cloud}</>;
  else if (icon === 'rain' || icon === 'storm') drawing = <>{cloud}<path d="M22 54l-3 8M37 54l-3 8M51 54l-3 8" stroke="#82C9F5" strokeWidth="3" strokeLinecap="round" />{icon === 'storm' && <path d="M39 49l-7 10h7l-4 11 13-15h-7l4-6" fill="#FFD57A" />}</>;
  else if (icon === 'snow') drawing = <>{cloud}{[22,37,52].map(x => <g key={x} transform={`translate(${x} 59)`} stroke="#B9E5F6" strokeWidth="1.6" strokeLinecap="round"><path d="M-4 0h8M0-4v8M-3-3l6 6M3-3l-6 6"/></g>)}</>;
  else if (icon === 'fog') drawing = <>{cloud}<path d="M13 55h38M20 62h27" stroke="#B5D4E5" strokeWidth="3" strokeLinecap="round" /></>;
  else drawing = cloud;

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 72 72" role="img" aria-label={getWeatherInfo(code, isDay).label} {...base}>
      {drawing}
    </svg>
  );
}
