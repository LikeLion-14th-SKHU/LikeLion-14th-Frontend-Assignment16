# 숨쉬는 서울

서울 25개 구의 실시간 대기질을 보고, **지금 산책·운동·환기를 해도 되는지** 바로 알려 주는 모바일 웹.

- 기획서: [PLANNING.md](PLANNING.md)
- AI 규칙 파일: [AGENTS.md](AGENTS.md)
- 공공 API: 서울 열린데이터광장 · 서울시 권역별 실시간 대기환경 현황 (`RealtimeCityAir`)

## 실행

```bash
npm install
cp .env.example .env   # SEOUL_API_KEY에 서울 열린데이터광장 인증키 입력 (비우면 sample 키로 5개 구만)
npm run dev
```

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 (`/api/air` 서버 함수 포함) |
| `npm run build` | 배포용 빌드 |
| `npm run lint` | oxlint 검사 |
| `npm test` | 등급 계산 경계값 검사 |

## 구조

```
api/air.js              Vercel 서버 함수 — 인증키 보관, http API를 https로 중계, XML 에러를 JSON으로
src/api/air.js          브라우저 → /api/air 호출
src/hooks/              useAir(불러오기·새로고침), useSavedDistrict(선택한 구 기억)
src/utils/airQuality.js 환경부 등급 기준, 종합 판정, 활동 가이드
src/components/         Header, DistrictPicker, VerdictCard, ActivityGuide, PollutantGrid, RankingList, GradeBadge
```

## 왜 서버 함수를 거치나

1. 서울 API는 **http만** 지원한다 → https인 Vercel 페이지에서 직접 부르면 Mixed Content로 막힌다.
2. `VITE_` 변수는 빌드 결과에 그대로 들어간다 → 인증키는 `SEOUL_API_KEY`로 서버에서만 읽는다.
3. 같은 함수를 `vite.config.js`에서 개발 서버에도 연결해, 로컬과 배포 환경이 같은 코드로 동작한다.

## Vercel 배포

1. Vercel → Add New Project → 이 레포 Import
2. **Root Directory**: `seokhwan/assignment2-breathe-seoul` (Framework: Vite 자동 인식)
3. Environment Variables: `SEOUL_API_KEY` = 발급받은 인증키
4. Deploy → `https://…vercel.app/api/air`가 JSON을 돌려주면 성공
