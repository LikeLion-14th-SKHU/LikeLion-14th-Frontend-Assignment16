import { WOOLS } from '../data/wools.js'

// 색별 개수 + 합계. counts는 App에서 grid로부터 계산해 넘긴다.
function MaterialTable({ counts, textures, onTextureError }) {
  const rows = WOOLS.filter((w) => counts[w.id] > 0)
  const total = rows.reduce((sum, w) => sum + counts[w.id], 0)

  return (
    <section aria-labelledby="material-title" className="rounded-lg bg-white p-4 shadow-sm">
      <h2 id="material-title" className="mb-3 font-semibold text-gray-900">
        준비물표
      </h2>
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
              <td colSpan={2} className="py-3 text-center text-gray-500">
                아직 칠한 칸이 없어요.
              </td>
            </tr>
          )}
          {rows.map((w) => (
            <tr key={w.id} className="border-b border-gray-100">
              <td className="flex items-center gap-2 py-1.5">
                <span
                  className="block size-4 overflow-hidden border border-gray-300"
                  style={{ backgroundColor: w.fallback }}
                  aria-hidden="true"
                >
                  {textures[w.id] && (
                    <img
                      src={textures[w.id]}
                      alt=""
                      onError={() => onTextureError(w.id)}
                      className="pixelated block size-full"
                    />
                  )}
                </span>
                {w.name}
              </td>
              <td className="py-1.5 text-right tabular-nums">{counts[w.id]}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold text-gray-900">
            <th scope="row" className="pt-2 text-left">합계</th>
            <td className="pt-2 text-right tabular-nums">{total}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  )
}

export default MaterialTable
