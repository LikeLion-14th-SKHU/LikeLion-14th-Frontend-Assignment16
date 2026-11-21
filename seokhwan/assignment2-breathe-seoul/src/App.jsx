import ActivityGuide from './components/ActivityGuide.jsx'
import DistrictPicker from './components/DistrictPicker.jsx'
import Header from './components/Header.jsx'
import PollutantGrid from './components/PollutantGrid.jsx'
import RankingList from './components/RankingList.jsx'
import VerdictCard from './components/VerdictCard.jsx'
import { useAir } from './hooks/useAir.js'
import { useSavedDistrict } from './hooks/useSavedDistrict.js'
import { formatMeasuredAt } from './utils/airQuality.js'

export default function App() {
  const { data, error, loading, reload } = useAir()
  const [district, setDistrict] = useSavedDistrict()

  const rows = data?.rows ?? []
  // 저장된 구가 목록에 없으면(첫 방문, 샘플 키) 첫 번째 구를 보여 준다
  const row = rows.find((r) => r.MSRSTN_NM === district) ?? rows[0]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <Header measuredAt={formatMeasuredAt(row?.MSRMT_DT)} loading={loading} onReload={reload} />

        {data?.sample && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            샘플 인증키로 동작 중이라 {rows.length}개 구만 보여요. SEOUL_API_KEY를 설정하면 25개 구가 모두 나와요.
          </p>
        )}

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}{' '}
            <button type="button" onClick={reload} className="font-semibold underline">
              다시 시도
            </button>
          </div>
        )}

        {!data && loading && <div className="h-64 animate-pulse rounded-3xl bg-slate-200" aria-label="불러오는 중" />}

        {row && (
          <>
            <DistrictPicker rows={rows} selected={row.MSRSTN_NM} onSelect={setDistrict} />
            <VerdictCard row={row} />
            <ActivityGuide row={row} />
            <PollutantGrid row={row} />
            <RankingList rows={rows} selected={row.MSRSTN_NM} onSelect={setDistrict} />
          </>
        )}

        <footer className="border-t border-slate-200 pt-6 text-xs text-slate-400">
          데이터 출처: 서울 열린데이터광장 · 서울시 권역별 실시간 대기환경 현황 (RealtimeCityAir)
        </footer>
      </div>
    </main>
  )
}
