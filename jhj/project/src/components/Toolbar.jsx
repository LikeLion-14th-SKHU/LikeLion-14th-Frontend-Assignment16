// 서비스 이름, 새 도안 / 사진으로 만들기 / 되돌리기, 상태 문구
function Toolbar({ canUndo, onNew, onPhoto, onUndo, message, credits }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3">
        <div className="mr-auto">
          <h1 className="font-pixel text-xl text-gray-900">한 칸 도트 공방</h1>
          <p className="text-xs text-gray-500">양털로 짓기 전에 그려 보고, 필요한 개수와 쌓는 순서를 바로 확인해요.</p>
        </div>

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↶ 되돌리기
        </button>
        <button
          type="button"
          onClick={onPhoto}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
        >
          사진으로 만들기
        </button>
        <button
          type="button"
          onClick={onNew}
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          + 새 도안
        </button>

        <p role="status" aria-live="polite" className="flex w-full flex-wrap gap-x-3 text-sm text-gray-600">
          <span>{message}</span>
          {credits !== null && (
            <span className="ml-auto text-xs text-gray-500">mc-api 남은 크레딧 {credits}</span>
          )}
        </p>
      </div>
    </header>
  )
}

export default Toolbar
