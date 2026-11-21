import { useEffect, useRef } from 'react'

// <dialog> 기반 모달: Esc·바깥 클릭으로 닫히고 포커스가 안에 갇힌다.
function Modal({ open, onClose, title, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-xl bg-white p-0 text-gray-900 shadow-xl"
    >
      <div className="p-5">
        <div className="mb-4 flex items-center">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="ml-auto rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  )
}

export default Modal
