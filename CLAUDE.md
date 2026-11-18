# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

상세 기획은 `docs/기획서.md`에 있어요. 이 파일과 기획서가 다르면 기획서를 따르고, 둘 다 함께 고쳐요.

## 프로젝트 이름

**자격증 D-day** (가칭)

## 만들 것 (목적)

공공데이터포털의 **한국산업인력공단 국가자격 시험일정 조회 서비스** API로 대학생용 자격증 일정 관리 웹 서비스를 만들어요. 관심 자격증의 접수·시험·발표 일정을 D-day와 월간 캘린더로 보여주고, 접수 중이거나 마감이 7일 이내인 시험을 강조해요.

- 주 타깃: 취업 준비 중인 3~4학년
- 보조 타깃: 스펙을 미리 쌓으려는 1~2학년

## 포함할 내용

**필수 기능 (MVP)**

1. 자격증 검색 (종목 이름)
2. 관심 자격증 담기·빼기 (localStorage)
3. 내 D-day 대시보드 (담은 자격증의 다음 일정까지 남은 날)
4. 접수 중·곧 마감(7일 이내) 모아보기
5. 월간 캘린더 (접수·시험·발표를 색으로 구분)
6. 자격증 상세 (회차별 필기·실기 일정 표)

**선택 기능:** 7 분야별 둘러보기 · 8 `.ics` 내보내기 · 9 공유 링크 · 10 다크 모드

**제외:** 로그인, 푸시·이메일 알림 (서버가 필요해서 제외)

**페이지** (모바일 우선, 하단 탭바: 홈 · 검색 · 캘린더)

| 페이지 | 주소 | 기능 |
|---|---|---|
| 홈 | `/` | 검색창 → 곧 마감 → 내 자격증 D-day 카드 |
| 검색 | `/search?q=` | 결과 목록 + ⭐ 담기 |
| 상세 | `/cert/:종목코드` | 회차별 일정 표 + ⭐ 담기 |
| 캘린더 | `/calendar` | 월 이동, 전체·관심 필터, 월간 그리드 |

**디자인:** 깔끔한 생산성 앱 스타일이에요. 흰 배경, 남색 포인트, Pretendard 글꼴을 써요. 접수·시험·발표는 각각 고정된 색으로 표시하고 모든 화면에서 같은 색을 써요. 긴급도 배지는 D-3 이하 빨강, D-7 이하 주황이에요.

## 기술 스택

- React 19 + Vite 8, JavaScript(`.jsx`). TypeScript는 쓰지 않아요.
- Tailwind CSS v4. `vite.config.js`에서 `@tailwindcss/vite` 플러그인으로 연결해요. `tailwind.config.js`나 PostCSS 설정은 없어요. 색과 글꼴 토큰은 `src/index.css`의 `@theme`에 정의해요.
- `react-router`: 페이지 이동에 써요. `react-router` 패키지에서 바로 import해요(`react-router-dom`은 쓰지 않아요). 라우트는 `src/App.jsx`에 있고, 모든 페이지는 `Layout`(헤더 + 하단 탭바) 안에서 렌더링돼요. `vercel.json`이 `/api/` 밖의 모든 경로를 `index.html`로 돌려서 `/cert/...`로 바로 들어와도 동작해요.
- Vercel: 배포와 Vercel Function(`/api`)에 써요.
- Oxlint: `react/rules-of-hooks`는 error, `react/only-export-components`는 warn이에요. 컴포넌트 파일에서는 컴포넌트만 export해야 Fast Refresh가 유지돼요.

**명령어**

- `npm run dev`: 개발 서버를 실행해요. `vite.config.js`의 `localApi` 플러그인이 `/api/<이름>`을 `api/<이름>.js`의 `GET` 함수로 처리해서, Vercel CLI 없이도 프록시가 동작해요. 서비스키는 `.env.local`의 `DATA_GO_KR_KEY`에서 읽어요(`.env.example` 참고).
- `api/*.js`는 Web 표준 형식(`export function GET(request)` → `Response` 반환)으로 써요. 이 형식이어야 로컬 플러그인과 Vercel 양쪽에서 똑같이 동작해요. Node의 `(req, res)` 형식은 쓰지 않아요.
- `npm run build` / `npm run preview`
- `npm run lint`
- 테스트 러너는 없어요.

## 폴더 구조

```
api/
  exams.js            # Vercel Function: 공공데이터포털 API 프록시
src/
  pages/              # Home, Search, CertDetail, Calendar
  components/         # 카드, 배지, 탭바, 달력 그리드 등
  hooks/              # useFavorites (localStorage), useExamSchedule (fetch)
  lib/                # dday.js (날짜 계산), api.js (fetch 래퍼)
  index.css           # Tailwind import + @theme 토큰
docs/
  기획서.md
```

디자인 토큰 이름: `brand-*`(남색 포인트), `surface`/`canvas`/`line`/`ink`/`ink-muted`(바탕·글자), `apply`/`exam`/`result`와 각각의 `-soft`(접수·시험·발표), `urgent`/`soon`과 각각의 `-soft`(긴급도). 예: `bg-apply-soft text-apply`. 공통 빈 상태 화면은 `components/EmptyState.jsx`를 써요.

## 작업 방식

- 기능은 한 번에 하나씩 만들고, 브라우저에서 동작을 확인한 뒤 다음 기능으로 넘어가요.
- 진행 순서: 1주 API 확인·프록시·첫 배포 → 2주 라우터·탭바·검색·상세 → 3주 담기·홈 D-day·곧 마감 → 4주 캘린더·반응형·빈 상태·에러 처리 → 이후 선택 기능.
- 기능 하나가 끝날 때마다 `npm run lint`를 실행하고 커밋해요. 아직 git 저장소가 아니라서 처음에 `git init`부터 해요.

## 규칙 (제약)

- 프론트엔드 중심으로 만들어요. 서버 코드는 `api/`의 Vercel Function 프록시만 둬요. DB와 로그인은 만들지 않아요.
- 공공데이터포털 API는 브라우저에서 직접 호출하지 않아요. 항상 `/api/exams`를 거쳐요.
- 서비스키는 환경변수 `DATA_GO_KR_KEY`에만 둬요. `VITE_` 접두사를 붙이면 브라우저 번들에 포함되므로 절대 붙이지 않아요. `.env*` 파일은 커밋하지 않아요.
- 프록시 응답에는 `Cache-Control: s-maxage=86400`을 걸어 호출 한도를 아껴요.
- **API 필드 이름을 추측하지 않아요.** 확인된 파라미터와 응답 필드는 `docs/기획서.md` 1-1절에 있어요. 거기에 없는 필드를 쓰려면 먼저 실제로 호출해서 확인하고 1-1절에 기록해요.
- API 핵심 사실: `implYy`는 필수예요. `numOfRows`는 최대 50이고, 날짜는 `YYYYMMDD` 문자열(없으면 `""`)이에요. 오류도 HTTP 200에 `header.resultCode !== "00"`으로 와요. **응답에 종목명이 없고**, 일정은 등급(기사, 기능사 등)·회차 단위로 와요. 프록시는 `resultCode`가 `"00"`이 아니면 502와 `no-store`로 돌려줘요.
- 달력과 날짜 계산은 라이브러리 없이 기본 `Date`로 구현해요. D-day는 시간을 빼고 날짜 단위로 계산해요.
- 색은 `@theme` 토큰으로만 써요. 컴포넌트에 hex 값을 직접 쓰지 않아요.

## 완료 조건

- 배포된 Vercel URL에서 필수 기능 1~6이 모두 동작해요.
  - 검색 → 상세 → ⭐ 담기 → 홈 D-day에 반영되는 흐름이 이어져요.
  - 곧 마감 섹션과 긴급도 배지가 날짜에 맞게 표시돼요.
  - 캘린더에 접수·시험·발표가 색으로 구분되고, 일정을 누르면 상세로 이동해요.
- 모바일 폭(360px)에서 가로 스크롤 없이 사용할 수 있어요.
- 로딩, 빈 상태(담은 자격증 없음, 검색 결과 없음), API 오류 화면이 있어요.
- 브라우저 네트워크 요청에 서비스키가 드러나지 않아요.
- `npm run lint`와 `npm run build`가 오류 없이 통과해요.
