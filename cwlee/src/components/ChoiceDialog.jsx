import { useId, useRef } from 'react'

export default function ChoiceDialog({ label, placeholder, options, value, onChange }) {
  const dialog = useRef(null)
  const titleId = useId()
  const selected = options.find(option => option.value === value)

  return <div className="space-y-2">
    <span className="block text-sm font-semibold">{label}</span>
    <button type="button" aria-haspopup="dialog"
      aria-label={label + ': ' + (selected?.label ?? placeholder)}
      className="field flex w-full cursor-pointer items-center justify-between gap-4 text-left hover:border-blue-500 hover:bg-blue-50"
      onClick={() => dialog.current.showModal()}>
      <span className="min-w-0 wrap-break-word">{selected?.label ?? placeholder}</span>
      <span aria-hidden="true" className="shrink-0 text-blue-700">⌄</span>
    </button>
    <dialog ref={dialog} aria-labelledby={titleId}
      className="fixed inset-0 m-auto max-h-[80dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-blue-200 bg-linear-to-br from-white to-blue-50 p-4 text-stone-950 shadow-xl backdrop:bg-slate-950/35 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-blue-100 pb-3">
        <h2 id={titleId} className="wrap-break-word font-display text-xl font-medium">{label} 선택</h2>
        <button type="button" autoFocus className="rounded-md px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
          onClick={() => dialog.current.close()}>닫기</button>
      </div>
      <ul className="space-y-2">
        {options.map(option => <li key={option.value}>
          <button type="button" aria-pressed={option.value === value}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-blue-100 bg-white px-3 py-2 text-left hover:border-blue-400 aria-pressed:border-blue-500 aria-pressed:bg-blue-100 aria-pressed:text-blue-950"
            onClick={() => {
              dialog.current.close()
              if (option.value !== value) onChange(option.value)
            }}>
            <span className="min-w-0 wrap-break-word">{option.label}</span>
            {option.value === value && <span aria-hidden="true" className="text-blue-800">✓</span>}
          </button>
        </li>)}
      </ul>
    </dialog>
  </div>
}
