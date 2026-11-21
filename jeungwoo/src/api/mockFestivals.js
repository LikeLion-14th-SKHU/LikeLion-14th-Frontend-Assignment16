// 예시 데이터: TourAPI(KorService2) 응답과 같은 모양을 흉내 낸다.
// 날짜는 오늘 기준 상대값이라 언제 실행해도 진행 중 / 곧 종료 / D-n이 고루 나온다.
// 축제 이름·주소·연락처는 모두 가상의 값이다.
// 실제 데이터는 /api를 거친다. 주소에 ?mock을 붙이면 이 예시 데이터를 쓴다.

import { matchesRegion } from '../constants/regions.js'
import { addDays, overlaps, toYmd } from '../utils/date.js'

// [id, 축제명, 법정동 시·도 코드(lDongRegnCd), 주소, 시작(오늘+n일), 종료(오늘+n일), 사진 여부, 이용요금]
// 시작 ≤ 오늘이고 종료 ≥ 오늘+7인 축제는 언제 조회해도 "이번 주말"에 걸린다.
const SEEDS = [
  [9001, '한강 불빛 야시장', '11', '서울특별시 영등포구 여의동로 330', -10, 20, true, '무료'],
  [9002, '종로 겨울 등불축제', '11', '서울특별시 종로구 청계천로 1', -3, 25, true, '무료'],
  [9003, '성수 수제맥주 페스타', '11', '서울특별시 성동구 성수이로 78', 1, 2, true, '입장권 15,000원<br>맥주 1잔 포함'],
  [9004, '남산 별빛 음악회', '11', '서울특별시 중구 삼일대로 231', -6, 2, false, '무료'],
  [9005, '인천 차이나타운 문화축제', '28', '인천광역시 중구 차이나타운로 59', -2, 9, true, '무료<br>체험 부스 일부 유료(3,000원~)'],
  [9006, '송도 해변 버스킹 주간', '28', '인천광역시 연수구 센트럴로 160', 4, 11, true, '무료'],
  [9007, '대전 과학 불꽃쇼', '30', '대전광역시 유성구 대덕대로 480', -1, 3, true, '무료'],
  [9008, '대구 근대골목 야행', '27', '대구광역시 중구 달구벌대로 2029', -8, 14, true, '무료'],
  [9009, '광주 아시아 음식 축제', '29', '광주광역시 동구 문화전당로 38', 2, 8, false, '무료<br>음식 개별 판매'],
  [9010, '부산 바다 빛 축제', '26', '부산광역시 해운대구 해운대해변로 264', -15, 30, true, '무료'],
  [9011, '광안리 드론 라이트쇼', '26', '부산광역시 수영구 광안해변로 219', -4, 1, true, '무료'],
  [9012, '세종 호수공원 겨울정원', '36', '세종특별자치시 다솜로 216', -5, 12, true, '어른 3,000원<br>어린이 1,000원'],
  [9013, '수원 화성 달빛 산책', '41', '경기도 수원시 팔달구 정조로 825', -7, 21, true, '성인 10,000원<br>학생 5,000원'],
  [9014, '가평 별빛 캠핑 페스티벌', '41', '경기도 가평군 가평읍 북한강변로 1', 3, 5, true, '1박 30,000원'],
  [9015, '파주 북소리 마켓', '41', '경기도 파주시 회동길 145', -2, 2, false, '무료'],
  [9016, '양평 딸기 따기 체험전', '41', '경기도 양평군 양서면 북한강로 22', 20, 45, true, '체험 1인 18,000원'],
  [9017, '강릉 커피 축제', '51', '강원특별자치도 강릉시 창해로 17', -9, 10, true, '무료<br>시음권 5,000원'],
  [9018, '평창 송어 얼음낚시', '51', '강원특별자치도 평창군 진부면 경강로 3562', 35, 60, true, '낚시 체험 20,000원'],
  [9019, '청주 공예 비엔날레 주말장터', '43', '충청북도 청주시 청원구 상당로 314', 1, 30, true, '무료'],
  [9020, '공주 백제 문화 야경투어', '44', '충청남도 공주시 웅진로 280', -12, 3, true, '무료'],
  [9021, '보령 겨울 바다 머드 체험', '44', '충청남도 보령시 머드로 123', 40, 44, false, '체험 10,000원'],
  [9022, '경주 대릉원 등불 산책', '47', '경상북도 경주시 황남동 31-1', -20, 15, true, '무료'],
  [9023, '안동 탈춤 상설 공연', '47', '경상북도 안동시 육사로 239', -30, 40, true, '무료'],
  [9024, '통영 굴 요리 한마당', '48', '경상남도 통영시 해송정로 4', 5, 7, true, '무료<br>시식권 5,000원'],
  [9025, '진주 남강 유등 전시', '48', '경상남도 진주시 남강로 626', -14, 6, true, '무료'],
  [9026, '전주 한옥마을 야간 장터', '52', '전북특별자치도 전주시 완산구 기린대로 99', -1, 18, true, '무료'],
  [9027, '군산 시간여행 축제', '45', '전북특별자치도 군산시 해망로 240', 33, 36, true, '무료'],
  [9028, '여수 밤바다 낭만 포차', '46', '전라남도 여수시 이순신광장로 213', -6, 13, true, '무료<br>음식 개별 판매'],
  [9029, '순천만 갈대 사진전', '46', '전라남도 순천시 순천만길 513-25', 10, 25, false, '순천만습지 입장료 8,000원'],
  [9030, '제주 감귤 따기 축제', '50', '제주특별자치도 서귀포시 남원읍 태위로 360', -11, 16, true, '체험 1인 10,000원<br>감귤 1kg 포함'],
]
// 울산(31)은 일부러 비워 둔다 → "결과 0건" 확인용
// 세종(36)은 1개만 둔다 → "결과 1건" 확인용
// 군산(9027)은 전북 옛 코드 45로 둔다 → 전북(52) 선택 시 함께 나오는지 확인용

function buildRaw(today) {
  return SEEDS.map(([id, title, lDongRegnCd, addr1, startOffset, endOffset, hasImage, fee], index) => {
    const image = hasImage ? `https://picsum.photos/seed/fest${id}/800/600` : ''
    return {
      list: {
        contentid: String(id),
        contenttypeid: '15',
        title,
        addr1,
        addr2: '',
        areacode: '', // KorService2에서는 비어 오는 경우가 많다
        lDongRegnCd,
        eventstartdate: toYmd(addDays(today, startOffset)),
        eventenddate: toYmd(addDays(today, endOffset)),
        firstimage: image,
        firstimage2: image ? `https://picsum.photos/seed/fest${id}/300/200` : '',
        tel: `0${(index % 6) + 2}-123-${String(4000 + index).padStart(4, '0')}`,
        // 위경도는 대략적인 값 (지도 링크 확인용)
        mapx: String(126.5 + (index % 10) * 0.25),
        mapy: String(34.5 + (index % 7) * 0.5),
      },
      intro: {
        contentid: String(id),
        contenttypeid: '15',
        eventstartdate: toYmd(addDays(today, startOffset)),
        eventenddate: toYmd(addDays(today, endOffset)),
        eventplace: addr1.split(' ').slice(0, 2).join(' ') + ' 일대',
        playtime: '10:00 ~ 21:00',
        usetimefestival: fee,
      },
      overview:
        `${title}는 예시 데이터로 만든 가상의 축제입니다.<br>` +
        '주말에 친구들과 가볍게 들르기 좋은 프로그램으로 구성되어 있어요.<br><br>' +
        '주요 프로그램<br>- 공연 및 버스킹<br>- 먹거리 장터<br>- 체험 부스',
    }
  })
}

const OK_HEADER = { resultCode: '0000', resultMsg: 'OK' }

/** TourAPI 응답 껍데기. 0건이면 items가 "", 1건이면 item이 객체 하나 (실제 API에서 나올 수 있는 모양) */
function wrap(items, { pageNo = 1, numOfRows = items.length, totalCount = items.length } = {}) {
  let wrapped = ''
  if (items.length === 1) wrapped = { item: items[0] }
  else if (items.length > 1) wrapped = { item: items }
  return {
    response: {
      header: OK_HEADER,
      body: { items: wrapped, numOfRows, pageNo, totalCount },
    },
  }
}

/** /api/festivals 흉내: 기간(start~end)과 겹치고 지역이 맞는 축제를 종료일 순으로 페이지 단위로 */
export function mockSearchFestival({ start, end, areaCode = '', pageNo = 1, numOfRows = 12 }, today = new Date()) {
  const matched = buildRaw(today)
    .map((entry) => entry.list)
    .filter((item) => matchesRegion(item.lDongRegnCd, areaCode))
    .filter((item) => overlaps({ startDate: item.eventstartdate, endDate: item.eventenddate }, { start, end }))
    .sort((a, b) => a.eventenddate.localeCompare(b.eventenddate) || a.eventstartdate.localeCompare(b.eventstartdate))

  const from = (pageNo - 1) * numOfRows
  return wrap(matched.slice(from, from + numOfRows), {
    pageNo,
    numOfRows,
    totalCount: matched.length,
  })
}

/** detailCommon2 + detailIntro2 흉내. 없는 id면 둘 다 0건 응답 */
export function mockFestivalDetail(id, today = new Date()) {
  const entry = buildRaw(today).find((e) => e.list.contentid === String(id))
  if (!entry) return { common: wrap([]), intro: wrap([]) }

  const { list, intro, overview } = entry
  const common = {
    contentid: list.contentid,
    contenttypeid: '15',
    title: list.title,
    addr1: list.addr1,
    addr2: list.addr2,
    areacode: list.areacode,
    lDongRegnCd: list.lDongRegnCd,
    tel: list.tel,
    homepage: '',
    firstimage: list.firstimage,
    firstimage2: list.firstimage2,
    mapx: list.mapx,
    mapy: list.mapy,
    overview,
  }
  return { common: wrap([common]), intro: wrap([intro]) }
}
