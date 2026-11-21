// npm test — 등급 계산 경계값 검사
import assert from 'node:assert/strict'
import { POLLUTANTS, activityGuide, formatMeasuredAt, gradeOf, overallGrade } from './airQuality.js'

const [pm, fpm, ozone] = POLLUTANTS

assert.equal(gradeOf(pm, 30), '좋음')
assert.equal(gradeOf(pm, 31), '보통')
assert.equal(gradeOf(pm, 80), '보통')
assert.equal(gradeOf(pm, 81), '나쁨')
assert.equal(gradeOf(pm, 151), '매우나쁨')
assert.equal(gradeOf(fpm, 15), '좋음')
assert.equal(gradeOf(fpm, 36), '나쁨')
assert.equal(gradeOf(ozone, 0.091), '나쁨')
assert.equal(gradeOf(pm, null), '정보없음')
assert.equal(gradeOf(pm, '점검중'), '정보없음')

// 통합 등급은 '보통'이어도 초미세먼지가 '나쁨'이면 나쁨
assert.equal(overallGrade({ CAI_GRD: '보통', PM: 40, FPM: 40 }), '나쁨')
assert.equal(overallGrade({ CAI_GRD: '좋음', PM: 10, FPM: 5 }), '좋음')
assert.equal(overallGrade({ CAI_GRD: null, PM: null, FPM: null }), '정보없음')

assert.equal(activityGuide('나쁨').length, 4)
assert.equal(activityGuide('정보없음')[0].status, '-')
assert.equal(formatMeasuredAt('202611212200'), '11월 21일 22:00')
assert.equal(formatMeasuredAt(undefined), '')

console.log('airQuality: all checks passed')
