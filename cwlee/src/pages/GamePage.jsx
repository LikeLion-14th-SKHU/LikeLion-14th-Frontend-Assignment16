import { lazy, Suspense, useCallback, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getGame, getHistory, getLeaderboard, getVariables } from '../api/speedrun.js'
import CategoryPicker from '../components/CategoryPicker.jsx'
import ChoiceDialog from '../components/ChoiceDialog.jsx'
import LeaderboardTable from '../components/LeaderboardTable.jsx'
import RankCalculator from '../components/RankCalculator.jsx'
import RequestStatus from '../components/RequestStatus.jsx'
import { formatTime } from '../utils/records.js'
import { useRequest } from '../hooks/useGameRecords.js'

const WorldRecordChart = lazy(() => import('../components/WorldRecordChart.jsx'))

function Records({ gameId, categoryId }) {
  const [params, setParams] = useSearchParams()
  const loadVariables = useCallback(signal => getVariables(categoryId, signal), [categoryId])
  const variables = useRequest(loadVariables)
  const values = useMemo(() => Object.fromEntries((variables.data ?? []).map(variable => {
    const options = variable.values.values
    const selected = params.get(variable.id)
    const defaultValue = variable.values.default
    return [variable.id, Object.hasOwn(options, selected) ? selected
      : (defaultValue && Object.hasOwn(options, defaultValue) ? defaultValue : Object.keys(options)[0])]
  })), [variables.data, params])
  const loadBoard = useCallback(signal => getLeaderboard(gameId, categoryId, values, 10, signal), [gameId, categoryId, values])
  const board = useRequest(variables.data ? loadBoard : null)
  const timing = board.data?.timing
  const worldRecord = board.data?.runs.find(entry => entry.place === 1)?.run.times[timing + '_t']
  const loadHistory = useCallback((signal, progress) => getHistory(gameId, categoryId, values, timing, signal, progress),
    [gameId, categoryId, values, timing])
  const history = useRequest(timing ? loadHistory : null)
  const timingLabels = { realtime: '실시간', realtime_noloads: '로딩 제외 시간', ingame: '게임 내 시간' }

  return <>
    <RequestStatus request={variables} loading="카테고리 규칙 조회 중…" />
    {variables.data?.length > 0 && <div className="panel grid gap-4 sm:grid-cols-2">
      {variables.data.map(variable => <ChoiceDialog key={variable.id} label={variable.name}
        value={values[variable.id]} options={Object.entries(variable.values.values).map(([id, value]) => ({ value: id, label: value.label }))}
        onChange={value => {
          const next = new URLSearchParams(values)
          next.set(variable.id, value)
          setParams(next)
        }} />)}
    </div>}
    {variables.data && <>
      {timing && <div className="flex flex-wrap items-center justify-between gap-3 border-y border-blue-200 py-4">
        <p className="text-sm text-stone-700">측정 기준 · {timingLabels[timing] ?? timing}</p>
        {Number.isFinite(worldRecord) && <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-bold">현재 세계 기록</span>
          <strong className="font-mono text-3xl text-blue-800 sm:text-4xl">{formatTime(worldRecord)}</strong>
        </p>}
      </div>}
      <Suspense fallback={<p role="status">그래프 불러오는 중…</p>}>
          <WorldRecordChart request={timing ? history : { pending: board.pending, error: board.error, retry: board.retry }} />
      </Suspense>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <LeaderboardTable request={board} />
        <RankCalculator key={JSON.stringify(values)} gameId={gameId} categoryId={categoryId} values={values} />
      </div>
    </>}
  </>
}

export default function GamePage() {
  const { gameId, categoryId } = useParams()
  const load = useCallback(signal => getGame(gameId, signal), [gameId])
  const request = useRequest(load)
  const { game, categories } = request.data ?? {}
  const category = categories?.find(item => item.id === categoryId)
  return <div className="space-y-6">
    <Link to="/" className="inline-block text-sm text-blue-800 hover:underline">게임 검색</Link>
    <RequestStatus request={request} loading="게임과 카테고리 조회 중…" />
    {game && <>
      <div className="flex items-center gap-4 sm:gap-6">
        {game.assets?.['cover-small']?.uri && <img src={game.assets['cover-small'].uri} alt="" className="h-20 w-14 shrink-0 rounded object-cover sm:h-24 sm:w-16" />}
        <h1 className="min-w-0 break-words font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">{game.names.international}</h1>
      </div>
      <section className="panel max-w-xl">
        <CategoryPicker gameId={gameId} categories={categories} categoryId={category?.id} />
        {categoryId && !category && <p role="alert" className="mt-3 text-rose-700">이 게임에서 해당 카테고리를 찾을 수 없습니다.</p>}
      </section>
      {category && <Records key={gameId + '/' + categoryId} gameId={gameId} categoryId={categoryId} />}
    </>}
  </div>
}
