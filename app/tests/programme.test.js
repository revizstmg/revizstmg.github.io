import { test, expect } from 'vitest'
import { dailyPlan, programmeThemes, realThemes, reviewQueue } from '../src/data/study.js'
const premiere = { level: 'premiere-stmg' }
const terminale = { level: 'terminale-stmg', specialty: 'gestion-finance' }
const today = '2026-10-19'

test('le programme bac de Première contient seulement français et mathématiques', () => {
  const themes = programmeThemes(premiere)
  expect(new Set(themes.map((t) => t.subjectId))).toEqual(new Set(['p1-francais', 'p1-maths']))
  expect(dailyPlan({}, premiere, today, 100).map((t) => t.themeId).sort()).toEqual(themes.map((t) => t.themeId).sort())
  expect(realThemes(premiere).some((t) => t.subjectId === 'p1-sgn')).toBe(true)
})

test('une urgence en SDGN ne prend pas la place des objectifs bac de Première', () => {
  const excluded = realThemes(premiere).filter((t) => !['p1-francais', 'p1-maths'].includes(t.subjectId))
  const state = {
    chapters: Object.fromEntries(excluded.map((t) => [t.themeId, { quiz: 10, games: {} }])),
    srs: Object.fromEntries(excluded.map((t) => [t.themeId, { due: '2026-10-18', last: today }])),
  }
  expect(reviewQueue(state, premiere, today)[0].reason).toBe('due')
  const plan = dailyPlan(state, premiere, today)
  expect(plan).toHaveLength(4)
  expect(plan.every((t) => ['p1-francais', 'p1-maths'].includes(t.subjectId) && !t.done)).toBe(true)
})

test('le programme de Terminale conserve la priorité de toutes ses matières', () => {
  expect(programmeThemes(terminale)).toEqual(realThemes(terminale))
  expect(new Set(dailyPlan({}, terminale, today).map((t) => t.subjectId)).size).toBe(4)
})

test('à priorité égale les objectifs de Première alternent les deux matières',()=>{
 const plan=dailyPlan({},premiere,today)
 expect(plan[0].subjectId).not.toBe(plan[1].subjectId)
 expect(plan.filter(t=>t.subjectId==='p1-maths')).toHaveLength(2)
 expect(plan.filter(t=>t.subjectId==='p1-francais')).toHaveLength(2)
})
