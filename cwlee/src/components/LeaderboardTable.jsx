import { formatTime } from '../utils/records.js'
import RequestStatus from './RequestStatus.jsx'

export default function LeaderboardTable({ request }) {
  const board = request.data
  const names = new Map((board?.players?.data ?? []).map(player => [player.id, player.names?.international ?? player.name]))
  return <section className="panel min-w-0 space-y-4">
    <h2 className="section-title">세계 TOP 10</h2>
    <RequestStatus request={request} />
    {board?.runs.length === 0 && <p>등록된 기록이 없습니다.</p>}
    {board?.runs.length > 0 && <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-stone-700"><tr>
          <th scope="col" className="pb-2 pl-2 pr-3">순위</th><th scope="col" className="pb-2 pr-3">선수</th><th scope="col" className="pb-2 pr-2 text-right">기록</th>
        </tr></thead>
        <tbody>{board.runs.map(({ place, run }) => <tr key={run.id} className={place === 1 ? "border-t border-blue-100 bg-blue-50 font-semibold" : "border-t border-stone-200"}>
          <td className="py-3 pl-2 pr-3 font-mono tabular-nums">{place}</td>
          <td className="break-words py-3 pr-3">{run.players.map(player => names.get(player.id) ?? player.name ?? player.id).join(', ')}</td>
          <td className="whitespace-nowrap py-3 pr-2 text-right font-mono tabular-nums text-blue-800">
            <a href={run.weblink} className="hover:underline">{formatTime(run.times[board.timing + '_t'])}</a>
          </td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>
}
