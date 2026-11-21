import { WOOL_BY_ID } from '../data/wools.js'
import WoolSwatch from './WoolSwatch.jsx'

// 층별 쌓기 가이드 + 제작 체크리스트.
// 벽처럼 세워 지을 때 1층(맨 아래)부터 왼쪽 → 오른쪽으로 놓고, 다 놓은 층은 체크해 둔다(자동 저장).
function BuildGuide({ layers, done, onToggleDone, onClearDone, textures, onTextureError, highlightRow, onHighlightRow }) {
  const doneSet = new Set(done)
  const doneCount = layers.filter((l) => doneSet.has(l.layer)).length
  const percent = layers.length ? Math.round((doneCount / layers.length) * 100) : 0

  return (
    <section aria-labelledby="guide-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="guide-title" className="font-semibold text-gray-900">
        층별 쌓기 가이드
      </h2>
      <p className="mt-1 mb-3 text-xs leading-relaxed text-gray-500">
        벽처럼 세워 지을 때 <strong className="text-gray-700">1층(맨 아래)</strong>부터{' '}
        <strong className="text-gray-700">왼쪽 → 오른쪽</strong>으로 놓으세요. 다 놓은 층은 체크해 두고, 줄을 누르면
        그림판에서 그 줄만 또렷하게 보여요.
      </p>

      {layers.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
            <span>
              제작 진행 <strong className="text-gray-900 tabular-nums">{doneCount}</strong> / {layers.length}층 ({percent}%)
            </span>
            {doneCount > 0 && (
              <button type="button" onClick={onClearDone} className="underline underline-offset-2 hover:text-gray-900">
                모두 해제
              </button>
            )}
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={layers.length}
            aria-valuenow={doneCount}
            aria-label="제작 진행"
            className="h-2 overflow-hidden rounded-full bg-gray-200"
          >
            <div className="h-full bg-gray-800 transition-[width]" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {layers.length === 0 ? (
        <p className="py-3 text-center text-sm text-gray-500">칸을 칠하면 층별 순서가 여기에 나와요.</p>
      ) : (
        <ol className="flex max-h-[28rem] flex-col gap-1 overflow-y-auto pr-1">
          {layers.map(({ layer, row, total, runs }) => {
            const active = highlightRow === row
            const isDone = doneSet.has(layer)
            return (
              <li key={row} className="flex items-start gap-1">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleDone(layer)}
                  aria-label={`${layer}층 다 놓았어요`}
                  className="mt-2 size-4 shrink-0 cursor-pointer accent-gray-800"
                />
                <button
                  type="button"
                  onClick={() => onHighlightRow(active ? null : row)}
                  aria-pressed={active}
                  className={`flex min-w-0 flex-1 items-start gap-2 rounded-md border-2 px-2 py-1 text-left text-sm ${
                    active ? 'border-gray-900 bg-gray-50' : 'border-transparent hover:bg-gray-50'
                  } ${isDone ? 'opacity-45' : ''}`}
                >
                  <span className={`w-11 shrink-0 pt-0.5 font-semibold text-gray-900 tabular-nums ${isDone ? 'line-through' : ''}`}>
                    {layer}층
                  </span>
                  <span className="flex flex-1 flex-wrap items-center gap-1">
                    {runs.map((run, k) => {
                      const wool = run.id ? WOOL_BY_ID[run.id] : null
                      return wool ? (
                        <span
                          key={k}
                          className="flex items-center gap-0.5 rounded bg-gray-100 py-0.5 pr-1.5 pl-0.5 text-xs text-gray-800"
                        >
                          <WoolSwatch
                            wool={wool}
                            textures={textures}
                            onTextureError={onTextureError}
                            className="size-4 border border-gray-300"
                          />
                          <span className="sr-only">{wool.name}</span>×{run.count}
                        </span>
                      ) : (
                        <span
                          key={k}
                          className="rounded border border-dashed border-gray-300 px-1.5 py-0.5 text-xs text-gray-400"
                        >
                          빈칸 {run.count}
                        </span>
                      )
                    })}
                  </span>
                  <span className="shrink-0 pt-0.5 text-xs text-gray-500 tabular-nums">{total}개</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export default BuildGuide
