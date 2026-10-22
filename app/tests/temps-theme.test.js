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

import { repairStudyTime, STUDY_STARTED_AT } from '../src/data/studyTime.js'
import { mergeProgress } from '../src/progression.js'

describe('anciens compteurs corrompus', () => {
 const corrupt = { 'gf-t1': 28170042895242380 * 3600, 'philo-art': 57266230613 * 3600, histoire: 6225 * 3600 }
 it('rejette même les nombres finis physiquement impossibles', () => {
  for (const value of Object.values(corrupt)) expect(studySeconds(value)).toBe(0)
  expect(studySeconds(11, STUDY_STARTED_AT + 10000)).toBe(0)
  expect(studySeconds(10, STUDY_STARTED_AT + 10000)).toBe(10)
 })
 it('archive les originaux, garde les durées normales et ne modifie aucun autre progrès', () => {
  const state = { xp: 986, notes: { a: 'à conserver' }, themeTime: { ...corrupt, 'gf-t2': 6480, 'gf-t3': '300' } }
  const repaired = repairStudyTime(state)
  expect(repaired.themeTime).toEqual({ 'gf-t1': 0, 'philo-art': 0, histoire: 0, 'gf-t2': 6480, 'gf-t3': 300 })
  expect(repaired.themeTimeInvalid).toEqual(corrupt)
  expect(repaired.xp).toBe(986)
  expect(repaired.notes).toBe(state.notes)
  expect(state.themeTime['gf-t1']).toBe(corrupt['gf-t1'])
  expect(repairStudyTime(repaired)).toBe(repaired)
 })
 it('ne réintroduit pas une corruption depuis une ancienne copie distante, dans les deux sens', () => {
  const old = { themeTime: corrupt }
  const fresh = { themeTime: { 'gf-t1': 35, 'gf-t2': 6480 } }
  for (const [a, b] of [[fresh, old], [old, fresh]]) {
   const merged = mergeProgress(a, b)
   expect(merged.themeTime['gf-t1']).toBe(35)
   expect(merged.themeTime['gf-t2']).toBe(6480)
   expect(merged.themeTimeInvalid).toEqual(corrupt)
  }
  expect(mergeProgress(old, null).themeTime['gf-t1']).toBe(0)
 })
})
