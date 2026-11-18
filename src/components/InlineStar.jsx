import { Star } from 'lucide-react'
import { ICON } from '../lib/icons.js'

// 안내 문구 속에서 "별 버튼"을 가리킬 때 쓰는 작은 별이에요. 글자 높이에 맞춰 가운데 정렬해요.
function InlineStar() {
  return (
    <Star
      size={ICON.sm}
      className="mx-0.5 inline-block -translate-y-px fill-current align-middle text-brand-600"
    />
  )
}

export default InlineStar
