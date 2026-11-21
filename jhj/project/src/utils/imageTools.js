// 사진 파일 → <img> (변환은 woolConvert.js 에서 한다)
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
