// iCalendar(.ics) 만들기 (RFC 5545). 구글 캘린더, 애플 캘린더, 아웃룩에서 가져올 수 있어요.
import { STEPS } from './schedule.js'

const KINDS = [
  { key: 'reg', label: '접수' },
  { key: 'exam', label: '시험' },
  { key: 'pass', label: '발표' },
]

function ymd(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
}

function nextDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
}

// 쉼표·세미콜론·역슬래시·줄바꿈은 이스케이프해야 해요
function escapeText(text) {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n')
}

// 한 줄은 75바이트를 넘으면 안 돼요. 한글(UTF-8 3바이트)이 잘리지 않게 글자 단위로 접어요.
const encoder = new TextEncoder()
function fold(line) {
  const parts = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    // 이어지는 줄은 맨 앞 공백 1바이트를 포함해요
    if (bytes + size > (parts.length === 0 ? 75 : 74)) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n ')
}

// cert: 종목, rounds: 그 등급의 회차들, label: "기사·산업기사 일정" 등
// from(오늘) 이전에 끝난 일정은 넣지 않아요.
export function buildIcs({ cert, rounds, label, from, now = new Date() }) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const note = `${label}으로 공고된 등급 공통 일정이에요. 종목별 시행 여부는 Q-Net에서 확인하세요.`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//cert-dday//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(`${cert.name} 시험 일정`)}`,
  ]

  let count = 0
  for (const round of rounds) {
    for (const step of STEPS) {
      for (const kind of KINDS) {
        for (const p of round[step.key][kind.key]) {
          if (from && p.end < from) continue
          count++
          lines.push(
            'BEGIN:VEVENT',
            // 같은 일정을 다시 가져오면 중복 대신 갱신되도록 고정된 UID를 써요
            `UID:${encodeURIComponent(cert.name)}-${round.year}-${round.seq}-${step.key}-${kind.key}-${ymd(p.start)}@cert-dday`,
            `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${ymd(p.start)}`,
            // 종일 일정의 DTEND는 마지막 날의 다음 날이에요
            `DTEND;VALUE=DATE:${ymd(nextDay(p.end))}`,
            `SUMMARY:${escapeText(`[${cert.name}] 제${round.seq}회 ${step.label} ${kind.label}`)}`,
            `DESCRIPTION:${escapeText(note)}`,
            'TRANSP:TRANSPARENT',
            'END:VEVENT',
          )
        }
      }
    }
  }
  lines.push('END:VCALENDAR')
  return { text: lines.map(fold).join('\r\n') + '\r\n', count }
}

export function downloadFile(filename, text, type = 'text/calendar;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
