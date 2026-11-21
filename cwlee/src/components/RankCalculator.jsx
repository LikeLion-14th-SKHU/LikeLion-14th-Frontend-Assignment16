import { useCallback, useState } from 'react'
import { getLeaderboard } from '../api/speedrun.js'
import { estimatedRank, parseTime } from '../utils/records.js'
import { useRequest } from '../hooks/useGameRecords.js'
import RequestStatus from './RequestStatus.jsx'

export default function RankCalculator({ gameId, categoryId, values }) {
  const [input, setInput] = useState('')
  const [seconds, setSeconds] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const load = useCallback(signal => getLeaderboard(gameId, categoryId, values, null, signal), [gameId, categoryId, values])
  const request = useRequest(seconds !== null ? load : null)
  const invalid = submitted && seconds === null

  return <section className="panel space-y-4">
    <h2 className="section-title">내 기록 예상 순위</h2>
    <form className="space-y-2" onSubmit={event => {
      event.preventDefault()
      setSubmitted(true)
      setSeconds(parseTime(input))
    }}>
      <label htmlFor="personal-time" className="block text-stone-700">내 기록 (분:초 또는 시:분:초)</label>
      <div className="flex flex-col gap-3">
        <input id="personal-time" className="field w-full text-center font-mono text-2xl" placeholder="예: 23:45.678"
          aria-invalid={invalid} value={input} onChange={event => {
            setInput(event.target.value)
            setSubmitted(false)
            setSeconds(null)
          }} />
        <button className="action" type="submit">순위 계산</button>
      </div>
    </form>
    {invalid && <p role="alert" className="text-rose-700">0보다 큰 시간을 올바른 형식으로 입력해 주세요.</p>}
    <RequestStatus request={request} loading="전체 순위표 조회 중…" />
    {request.data?.runs.length === 0 && <p role="status">비교할 기록이 없습니다.</p>}
    {request.data?.runs.length > 0 && <p role="status">예상 <strong className="font-mono text-3xl text-blue-800">{estimatedRank(request.data, seconds)}위</strong></p>}
  </section>
}
