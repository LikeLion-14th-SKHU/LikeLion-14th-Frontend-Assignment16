// Fixed, verified city coordinates avoid a second API and keep the UI predictable.
export const CITIES = [
  { id: 'seoul', name: '서울', region: '서울특별시', latitude: 37.5665, longitude: 126.9780 },
  { id: 'incheon', name: '인천', region: '인천광역시', latitude: 37.4563, longitude: 126.7052 },
  { id: 'busan', name: '부산', region: '부산광역시', latitude: 35.1796, longitude: 129.0756 },
  { id: 'daegu', name: '대구', region: '대구광역시', latitude: 35.8714, longitude: 128.6014 },
  { id: 'daejeon', name: '대전', region: '대전광역시', latitude: 36.3504, longitude: 127.3845 },
  { id: 'gwangju', name: '광주', region: '광주광역시', latitude: 35.1595, longitude: 126.8526 },
  { id: 'jeju', name: '제주', region: '제주시', latitude: 33.4996, longitude: 126.5312 },
  { id: 'chuncheon', name: '춘천', region: '강원특별자치도', latitude: 37.8813, longitude: 127.7298 },
];

export const DEFAULT_CITY_ID = 'seoul';
