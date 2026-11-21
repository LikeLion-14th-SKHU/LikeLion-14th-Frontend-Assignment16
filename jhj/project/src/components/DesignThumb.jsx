import { useEffect, useRef } from 'react'
import { WOOL_BY_ID } from '../data/wools.js'

// 도안 썸네일: 칸 하나 = 픽셀 하나 (대체 단색). 빈칸은 투명 → 뒤의 체크무늬가 보인다.
function DesignThumb({ grid, size, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, size, size)
    grid.forEach((id, i) => {
      if (!id) return
      ctx.fillStyle = WOOL_BY_ID[id].fallback
      ctx.fillRect(i % size, Math.floor(i / size), 1, 1)
    })
  }, [grid, size])

  // 체크무늬는 8×8 정도로 잘게
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`checker pixelated block ${className}`}
      style={{ backgroundSize: '12.5% 12.5%' }}
    />
  )
}

export default DesignThumb
