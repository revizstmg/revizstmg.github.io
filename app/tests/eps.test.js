import { describe,it,expect } from 'vitest'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import sources from '../content/eps/sources.json'
import {activities,scales,makeTraining,performance800} from '../src/data/eps.js'
describe('EPS national et entraînement',()=>{
 it('couvre les 26 activités nationales, regroupées dans les cinq champs',()=>{
  expect(activities).toHaveLength(26);expect(new Set(activities.map(a=>a.id)).size).toBe(26)
  expect([1,2,3,4,5].map(c=>activities.filter(a=>a.ca===c).length)).toEqual([4,4,4,9,5])
  expect(new Set(activities.map(a=>a.home)).size).toBe(26)
  for(const a of activities)expect([a.conditions,a.practice,a.home,a.skill1,a.skill2,a.role].every(Boolean)).toBe(true)
 })
 it('distingue les seuils CCF du tableau ponctuel et des autres composantes',()=>{
  expect(scales.medians).toHaveLength(24)
  expect(scales.medians.find(r=>r.event==='800 m')).toEqual({event:'800 m',boys:'3 min 08 s',girls:'3 min 56 s'})
  for(const rows of Object.values(scales.ponctuel))expect(rows.reduce((sum,r)=>sum+r[1],0)).toBe(20)
  expect(scales.performance800).toHaveLength(20)
  for(const r of scales.performance800){expect(performance800(r.girls,'girls')).toBe(r.points);expect(performance800(r.boys,'boys')).toBe(r.points)}
  expect(performance800(153,'boys')).toBe(9.5);expect(performance800(152,'boys')).toBe(10)
  expect(performance800(240,'boys')).toBe(null);expect(performance800(NaN,'girls')).toBe(null)
  expect(performance800(0,'girls')).toBe(null);expect(performance800(150,'invalid')).toBe(null)
 })
 it('adapte les huit séances à chaque activité, au temps et au niveau sans augmenter la charge en semaine quatre',()=>{
  for(const a of activities)for(const duration of [20,30,45])for(const level of ['reprise','regulier','a-laise'])for(const access of ['home','supervised']){
   const p=makeTraining({activityId:a.id,duration,level,access});expect(p.weeks).toHaveLength(4)
   const sessions=p.weeks.flatMap(w=>w.sessions);expect(sessions).toHaveLength(8)
   for(const s of sessions){expect(s.blocks.reduce((sum,b)=>sum+b.minutes,0)).toBe(duration);expect(s.effort).toBeLessThanOrEqual(6);expect(s.blocks[1].text).toBe(access==='home'?a.home:a.practice)}
   expect(p.weeks[3].sessions[0].effort).toBeLessThan(p.weeks[2].sessions[0].effort)
  }
 })
 it('fournit les trois PDF officiels entiers et inchangés',()=>{
  expect(sources.documents).toHaveLength(3)
  for(const doc of sources.documents){
   const bytes=readFileSync(new URL('../public/eps/'+doc.file,import.meta.url))
   expect(bytes.subarray(0,5).toString()).toBe('%PDF-')
   expect(createHash('sha256').update(bytes).digest('hex')).toBe(doc.sha256)
   expect(doc.url).toMatch(/^https:\/\/(www\.education\.gouv\.fr|eduscol\.education\.gouv\.fr)\//)
  }
 })
 it('refuse les choix invalides plutôt que de générer un programme incohérent',()=>{
  for(const bad of [{activityId:'fake'},{activityId:'courses',duration:0},{activityId:'courses',level:'expert'},{activityId:'courses',access:'solo-pool'}])expect(()=>makeTraining(bad)).toThrow()
 })
})
