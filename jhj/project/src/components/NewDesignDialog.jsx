import { useState } from 'react'
import { DEFAULT_SIZE, EXAMPLES, GRID_SIZES, createEmptyGrid } from '../data/patterns.js'
import Modal from './Modal.jsx'
import DesignThumb from './DesignThumb.jsx'

const SIZE_HINT = { 16: '작은 캐릭터', 32: '기본', 48: '자세한 그림', 64: '큰 벽화' }

// 새 도안 만들기: 빈 도안(크기 선택) 또는 예시에서 시작. 지금 도안은 보관함에 그대로 남는다.
function NewDesignForm({ onCreate }) {
  const [start, setStart] = useState('empty')
  const [size, setSize] = useState(DEFAULT_SIZE)
  const example = EXAMPLES.find((e) => e.id === start)
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const finalSize = example ? example.size : size
    onCreate({
      name: name.trim() || (example ? example.name : `새 도안 ${finalSize}×${finalSize}`),
      size: finalSize,
      grid: example ? example.create() : createEmptyGrid(finalSize),
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">어디서 시작할까요?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[{ id: 'empty', name: '빈 도안' }, ...EXAMPLES].map((opt) => {
            const ex = EXAMPLES.find((e) => e.id === opt.id)
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-[3px] p-2 text-xs ${
                  start === opt.id ? 'border-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="start"
                  value={opt.id}
                  checked={start === opt.id}
                  onChange={() => setStart(opt.id)}
                  className="sr-only"
                />
                {ex ? (
                  <DesignThumb grid={ex.create()} size={ex.size} className="size-16" />
                ) : (
                  <span className="checker block size-16" aria-hidden="true" />
                )}
                {opt.name}
                {ex && <span className="font-normal text-gray-500">{ex.size}×{ex.size}</span>}
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset disabled={Boolean(example)} className="disabled:opacity-40">
        <legend className="mb-2 text-sm font-semibold">그림판 크기 (한 칸 = 양털 1개)</legend>
        <div className="grid grid-cols-4 gap-2">
          {GRID_SIZES.map((s) => (
            <label
              key={s}
              className={`flex cursor-pointer flex-col items-center rounded-lg border-[3px] px-1 py-2 text-sm ${
                (example ? example.size : size) === s ? 'border-gray-900 font-semibold' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="size"
                value={s}
                checked={size === s}
                onChange={() => setSize(s)}
                className="sr-only"
              />
              {s}×{s}
              <span className="text-[11px] font-normal text-gray-500">{SIZE_HINT[s]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-semibold">
        이름 <span className="font-normal text-gray-500">(비워 두면 자동)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder={example ? example.name : '예: 우리 집 문패'}
          className="rounded-md border border-gray-300 px-2 py-1.5 font-normal"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
      >
        만들기
      </button>
    </form>
  )
}

function NewDesignDialog({ open, onClose, onCreate }) {
  return (
    <Modal open={open} onClose={onClose} title="새 도안">
      <NewDesignForm onCreate={onCreate} />
    </Modal>
  )
}

export default NewDesignDialog
