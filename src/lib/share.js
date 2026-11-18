import { findCert } from './certs.js'

// 공유 링크: /share?c=종목명,종목명  (종목명에는 쉼표가 없어요. CSV를 쉼표로 나눠 만들었기 때문이에요)
const MAX = 30

export function shareUrl(names, origin = window.location.origin) {
  const params = new URLSearchParams({ c: names.slice(0, MAX).join(',') })
  return `${origin}/share?${params}`
}

// 주소에서 읽은 값은 믿지 않고, 실제 종목 목록에 있는 이름만 남겨요
export function parseShared(value) {
  const seen = new Set()
  const certs = []
  for (const name of (value ?? '').split(',')) {
    const cert = findCert(name.trim())
    if (cert && !seen.has(cert.name)) {
      seen.add(cert.name)
      certs.push(cert)
    }
    if (certs.length >= MAX) break
  }
  return certs
}
