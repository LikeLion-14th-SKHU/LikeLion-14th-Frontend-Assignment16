// 빈 상태, 준비 중 안내 등에 쓰는 공통 박스예요.
function EmptyState({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      {icon && (
        <div aria-hidden="true" className="mb-2 text-3xl">
          {icon}
        </div>
      )}
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-1 text-sm text-ink-muted">{children}</p>}
    </div>
  )
}

export default EmptyState
