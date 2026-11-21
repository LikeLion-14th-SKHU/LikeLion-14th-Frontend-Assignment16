export default function RequestStatus({ request, loading = '불러오는 중…' }) {
  if (request.pending) return <p role="status" className="text-stone-700">{loading}</p>
  if (!request.error) return null
  return <div role="alert" className="space-y-3">
    <p className="text-rose-700">{request.error}</p>
    <button className="action" onClick={request.retry}>다시 시도</button>
  </div>
}
