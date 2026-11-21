import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import GamePage from './pages/GamePage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <header className="border-b-2 border-blue-700 bg-[#fcfcfd]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <Link to="/" className="font-display text-3xl font-medium italic tracking-tight">Speedrun <span className="text-blue-700">Stats</span></Link>
          <a href="https://www.speedrun.com/" className="text-sm text-stone-700 hover:text-blue-800">데이터 출처 · Speedrun.com</a>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games/:gameId/:categoryId?" element={<GamePage />} />
          <Route path="*" element={<p>페이지를 찾을 수 없습니다. <Link className="underline" to="/">게임 검색</Link></p>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
