// 사진 파일 → 정사각형 PNG Blob (mc-api /v1/mapart 로 보내기 전에 모양을 맞춘다)
// fit: 'crop' = 가운데를 정사각형으로 잘라 꽉 채움 / 'contain' = 전체가 보이게 넣고 남는 곳은 투명(→ 빈칸)
const MAX_SIDE = 512

export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ img, url })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지를 읽지 못했어요. PNG, JPG, WebP 파일인지 확인해 주세요.'))
    }
    img.src = url
  })
}

export function toSquarePng(img, fit) {
  const side = Math.min(MAX_SIDE, Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d')
  const w = img.naturalWidth
  const h = img.naturalHeight
  if (fit === 'crop') {
    const s = Math.min(w, h)
    ctx.drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, side, side)
  } else {
    const scale = side / Math.max(w, h)
    const dw = w * scale
    const dh = h * scale
    ctx.drawImage(img, (side - dw) / 2, (side - dh) / 2, dw, dh)
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('이미지 변환에 실패했어요.'))), 'image/png'),
  )
}
