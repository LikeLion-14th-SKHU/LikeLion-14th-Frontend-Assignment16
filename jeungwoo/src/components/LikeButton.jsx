/** 찜(하트) 버튼. 카드·상세 시트에서 쓴다 */
function LikeButton({ liked, onToggle, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? '찜 해제' : '찜하기'}
      onClick={(event) => {
        // 카드를 여는 클릭과 분리
        event.stopPropagation()
        onToggle()
      }}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-stone-200 transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-orange-500 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${liked ? 'fill-orange-500 text-orange-500' : 'fill-none text-stone-500'}`}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinejoin="round"
          d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 8.8 6c1.4 0 2.5.7 3.2 1.8C12.7 6.7 13.8 6 15.2 6a4.3 4.3 0 0 1 4.3 4.3c0 5.6-7.5 10.2-7.5 10.2Z"
        />
      </svg>
    </button>
  )
}

export default LikeButton
