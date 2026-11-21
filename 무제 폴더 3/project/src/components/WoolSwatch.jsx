// 양털 한 칸 그림: 대체 단색 배경 위에 텍스처 이미지를 얹는다.
// 텍스처가 없거나 실패하면(onError) 단색만 보인다. wool이 null이면 빈칸 체크무늬.
function WoolSwatch({ wool, textures, onTextureError, className = '' }) {
  const src = wool ? textures[wool.id] : undefined
  return (
    <span
      aria-hidden="true"
      className={`block overflow-hidden ${wool ? '' : 'checker'} ${className}`}
      style={wool ? { backgroundColor: wool.fallback } : undefined}
    >
      {src && (
        <img
          src={src}
          alt=""
          draggable={false}
          onError={() => onTextureError(wool.id)}
          className="pixelated block size-full"
        />
      )}
    </span>
  )
}

export default WoolSwatch
