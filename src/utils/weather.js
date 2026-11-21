export function getWeatherInfo(code, isDay = true) {
  const num = Number(code);
  if (num === 0) return { label: '맑음', mood: 'clear', detail: '맑고 환한 하늘이에요', icon: isDay ? 'sun' : 'moon' };
  if ([1, 2].includes(num)) return { label: '대체로 맑음', mood: 'partly', detail: '구름 사이로 햇살이 보여요', icon: isDay ? 'partly' : 'night-cloud' };
  if (num === 3) return { label: '흐림', mood: 'cloudy', detail: '구름이 하늘을 덮었어요', icon: 'cloud' };
  if ([45, 48].includes(num)) return { label: '안개', mood: 'foggy', detail: '시야가 흐릴 수 있어요', icon: 'fog' };
  if ([51, 53, 55, 56, 57].includes(num)) return { label: '이슬비', mood: 'rainy', detail: '잔잔한 비가 내릴 수 있어요', icon: 'rain' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(num)) return { label: '비', mood: 'rainy', detail: '우산을 챙기는 게 좋아요', icon: 'rain' };
  if ([71, 73, 75, 77, 85, 86].includes(num)) return { label: '눈', mood: 'snowy', detail: '눈이 내릴 수 있어요', icon: 'snow' };
  if ([95, 96, 99].includes(num)) return { label: '뇌우', mood: 'stormy', detail: '천둥과 번개에 주의하세요', icon: 'storm' };
  return { label: '날씨 정보', mood: 'cloudy', detail: '하늘의 변화를 살펴보세요', icon: 'cloud' };
}

export function getOutfitRecommendation(feelsLike, weatherCode, rainProbability = 0) {
  if (!Number.isFinite(Number(feelsLike)) || feelsLike === null) {
    return { title: '옷차림 정보를 준비 중이에요', description: '체감온도가 확인되면 옷차림을 추천해 드릴게요.', items: ['체감온도 확인'] };
  }

  const temp = Number(feelsLike);
  let result;
  if (temp < 0) result = { title: '따뜻하게, 여러 겹으로', description: '한파에 대비해서 보온에 신경 써 주세요.', items: ['두꺼운 패딩', '목도리', '장갑'] };
  else if (temp < 8) result = { title: '포근한 겉옷이 필요한 날', description: '찬 바람을 막아 줄 외투를 추천해요.', items: ['코트·패딩', '니트', '긴바지'] };
  else if (temp < 16) result = { title: '가벼운 아우터를 챙겨요', description: '아침과 저녁에는 쌀쌀할 수 있어요.', items: ['자켓·가디건', '긴팔', '긴바지'] };
  else if (temp < 23) result = { title: '산뜻하게 입기 좋은 날', description: '가볍고 편안한 옷차림이 잘 어울려요.', items: ['긴팔·얇은 셔츠', '면바지', '가벼운 겉옷'] };
  else if (temp < 28) result = { title: '시원한 옷을 추천해요', description: '활동하기 편한 통기성 좋은 옷이 좋아요.', items: ['반팔', '얇은 바지', '물병'] };
  else result = { title: '무더위를 조심하세요', description: '그늘에서 쉬고 수분을 충분히 섭취해요.', items: ['얇은 반팔', '모자', '물병'] };

  const rain = ['rainy', 'stormy'].includes(getWeatherInfo(weatherCode).mood) || Number(rainProbability) >= 50;
  return {
    ...result,
    items: rain ? [...result.items, '우산'] : result.items,
    description: rain ? `${result.description} 비 예보가 있어 우산도 챙겨주세요.` : result.description,
  };
}

export function formatTemperature(value) {
  return Number.isFinite(Number(value)) && value !== null ? `${Math.round(Number(value))}°` : '—';
}

export function formatValue(value, unit = '') {
  return Number.isFinite(Number(value)) && value !== null ? `${Math.round(Number(value))}${unit}` : '—';
}

export function getNextHours(hourly, currentTime, count = 12) {
  if (!hourly?.time?.length || !currentTime) return [];
  const currentHour = currentTime.slice(0, 13);
  const startIndex = hourly.time.findIndex(time => time.slice(0, 13) >= currentHour);
  if (startIndex < 0) return [];
  return hourly.time.slice(startIndex, startIndex + count).map((time, offset) => ({
    time,
    temperature: hourly.temperature_2m?.[startIndex + offset] ?? null,
    precipitationProbability: hourly.precipitation_probability?.[startIndex + offset] ?? null,
    weatherCode: hourly.weather_code?.[startIndex + offset] ?? 3,
  }));
}

export function formatKoreanDate(dateValue) {
  // dateValue is an ISO local calendar date from Open-Meteo, not an instant.
  if (!dateValue) return '';
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number);
  if (![year, month, day].every(Number.isInteger)) return '';
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'UTC', month: 'long', day: 'numeric', weekday: 'long' }).format(date);
}

export function formatWeekday(dateValue) {
  if (!dateValue) return '';
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'UTC', weekday: 'short' }).format(date);
}
