import { useNavigate } from 'react-router-dom'
import ChoiceDialog from './ChoiceDialog.jsx'

export default function CategoryPicker({ gameId, categories, categoryId }) {
  const navigate = useNavigate()
  if (!categories.length) return <p>전체 게임 카테고리가 없습니다.</p>

  const options = categories.map(category => ({ value: category.id, label: category.name }))
  if (categoryId) options.unshift({ value: '', label: '선택 해제' })

  return <ChoiceDialog label="카테고리" placeholder="카테고리 선택" options={options} value={categoryId}
    onChange={category => navigate('/games/' + gameId + (category ? '/' + category : ''))} />
}
