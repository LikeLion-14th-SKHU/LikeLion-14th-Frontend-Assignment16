import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchGames } from '../api/speedrun.js'
import { useRequest } from '../hooks/useGameRecords.js'
import RequestStatus from './RequestStatus.jsx'

export default function GameSearch() {
  const [input, setInput] = useState('')
  const name = input.trim()
  const load = useCallback(signal => searchGames(name, signal), [name])
  const request = useRequest(name ? load : null, 300)

  return <section className="panel space-y-4">
    <label htmlFor="game-search" className="block font-semibold">게임 이름</label>
    <input id="game-search" className="field w-full" type="search" value={input}
      placeholder="예: Super Mario 64" onChange={event => setInput(event.target.value)} />
    <RequestStatus request={request} loading="게임 검색 중…" />
    {request.data?.length === 0 && <p role="status">검색 결과가 없습니다.</p>}
    {request.data?.length > 0 && <ul className="grid gap-2 sm:grid-cols-2">
      {request.data.map(game => <li key={game.id}>
        <Link className="flex min-h-14 items-center gap-3 rounded-lg border border-stone-300 p-3 hover:border-blue-600 hover:bg-blue-50"
          to={'/games/' + game.id}>
          {game.assets?.['cover-tiny']?.uri && <img src={game.assets['cover-tiny'].uri} alt="" className="h-9 w-7 rounded object-cover" />}
          {game.names.international}
        </Link>
      </li>)}
    </ul>}
  </section>
}
