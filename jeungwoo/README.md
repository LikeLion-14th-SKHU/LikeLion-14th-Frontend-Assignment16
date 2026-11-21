# 주말축제 (Weekend Fest)

"이번 주말 뭐 하지?"에 답하는 모바일 원페이지 웹 서비스입니다.
한국관광공사 TourAPI로 전국 축제를 사진 카드로 보여 줍니다.

**배포 링크:** https://like-lion-14th-frontend-assignment1.vercel.app/

## 주요 기능

- 축제 목록: 사진·축제명·기간·지역 카드, 12개씩 [더 보기]
- 기간 필터: 이번 주말(기본) / 이번 달 / 다음 달
- 지역 필터: 전국 + 16개 시·도 (광주·전남은 하나로 합침)
- 상세 시트: 기간·주소·연락처·소개글·이용요금
- 진행 상태 뱃지: 진행 중 / 곧 종료(3일 이내) / D-n
- 찜하기: localStorage에 저장, [찜한 축제] 탭
- 지도 링크: 카카오맵·네이버지도로 열기
- 로딩 스켈레톤, 결과 없음, 에러 + [다시 시도]

## 기술 스택

- React + Vite (JavaScript)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Vercel 서버리스 함수 (`/api`)
- TourAPI `KorService2` (`searchFestival2`, `detailCommon2`, `detailIntro2`)

## 실행 방법

```bash
npm install
cp .env.example .env   # TOUR_API_KEY에 인증키를 넣는다
npx vercel dev         # 화면 + /api 함께 실행
```

- `npm run dev`(vite만 실행)에는 `/api`가 없습니다. 이때는 주소 뒤에 `?mock`을 붙이면 예시 데이터로 화면을 볼 수 있습니다.
- `?mockError`를 붙이면 에러 화면을 확인할 수 있습니다.
- `npm run build`로 배포용 빌드를 만듭니다.

## 환경변수

| 이름 | 설명 |
|---|---|
| `TOUR_API_KEY` | 공공데이터포털에서 발급받은 TourAPI 인증키 (인코딩·디코딩 키 모두 가능) |

인증키는 서버리스 함수(`api/`)에서만 사용하고, 브라우저는 TourAPI를 직접 호출하지 않습니다.
Vercel에서는 Project Settings → Environment Variables에 같은 이름으로 등록합니다.

## API

| 경로 | 설명 |
|---|---|
| `GET /api/festivals?start=YYYYMMDD&end=YYYYMMDD&areaCode=11&page=1&size=12` | 기간과 겹치는 축제 목록 (`start`, `end` 필수) |
| `GET /api/festival-detail?id=123456` | 축제 상세 (소개글·주소·연락처·이용요금) |

## 폴더 구조

```
api/             Vercel 서버리스 함수 (인증키는 여기서만 사용)
src/api/         /api 호출 + 응답 정규화
src/components/  카드, 필터, 상세 시트 등 화면 컴포넌트
src/hooks/       useFestivals(목록·필터·페이지), useLikes(찜)
src/utils/       날짜 계산, 상태 뱃지, 지도 URL
src/constants/   지역 코드표
src/App.jsx      컴포넌트 조립
```
