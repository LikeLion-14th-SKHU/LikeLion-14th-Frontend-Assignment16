# Speedrun Stats

Speedrun.com 공개 API 데이터를 바탕으로 게임별 스피드런 기록을 살펴보는 반응형 대시보드입니다.

- 게임을 검색하고 전체 게임 카테고리와 세부 규칙을 선택합니다.
- 검증된 기록으로 세계 최고 기록의 변화와 현재 TOP 10을 확인합니다.
- 내 기록을 입력해 같은 조건의 리더보드에서 예상 순위를 계산합니다.

## 로컬 실행

```sh
npm ci
npm run dev
```

`npm run lint`로 코드를 검사하고, `npm run build`로 `dist/`에 배포용 파일을 생성합니다. 빌드 결과는 `npm run preview`로 확인할 수 있습니다.

## 기술 및 배포

React, Vite, Tailwind CSS, React Router, Recharts를 사용합니다. 브라우저에서 Speedrun.com 공개 API를 조회합니다. Vercel용 SPA 경로 설정은 `vercel.json`에 있습니다.
