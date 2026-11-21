// 지도 앱/웹으로 여는 링크. 모바일에서는 설치된 앱이 있으면 앱으로 열린다.

function hasCoords(mapX, mapY) {
  return Number.isFinite(mapX) && Number.isFinite(mapY)
}

/** 카카오맵: 좌표가 있으면 핀 표시, 없으면 주소(없으면 이름)로 검색 */
export function kakaoMapUrl({ title, address, mapX, mapY }) {
  if (hasCoords(mapX, mapY)) {
    // 형식: /link/map/이름,위도,경도  (이름에 쉼표가 있으면 링크가 깨져 공백으로 바꾼다)
    const name = encodeURIComponent(String(title || '축제').replace(/,/g, ' '))
    return `https://map.kakao.com/link/map/${name},${mapY},${mapX}`
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(address || title || '')}`
}

/** 네이버지도: 주소(없으면 이름)로 검색 */
export function naverMapUrl({ title, address }) {
  return `https://map.naver.com/p/search/${encodeURIComponent(address || title || '')}`
}
