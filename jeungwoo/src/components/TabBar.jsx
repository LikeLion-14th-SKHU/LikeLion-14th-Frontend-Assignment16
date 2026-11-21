/** [전체 축제] / [찜한 축제 n] 탭 */
function TabBar({ value, onChange, likeCount }) {
  const tabs = [
    { value: 'all', label: '전체 축제' },
    { value: 'likes', label: '찜한 축제', count: likeCount },
  ]

  return (
    <div className="flex gap-6 border-b border-stone-200" role="tablist" aria-label="보기">
      {tabs.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition-colors ${
              selected ? 'border-orange-500 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  selected ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default TabBar
