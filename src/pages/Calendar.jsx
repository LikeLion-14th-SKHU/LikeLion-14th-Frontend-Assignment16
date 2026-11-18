import EmptyState from '../components/EmptyState.jsx'

function Calendar() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">캘린더</h1>
      {/* 4주차: 월간 캘린더 */}
      <EmptyState icon="📅" title="월간 캘린더는 4주차에 만들어요" />
    </div>
  )
}

export default Calendar
