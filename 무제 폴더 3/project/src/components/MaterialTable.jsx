import { WOOLS } from '../data/wools.js'
import WoolSwatch from './WoolSwatch.jsx'

// 준비물표: 색별 개수 + 합계 + 서바이벌에서 구하는 법.
// counts는 App에서 grid로부터 계산해 넘긴다.
function MaterialTable({ counts, textures, onTextureError }) {
  const rows = WOOLS.filter((w) => counts[w.id] > 0)
  const total = rows.reduce((sum, w) => sum + counts[w.id], 0)

  return (
    <section aria-labelledby="material-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="material-title" className="font-semibold text-gray-900">
        준비물표
      </h2>
      <p className="mb-3 text-xs text-gray-500">게임에 들어가기 전에 이만큼 모아 두세요.</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-600">
            <th scope="col" className="py-1 font-medium">양털</th>
            <th scope="col" className="py-1 text-right font-medium">개수</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={2} className="py-4 text-center text-gray-500">
                아직 칠한 칸이 없어요.
                <br />
                <span className="text-xs">위에서 &lsquo;펭귄 예시&rsquo;를 불러와 보세요.</span>
              </td>
            </tr>
          )}
          {rows.map((w) => (
            <tr key={w.id} className="border-b border-gray-100">
              <td className="py-1.5">
                <div className="flex items-center gap-2">
                  <WoolSwatch
                    wool={w}
                    textures={textures}
                    onTextureError={onTextureError}
                    className="size-6 shrink-0 border border-gray-300"
                  />
                  <div>
                    <p className="text-gray-900">{w.name}</p>
                    <p className="text-[11px] text-gray-500">{w.source}</p>
                  </div>
                </div>
              </td>
              <td className="py-1.5 text-right align-middle text-base font-semibold tabular-nums">
                {counts[w.id]}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold text-gray-900">
            <th scope="row" className="pt-2 text-left">합계</th>
            <td className="pt-2 text-right text-base tabular-nums">{total}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}

export default MaterialTable
