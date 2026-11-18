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

**선택 기능 (모두 구현):** 7 등급별 둘러보기(`/search?grade=`) · 8 `.ics` 내보내기(상세) · 9 공유 링크(`/share?c=`) · 10 다크 모드

**제외:** 로그인, 푸시·이메일 알림 (서버가 필요해서 제외)

**페이지** (모바일 우선, 하단 탭바: 홈 · 검색 · 캘린더)

| 페이지 | 주소 | 기능 |
|---|---|---|
| 홈 | `/` | 검색창 → 곧 마감 → 내 자격증 D-day 카드 |
| 검색 | `/search?q=` | 결과 목록 + 별 버튼으로 담기 |
| 상세 | `/cert/:종목명` | 회차별 일정 카드 + 별 버튼으로 담기 |
| 캘린더 | `/calendar?month=YYYY-MM&view=mine\|all` | 월 이동, 전체·관심 필터, 월간 그리드 |
| 공유 | `/share?c=종목명,...` | 공유 받은 목록 + 모두 담기 (탭바에는 없어요) |

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
- `npm run data:certs`: `docs/`의 종목 목록 CSV(EUC-KR)를 UTF-8 `src/data/certs.json`으로 변환해요. `certs.json`은 직접 고치지 말고 CSV를 바꾼 뒤 이 명령으로 다시 만들어요.
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
  data/certs.json     # 종목 목록 (npm run data:certs로 생성)
  index.css           # Tailwind import + @theme 토큰
scripts/
  build-certs.mjs     # CSV(EUC-KR) → certs.json
docs/
  기획서.md
  한국산업인력공단_국가자격 종목 목록 정보_*.csv   # 원본 (EUC-KR)
```

다크 모드: `src/index.css`의 `:root[data-theme="dark"]`에서 같은 토큰의 값만 바꿔요. 그래서 컴포넌트에 `dark:` 변형을 쓰지 않고, 새 색이 필요하면 두 곳(`@theme`와 다크 블록)에 모두 추가해요. `data-theme`은 `index.html`의 인라인 스크립트가 첫 렌더링 전에 정하고(localStorage `cert-dday:theme` → 시스템 설정 순), `hooks/useTheme.js`가 바꿔요. 흰 글자에는 `text-white` 대신 `text-surface`를 써요.

그 밖의 모듈: `lib/ics.js`(RFC 5545, 75바이트 줄 접기, 고정 UID), `lib/share.js`(공유 링크의 종목명은 `findCert`로 검증해요. 종목명에는 쉼표가 없어요), `components/CertList.jsx`(검색·둘러보기·공유 목록 공통).

디자인 토큰 이름: `brand-*`(남색 포인트), `surface`/`canvas`/`line`/`ink`/`ink-muted`(바탕·글자), `apply`/`exam`/`result`와 각각의 `-soft`(접수·시험·발표), `urgent`/`soon`과 각각의 `-soft`(긴급도). 예: `bg-apply-soft text-apply`. 공통 빈 상태 화면은 `components/EmptyState.jsx`를 써요.

아이콘: 이모지는 쓰지 않고 `lucide-react`만 써요(문구, 데이터, 주석, 문서 포함). 크기는 `lib/icons.js`의 `ICON`(xs 14, sm 16, md 20, lg 28)으로만 정하고, 선 굵기 2는 `main.jsx`의 `LucideProvider`가 정해요. 색은 `currentColor`라서 `text-*` 토큰을 따라요. 아이콘만 있는 버튼에는 `aria-label`을 붙여요. `EmptyState`의 `icon`에는 문자열이 아니라 아이콘 컴포넌트를 넘겨요(예: `icon={Star}`).

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
- API 핵심 사실: `implYy`는 필수예요. `numOfRows`는 최대 50이고, 날짜는 `YYYYMMDD` 문자열(없으면 `""`)이에요. 오류도 HTTP 200에 `header.resultCode !== "00"`으로 와요. **응답에 종목명이 없고**, 일정은 등급(기사, 기능사 등)·회차 단위로 와요. 프록시는 `resultCode`가 `"00"`이 아니면 502와 `no-store`로 돌려줘요. 게이트웨이 오류(`OpenAPI_ServiceResponse`)는 `dataFormat`에 따라 XML이나 JSON으로 오는데, 프록시가 둘 다 `{ header: { resultCode, resultMsg } }`로 바꿔요. 화면에 보일 오류 문구는 `lib/api.js`의 `errorMessage()`에서 한국어로 바꿔요.
- 일정 API를 쓰는 화면의 로딩과 오류는 `components/ScheduleStatus.jsx`로 처리해요. 페이지 렌더링 오류는 `Layout`의 `ErrorBoundary`가 잡아요.
- **종목과 일정의 연결** (기획서 1-2절): 종목 목록(`src/data/certs.json`)에도 종목 코드가 없어요. 국가기술자격의 계열명(기술사, 기능장, 기사, 기능사)을 일정 `description`의 등급과 맞춰서 연결해요(`lib/schedule.js`의 `gradeOf`). 산업기사는 "기사"에 속하므로 화면에는 `scheduleLabel()`로 "기사·산업기사 일정"이라고 표시해요. 국가전문자격은 일정과 연결할 수 없어서 "일정 미제공"으로 표시해요. 회차는 `groupRounds()`로 묶어요. 필기 접수 기간만 다른 행만 합치는데, 기능사는 같은 회차 번호에 다른 일정이 있기 때문이에요.
- 관심 자격증은 `useFavorites()`로만 읽고 써요. localStorage 키는 `cert-dday:favorites`(종목명 배열)이고, `useSyncExternalStore`로 모든 컴포넌트와 다른 탭이 같은 값을 봐요. 저장소 접근은 항상 try/catch로 감싸요.
- D-day와 곧 마감 계산은 `lib/dday.js`의 순수 함수예요. `nextMilestone`은 진행 중인 기간이면 끝나는 날, 아직 안 온 기간이면 시작하는 날을 기준으로 해요. `registrationAlerts`는 접수 중이거나 7일 안에 접수가 시작되는 회차를 모아요. 일정은 등급 공통이라서 화면 문구에 특정 종목이 그 회차에 시행된다고 단정하지 않아요("같은 등급"으로 표시해요).
- 일정 데이터는 `useExamSchedule()`(등급별로 묶은 것은 `useRoundsByGrade()`)로만 받아요. 올해와 내년의 국가기술자격 일정을 한 번만 받아서 모듈 캐시로 페이지끼리 공유해요. 페이지마다 따로 fetch하지 않아요.
- 달력과 날짜 계산은 라이브러리 없이 기본 `Date`로 구현해요. D-day는 시간을 빼고 날짜 단위로 계산해요.
- 색은 `@theme` 토큰으로만 써요. 컴포넌트에 hex 값을 직접 쓰지 않아요.

## 완료 조건

- 배포된 Vercel URL에서 필수 기능 1~6이 모두 동작해요.
  - 검색 → 상세 → 별 버튼으로 담기 → 홈 D-day에 반영되는 흐름이 이어져요.
  - 곧 마감 섹션과 긴급도 배지가 날짜에 맞게 표시돼요.
  - 캘린더에 접수·시험·발표가 색으로 구분되고, 일정을 누르면 상세로 이동해요.
- 모바일 폭(360px)에서 가로 스크롤 없이 사용할 수 있어요.
- 로딩, 빈 상태(담은 자격증 없음, 검색 결과 없음), API 오류 화면이 있어요.
- 브라우저 네트워크 요청에 서비스키가 드러나지 않아요.
- `npm run lint`와 `npm run build`가 오류 없이 통과해요.
