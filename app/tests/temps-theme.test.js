import { describe, it, expect } from 'vitest'
import { studySeconds, activeSeconds } from '../src/data/studyTime.js'
import { fmtDuration } from '../src/components/StatsCharts.jsx'
const t = key => ({ minShort: 'min', hourShort: 'h' })[key]
describe('temps de révision', () => {
 it('valide les anciennes durées et rejette les données invalides', () => {
  expect(studySeconds('125')).toBe(125)
  for (const v of [NaN, Infinity, -5, 'incorrect', undefined]) expect(studySeconds(v)).toBe(0)
 })
 it('conserve les visites courtes, ignore l’arrière-plan et borne les suspensions', () => {
  expect(activeSeconds(1000, 3500, true)).toBe(2.5)
  expect(activeSeconds(1000, 3500, false)).toBe(0)
  expect(activeSeconds(1000, 3601000, true)).toBe(10)
  expect(activeSeconds(1000, 0, true)).toBe(0)
 })
 it('affiche une durée courte sans zéro minute ni arrondi prématuré', () => {
  expect(fmtDuration(2.5, t)).toBe('< 1 min')
  expect(fmtDuration(59, t)).toBe('< 1 min')
  expect(fmtDuration(119, t)).toBe('1 min')
  expect(fmtDuration(3599, t)).toBe('59 min')
  expect(fmtDuration(3900, t)).toBe('1 h 05')
  expect(fmtDuration(Infinity, t)).toBe('0 min')
 })
})
