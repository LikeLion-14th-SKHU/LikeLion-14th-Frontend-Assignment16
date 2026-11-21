import DesignThumb from './DesignThumb.jsx'

const timeAgo = (t) => {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return '방금'
  if (s < 3600) return `${Math.floor(s / 60)}분 전`
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
  return new Date(t).toLocaleDateString('ko-KR')
}

// 내 도안 보관함: 저장해 둔 도안을 골라 이어서 그린다 (자동 저장)
function DesignLibrary({ designs, currentId, onOpen, onRename, onDuplicate, onDelete }) {
  const sorted = [...designs].sort((a, b) => b.updatedAt - a.updatedAt)
  const current = designs.find((d) => d.id === currentId)

  return (
    <section aria-labelledby="library-title" className="mx-auto max-w-7xl px-4 pt-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 id="library-title" className="font-semibold text-gray-900">
          내 도안 <span className="text-sm font-normal text-gray-500">{designs.length}개 · 자동 저장</span>
        </h2>
        {current && (
          <div className="ml-auto flex gap-1 text-sm">
            <button
              type="button"
              onClick={() => {
                const name = window.prompt('도안 이름', current.name)
                if (name && name.trim()) onRename(current.id, name.trim())
              }}
              className="rounded-md px-2 py-1 text-gray-700 hover:bg-white"
            >
              이름 바꾸기
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(current.id)}
              className="rounded-md px-2 py-1 text-gray-700 hover:bg-white"
            >
              복제
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`'${current.name}'을(를) 삭제할까요? 되돌릴 수 없어요.`)) onDelete(current.id)
              }}
              className="rounded-md px-2 py-1 text-gray-700 hover:bg-white"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <ul className="flex gap-2 overflow-x-auto pb-2">
        {sorted.map((d) => {
          const active = d.id === currentId
          return (
            <li key={d.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onOpen(d.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-28 flex-col gap-1 rounded-lg border-[3px] bg-white p-1.5 text-left ${
                  active ? 'border-gray-900' : 'border-transparent shadow-sm hover:border-gray-300'
                }`}
              >
                <DesignThumb grid={d.grid} size={d.size} className="aspect-square w-full" />
                <span className="truncate text-xs font-semibold text-gray-900">{d.name}</span>
                <span className="text-[11px] text-gray-500">
                  {d.size}×{d.size} · {timeAgo(d.updatedAt)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default DesignLibrary
