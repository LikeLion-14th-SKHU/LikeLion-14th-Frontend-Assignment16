# 오늘의 하늘 ☁️

React + Vite + Tailwind CSS로 만든 국내 도시 날씨 대시보드입니다. 현재 날씨, 12시간 예보, 7일 예보와 체감온도 기반 옷차림 팁을 제공합니다.

## 시작하기

사전 조건: Node.js 20.19+ 또는 22.12+ 권장 (Vite와 호환되는 버전).

```bash
npm install
npm run dev
```

브라우저에서 터미널에 표시된 로컬 주소(보통 `http://localhost:5173`)를 엽니다.

```bash
npm test        # 날씨 관련 단위 테스트
npm run build   # 배포용 정적 파일 생성 → dist/
npm run preview # 빌드 결과 미리보기
```

## 주요 기능
- 서울, 인천, 부산, 대구, 대전, 광주, 제주, 춘천 날씨 조회
- 현재 기온/체감온도/습도/풍속/강수량/최고·최저기온
- 앞으로 12시간 기온·강수확률 및 7일 예보
- 체감온도와 강수 상황을 참고한 옷차림 안내
- 마지막 선택 도시 기억, 요청 취소, 실패 시 재시도
- 모바일/데스크톱 반응형 UI

## 기술 구조

```text
src/
├── api/weather.js               # 공개 날씨 API 요청
├── components/                 # UI 카드와 날씨 아이콘
├── data/cities.js              # 도시명과 좌표
├── hooks/useWeather.js         # 비동기 요청/오류/로딩
├── utils/weather.js            # 날씨 코드·옷차림·날짜
├── App.jsx                     # 페이지 구성
└── index.css                   # Tailwind CSS v4
```

기획서 `docs/PLAN.md`, 규칙 `AGENTS.md`, 구현 순서 `docs/IMPLEMENTATION_PLAN.md`, 프롬프트 `docs/PROMPTS.md`, 테스트 `docs/QA.md`도 포함되어 있습니다.

## 날씨 API
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- 별도의 API 키 없이 동작하도록 구성했습니다.
- 공개 API는 대한민국 공공데이터포털의 정부 API와는 별개입니다. 과제 채점에서 **공공기관 제공 API가 필수라면** Open-Meteo만으로 충족하는지 먼저 확인해야 합니다.
- 이용 정책(비상업적 이용 및 호출 제한 등)은 [Open-Meteo 정책](https://open-meteo.com/en/terms)을 확인해 주세요.

## Vercel 배포

1. GitHub 본인 브랜치 또는 과제 저장소로 이 프로젝트를 push합니다.
2. [Vercel](https://vercel.com/new)에서 **Add New → Project**로 저장소를 연결합니다.
3. 루트 디렉터리는 `package.json`이 있는 폴더로 지정합니다. (예: 저장소에 `today-sky/` 폴더째 올렸다면 Root Directory를 `today-sky`로 지정)
4. Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`를 확인합니다.
5. Deploy 완료 후 URL을 열어 실제 날씨 API 응답을 테스트합니다.
6. 강의 과제 저장소에 PR을 생성하고 Vercel URL과 주요 기능, 실행 방법을 PR 설명에 넣습니다.
7. `오늘의하늘_기획및AI활용기록.pdf`를 강의자에게 전달합니다.

현재 프로젝트에는 계정이 필요하므로 PR 및 실제 배포 작업이 완료되어 있지 않습니다.

## 주의
- 날씨는 외부 서비스의 예보값으로 실제 관측 및 체감과 다를 수 있습니다.
- 옷차림 추천은 개인 특성을 반영하지 않는 참고용 가이드입니다.
- 데이터가 불러와지지 않을 때는 임의 수치를 보여주지 않고 오류 상태를 표시합니다.

## 과제 정보
- 이름: 이우빈
- 학번: 202014056
