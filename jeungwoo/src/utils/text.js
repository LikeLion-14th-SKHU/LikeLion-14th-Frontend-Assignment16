const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
}

/**
 * TourAPI 소개글(HTML 조각) → 줄바꿈이 있는 일반 텍스트
 * <br>은 줄바꿈으로, 나머지 태그는 지운다. 결과는 반드시 텍스트로 렌더링한다
 * (whitespace-pre-line). dangerouslySetInnerHTML은 쓰지 않는다.
 */
export function brToLines(html) {
  if (!html) return ''
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (entity) => ENTITIES[entity])
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 이용요금·공연시간처럼 항목이 줄바꿈 없이 붙어 오는 텍스트를 나눈다.
 * "- VIP석 70,000원- R석 60,000원※ 변경 가능" → 항목과 ※ 앞에서 줄바꿈
 * ("14:00 - 18:00"처럼 앞에 공백이 있는 하이픈은 건드리지 않는다)
 */
export function splitListLines(value) {
  return brToLines(value)
    .replace(/(\S)-\s/g, '$1\n- ')
    .replace(/([^\n])\s*※/g, '$1\n※')
}
