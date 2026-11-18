// docs/의 "국가자격 종목 목록 정보" CSV(EUC-KR)를 UTF-8 JSON으로 바꿔 src/data/certs.json에 저장해요.
// 사용법: npm run data:certs  (새 CSV를 받으면 docs/에 넣고 다시 실행해요)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const DOCS = new URL('../docs/', import.meta.url)
const OUT = new URL('../src/data/certs.json', import.meta.url)

const csvName = readdirSync(DOCS)
  .filter((name) => name.includes('종목 목록 정보') && name.endsWith('.csv'))
  .sort()
  .at(-1)
if (!csvName) throw new Error('docs/에서 "종목 목록 정보" CSV를 찾지 못했어요.')

// fatal: 잘못된 바이트가 있으면 조용히 깨지지 않고 오류를 내요
const text = new TextDecoder('euc-kr', { fatal: true }).decode(
  readFileSync(new URL(csvName, DOCS)),
)

const [header, ...lines] = text.split(/\r?\n/).filter(Boolean)
const expected = '자격구분코드,자격구분명,계열명,종목명'
if (header.replace(/^﻿/, '') !== expected) {
  throw new Error(`CSV 헤더가 달라요: ${header}`)
}

const certs = lines.map((line, i) => {
  const cols = line.split(',')
  if (cols.length !== 4) throw new Error(`${i + 2}번째 줄의 열 개수가 4개가 아니에요: ${line}`)
  const [qualgbCd, qualgbNm, series, name] = cols.map((c) => c.trim())
  // 국가기술자격(T)의 계열명은 일정 API의 등급(기술사·기능장·기사·기능사)과 같아요
  return { name, qualgbCd, qualgbNm, grade: qualgbCd === 'T' ? series : null }
})

const names = new Set(certs.map((c) => c.name))
if (names.size !== certs.length) throw new Error('종목명이 중복돼요. 주소(/cert/:id)에 종목명을 쓰고 있어서 확인이 필요해요.')

writeFileSync(OUT, JSON.stringify(certs, null, 0).replace(/},{/g, '},\n{') + '\n')
console.log(`${csvName} → src/data/certs.json (${certs.length}개)`)
