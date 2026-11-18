import { useMemo } from 'react'
import { useExamSchedule } from './useExamSchedule.js'
import { gradeOf, groupRounds } from '../lib/schedule.js'

export const GRADES = ['기술사', '기능장', '기사', '기능사']

// 일정을 등급별 회차 목록으로 묶어서 돌려줘요. Map<등급, 회차[]>
export function useRoundsByGrade() {
  const { status, items, error } = useExamSchedule()
  const roundsByGrade = useMemo(
    () => new Map(GRADES.map((g) => [g, groupRounds(items.filter((i) => gradeOf(i) === g))])),
    [items],
  )
  return { status, error, roundsByGrade }
}
