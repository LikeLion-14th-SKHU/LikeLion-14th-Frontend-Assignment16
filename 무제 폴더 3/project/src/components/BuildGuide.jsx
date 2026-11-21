import { GRID_SIZE } from '../data/patterns.js'
import { WOOL_BY_ID } from '../data/wools.js'
import WoolSwatch from './WoolSwatch.jsx'

// 게임 속 모습 미리보기 + 층별 쌓기 가이드.
// 벽처럼 세워 지을 때 1층(맨 아래)부터 왼쪽 → 오른쪽으로 놓으면 된다.
function BuildGuide({ grid, layers, textures, onTextureError, highlightRow, onHighlightRow }) {
  return (
    <section aria-labelledby="guide-title" className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h2 id="guide-title" className="font-semibold text-gray-900">
            층별 쌓기 가이드
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            벽처럼 세워 지을 때 <strong className="text-gray-700">1층(맨 아래)</strong>부터{' '}
            <strong className="text-gray-700">왼쪽 → 오른쪽</strong>으로 놓으세요. 줄을 누르면 격자에서 그 줄만
            또렷하게 보여요.
          </p>
        </div>

        {/* 줄 없이 본 게임 속 모습 */}
        <figure className="shrink-0">
          <div
            className="checker grid size-24 border border-gray-300"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            aria-hidden="true"
          >
            {grid.map((id, i) =>
              id ? (
                <WoolSwatch
                  key={i}
                  wool={WOOL_BY_ID[id]}
                  textures={textures}
                  onTextureError={onTextureError}
                  className="size-full"
                />
              ) : (
                <span key={i} />
              ),
            )}
          </div>
          <figcaption className="mt-1 text-center text-[11px] text-gray-500">게임 속 모습</figcaption>
        </figure>
      </div>

      {layers.length === 0 ? (
        <p className="py-3 text-center text-sm text-gray-500">칸을 칠하면 층별 순서가 여기에 나와요.</p>
      ) : (
        <ol className="flex max-h-96 flex-col gap-1 overflow-y-auto">
          {layers.map(({ layer, row, total, runs }) => {
            const active = highlightRow === row
            return (
              <li key={row}>
                <button
                  type="button"
                  onClick={() => onHighlightRow(active ? null : row)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-2 rounded-md border-2 px-2 py-1 text-left text-sm ${
                    active ? 'border-gray-900 bg-gray-50' : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="w-10 shrink-0 font-semibold text-gray-900 tabular-nums">{layer}층</span>
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
                  <span className="shrink-0 text-xs text-gray-500 tabular-nums">{total}개</span>
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
