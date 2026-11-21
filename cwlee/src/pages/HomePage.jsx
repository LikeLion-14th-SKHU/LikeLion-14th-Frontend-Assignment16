import GameSearch from '../components/GameSearch.jsx'

export default function HomePage() {
  return <div className="mx-auto max-w-3xl space-y-8">
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">스피드런 기록 탐색</h1>
      <p className="text-lg text-stone-700">게임을 검색해 세계 기록의 변화와 내 기록의 예상 순위를 확인하세요.</p>
    </div>
    <GameSearch />
  </div>
}
