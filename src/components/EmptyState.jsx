import { ICON } from '../lib/icons.js'

// 빈 상태, 준비 중 안내 등에 쓰는 공통 박스예요.
// icon에는 lucide 아이콘 컴포넌트를 넘겨요. 예: icon={Star}
function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      {Icon && (
        <div
          aria-hidden="true"
          className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <Icon size={ICON.lg} />
        </div>
      )}
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-1 text-sm text-ink-muted">{children}</p>}
    </div>
  )
}

export default EmptyState
