import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatTime, recordProgression } from '../utils/records.js'
import RequestStatus from './RequestStatus.jsx'

const dateLabel = timestamp => new Date(timestamp).toISOString().slice(0, 10)

export default function WorldRecordChart({ request }) {
  const points = request.data ? recordProgression(request.data) : []
  const latest = points.at(-1)
  return <section className="panel min-w-0 space-y-4">
    <h2 className="section-title">세계 최고 기록 변화</h2>
    <RequestStatus request={request} loading={request.progress ? '검증 기록 조회 중 · ' + request.progress + '페이지' : '검증 기록 조회 중…'} />
    {request.data && !latest && <p>날짜가 있는 검증 기록이 없습니다.</p>}
    {latest && <>
      <p className="text-stone-700">최근 갱신 <strong className="ml-2 font-mono text-blue-800">{formatTime(latest.seconds)}</strong> · {latest.date}</p>
      <div className="h-64 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 12, right: 16, bottom: 6, left: 2 }}>
            <CartesianGrid stroke="#e2e4e8" strokeDasharray="3 5" />
            <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']} tickFormatter={dateLabel} tick={{ fill: '#525660', fontSize: 12, fontFamily: "var(--font-mono)" }} minTickGap={32} />
            <YAxis domain={['dataMin', 'dataMax']} tickFormatter={formatTime} width={84} tick={{ fill: '#525660', fontSize: 12, fontFamily: "var(--font-mono)" }} />
            <Tooltip labelFormatter={dateLabel} formatter={value => [formatTime(value), '기록']}
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d6d8dc', color: '#0f172a' }} />
            <Line type="stepAfter" dataKey="seconds" stroke="#1d4ed8" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>}
  </section>
}
