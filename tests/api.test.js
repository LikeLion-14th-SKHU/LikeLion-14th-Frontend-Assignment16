import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWeather } from '../src/api/weather.js';
import { CITIES } from '../src/data/cities.js';

test('API response validation accepts matching shape', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ current: { temperature_2m: 12 }, daily: {time:['2026-11-22']}, hourly:{time:['2026-11-22T11:00']} }) });
    const data = await fetchWeather(CITIES[0]);
    assert.equal(data.current.temperature_2m, 12);
  } finally { globalThis.fetch = original; }
});

test('Malformed weather responses do not silently render fake weather', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ current: {}, daily: {} }) });
    await assert.rejects(() => fetchWeather(CITIES[0]), /날씨 데이터를 불러오지 못했습니다/);
  } finally { globalThis.fetch = original; }
});
