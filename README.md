# 🎓 자격증 D-day

관심 자격증의 접수·시험·발표 일정을 D-day와 월간 캘린더로 챙겨 주는 대학생용 웹 서비스예요.
공공데이터포털의 **한국산업인력공단 국가자격 시험일정 조회 서비스**와 **국가자격 종목 목록 정보**를 사용해요.

- 🔍 자격증 이름으로 검색 (국가기술자격 513개 + 국가전문자격 100개)
- ⭐ 관심 자격증 담기 (브라우저에 저장, 로그인 없음)
- 🔥 지금 접수 중이거나 7일 안에 접수가 시작되는 시험 모아보기
- 📅 월간 캘린더 (접수·시험·발표 색 구분)

기획과 API 확인 내용은 [`docs/기획서.md`](docs/기획서.md)에 있어요.

## 실행

1. [공공데이터포털](https://www.data.go.kr)에서 "한국산업인력공단_국가자격 시험일정 조회 서비스"를 활용신청해요.
2. `.env.example`을 `.env.local`로 복사하고, `DATA_GO_KR_KEY`에 **일반 인증키 (Decoding)** 값을 넣어요.
3. 실행해요.

```bash
npm install
npm run dev
```

`npm run dev` 하나로 화면과 API 프록시(`/api/exams`)가 함께 실행돼요.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 배포용 빌드 |
| `npm run lint` | Oxlint 검사 |
| `npm run data:certs` | `docs/`의 종목 목록 CSV(EUC-KR)를 `src/data/certs.json`으로 변환 |

## 배포 (Vercel)

1. GitHub에 저장소를 올리고 Vercel에서 Import해요. (프레임워크: Vite, 설정 변경 없음)
2. Vercel 프로젝트의 **Settings → Environment Variables**에 `DATA_GO_KR_KEY`를 등록해요.
3. 배포 후 `https://<배포 주소>/api/exams?implYy=2026&numOfRows=1`에서 `"resultCode":"00"`이 보이면 정상이에요.

서비스키는 서버(Vercel Function)에서만 쓰여서 브라우저에 노출되지 않아요.

## 알아 둘 점

- 시험일정 API는 종목별이 아니라 **등급(기술사·기능장·기사·기능사)별** 일정을 줘요. 그래서 같은 등급의 자격증은 같은 일정이 보이고, 종목별 시행 여부는 Q-Net에서 확인해야 해요.
- 국가전문자격은 일정 API에서 종목을 구분할 수 없어 "일정 미제공"으로 표시해요.
