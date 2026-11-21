## Description
- Open-Meteo API를 활용한 국내 도시 날씨 대시보드 **오늘의 하늘** 구현
- 현재 날씨, 체감온도, 습도·풍속·강수량, 12시간 및 7일 예보, 옷차림 안내 제공

## Important content
- `src/api/weather.js`: Open-Meteo Forecast API 연동 및 응답 검증
- `src/hooks/useWeather.js`: 로딩·에러 처리, 재시도, 요청 취소
- `src/utils/weather.js`: WMO 날씨 코드·옷차림 추천 함수
- `AGENTS.md`: AI 작업 규칙 및 개선 내용 기록

## Test
- `npm test` — 외부 API 모킹을 포함한 7개 테스트 통과 (제작 환경 기준)
- `npm run build` — 프로젝트 파일을 받은 뒤 사용자 환경에서 실행하여 체크 필요

## Deploy
- Vercel: [배포 후 URL 입력]

## Reference
- https://open-meteo.com/en/docs
- `docs/PLAN.md`, `docs/PROMPTS.md`, `docs/QA.md`

## Image
- [실제 화면 캡처 첨부]
