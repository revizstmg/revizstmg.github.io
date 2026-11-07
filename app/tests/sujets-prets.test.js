import { test, expect, beforeAll } from 'vitest'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildExamPdf } from '../src/data/examPdf.js'
import sujets from '../src/data/sujets/prets.json'
import { SUJETS_PRETS, sujetsPourNiveau } from '../src/data/sujetsPrets.js'
import { checkGeneratedExam } from '../../supabase/functions/examen-blanc/contract.js'
import { genererSujetsPrets } from '../scripts/sujets-prets.mjs'
import { chargerTout, SUBJECTS, themeChapters } from '../src/data/index.js'
let courses
beforeAll(async()=>{
 await chargerTout()
 courses=new Map(SUBJECTS.flatMap(s=>(s.chapters||[]).flatMap(t=>themeChapters(t).map(c=>[c.id,{...c,level:s.niveau==='premiere'?'premiere':'terminale'}]))))
})
test('onze vrais sujets, niveaux séparés et index léger fidèle aux dossiers',()=>{
 expect(sujets).toHaveLength(11)
 expect(new Set(sujets.map(s=>s.id)).size).toBe(11)
 for(const s of sujets){
  expect(checkGeneratedExam(s.exam,s.courses,s.duration)).toEqual(s.exam)
  expect(SUJETS_PRETS.find(x=>x.id===s.id)).toEqual({id:s.id,level:s.level,subject:s.subject,summary:s.summary,duration:s.duration,title:s.exam.title,documents:s.exam.documents.length,questions:s.exam.questions.length})
  for(const c of s.courses){expect(courses.has(c.id),c.id).toBe(true);expect(courses.get(c.id).level,c.id).toBe(c.level)}
  if(s.level==='premiere')expect(s.courses.every(c=>c.level==='premiere')).toBe(true)
  for(const q of s.exam.questions){expect(q.correction.length).toBeGreaterThan(180);expect(q.criteria.length).toBeGreaterThanOrEqual(3)}
  for(const d of s.exam.documents)expect(d.text.length).toBeGreaterThan(200)
 }
 expect(sujetsPourNiveau('premiere')).toHaveLength(5)
 expect(sujetsPourNiveau('terminale')).toHaveLength(6)
})
test('les dossiers chiffrés expliquent les calculs et le bon dénominateur',()=>{
 const gf=sujets.find(s=>s.id==='terminale-gf').exam.questions
 for(const [i,montant] of [[0,'2 000'],[1,'7 200'],[2,'15 000'],[3,'75 000']])expect(gf[i].correction).toContain(montant)
 expect(24000*.2-2800).toBe(2000)
 expect(12000-2*12000/5).toBe(7200)
 expect((150000-110000)-(60000-35000)).toBe(15000)
 expect(30000/(1-.6)).toBe(75000)
 const eco=sujets.find(s=>s.id==='premiere-economie').exam.questions
 expect(eco[1].correction).toContain('15 %')
 expect((2900-2465)/2900).toBe(.15)
 expect((1.04/1.05-1)*100).toBeCloseTo(-.95238,4)
 expect(eco[2].correction).toContain('-0,95 %')
})
test('versions deux heures : deux parties indépendantes de dix points et critères ajustés',()=>{
 for(const s of sujets.filter(s=>s.duration===120))for(const p of [1,2]){
  const qs=s.exam.questions.filter(q=>q.id.startsWith(`p${p}-`))
  expect(qs).toHaveLength(6)
  expect(qs.reduce((n,q)=>n+q.points,0)).toBe(10)
  for(const q of qs)expect(q.criteria.join(' ')).toContain('0,5 point')
 }
})
test('compilation : vingt-deux PDF valides et distincts, dont les corrigés séparés',()=>{
 const dir=mkdtempSync(join(tmpdir(),'revizstmg-sujets-'))
 try{
  genererSujetsPrets(dir)
  expect(readdirSync(join(dir,'sujets-prets'))).toHaveLength(22)
  for(const s of sujets){
   const a=readFileSync(join(dir,'sujets-prets',`${s.id}-sujet.pdf`)),b=readFileSync(join(dir,'sujets-prets',`${s.id}-corrige.pdf`))
   expect(a.subarray(0,5).toString()).toBe('%PDF-');expect(b.subarray(0,5).toString()).toBe('%PDF-')
   expect(a.equals(b)).toBe(false)
  }
 }finally{rmSync(dir,{recursive:true,force:true})}
})

test('le corrigé court de gestion-finance ne crée pas une page pour deux références',()=>{
 const s=sujets.find(s=>s.id==='terminale-gf')
 expect(buildExamPdf(s,true).getNumberOfPages()).toBeLessThanOrEqual(3)
})
