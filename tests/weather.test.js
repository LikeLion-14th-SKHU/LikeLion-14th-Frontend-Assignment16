import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeatherInfo, getOutfitRecommendation, getNextHours, formatKoreanDate, formatTemperature, formatWeekday } from '../src/utils/weather.js';
import { buildWeatherUrl } from '../src/api/weather.js';
import { CITIES } from '../src/data/cities.js';

test('API query contains coordinates, timezone and seven-day forecast', () => {
  const url = new URL(buildWeatherUrl(CITIES[0]));
  assert.equal(url.hostname, 'api.open-meteo.com');
  assert.equal(url.searchParams.get('latitude'), '37.5665');
  assert.equal(url.searchParams.get('timezone'), 'Asia/Seoul');
  assert.equal(url.searchParams.get('forecast_days'), '7');
});

test('WMO weather conditions map to Korean labels', () => {
  assert.equal(getWeatherInfo(0).label, '맑음');
  assert.equal(getWeatherInfo(61).label, '비');
  assert.equal(getWeatherInfo(75).label, '눈');
  assert.equal(getWeatherInfo(99).label, '뇌우');
});

test('Outfit suggestion changes with apparent temperature', () => {
  assert.ok(getOutfitRecommendation(-4, 0).items.includes('두꺼운 패딩'));
  assert.ok(getOutfitRecommendation(29, 0).items.includes('물병'));
  assert.ok(getOutfitRecommendation(17, 63).items.includes('우산'));
  assert.ok(getOutfitRecommendation(17, 0, 65).items.includes('우산'));
  assert.ok(!getOutfitRecommendation(17, 0).items.includes('우산'));
});

test('Hourly forecast starts from current clock hour', () => {
  const data = { time: ['2026-11-22T08:00','2026-11-22T09:00','2026-11-22T10:00'], temperature_2m: [1,2,3], precipitation_probability:[5,10,20], weather_code:[0,1,2] };
  const hours = getNextHours(data, '2026-11-22T09:25', 3);
  assert.equal(hours.length,2);
  assert.equal(hours[0].temperature,2);
});

test('Date rendering does not depend on browser timezone', () => {
  assert.ok(formatKoreanDate('2026-11-22T12:00').includes('11월'));
  assert.equal(formatWeekday('2026-11-22'), '일');
  assert.equal(formatTemperature(null),'—');
});
