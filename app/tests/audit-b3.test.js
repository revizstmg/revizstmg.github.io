import { it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { BADGES, badgesForTrack } from '../src/badges.js'
import { loadPublicLocale, knownPublicText } from '../src/localisation/catalogue.js'
import { chargerMatieres, ALL_CHAPTERS, casPratiquesDuTheme } from '../src/data/index.js'
import { createVacances, vacancesChapters, vacancesSubjects, prepareVacancesSession, answerVacances } from '../src/data/vacances.js'

it('les badges de matière sont accessibles en Première et les spécialités étrangères sont exclues',()=>{
 const track={level:'premiere-stmg'},ids=badgesForTrack(track).map(b=>b.id)
 expect(ids).not.toContain('gestion_pro');expect(ids).not.toContain('philosophe');expect(ids).not.toContain('polyglotte')
 expect(BADGES.find(b=>b.id==='manager').check({track},{bySubject:{'p1-management':90,management:0}})).toBe(true)
 expect(badgesForTrack({level:'terminale-stmg',specialty:'mercatique'}).map(b=>b.id)).not.toContain('sig_pro')
 expect(BADGES.find(b=>b.id==='sig_pro').name).toBe('Analyse financière')
})
it('une phrase avec plusieurs espaces et un nom de matière canonique reste hors ligne',async()=>{
 for(const lang of ['en','de','es','it','ar']){
  await loadPublicLocale(lang)
  expect(knownPublicText('Gestion & Finance',lang)).toBeTruthy()
  expect(knownPublicText('Gestion et Finance',lang)).toBe(knownPublicText('Gestion et finance',lang))
  const p='**Éditeurs** : Matys DONAT et Gabriel MERLIN, élèves, à titre non professionnel et non commercial. Ils sont aussi responsables de la publication. Contact :  [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]].'
  expect(knownPublicText(p,lang)).toBeTruthy()
 }
})
it('chaque chapitre proposé seul dans Vacances tient les deux rythmes sans répétition excessive',async()=>{
 await chargerMatieres(['droit','economie','management','p1-droit','p1-economie','p1-management'])
 for(const track of [{level:'premiere-stmg'},{level:'terminale-stmg',specialty:'gestion-finance'}])for(const subject of vacancesSubjects(track))for(const ch of vacancesChapters(subject))for(const rhythm of [3,4]){
  let p=createVacances({subject,track,selection:[ch.id],startDate:'2026-12-20',id:'audit-'+ch.id,rhythm})
  expect(p.questionsPerSession).toBeGreaterThanOrEqual(1)
  for(const q of p.initialQuestions)p=answerVacances(p,'initial',q.id,q.answer)
  const used=new Map()
  for(let i=0;i<p.sessions.length;i++){
   p=prepareVacancesSession(JSON.parse(JSON.stringify(p)),i)
   expect(p.sessions[i].questions.length,`${ch.id} séance ${i}`).toBe(p.questionsPerSession)
   for(const q of p.sessions[i].questions){used.set(q.id,(used.get(q.id)||0)+1);p=answerVacances(p,i,q.id,q.answer)}
  }
  expect(Math.max(...used.values())).toBeLessThanOrEqual(2)
 }
},120000)
it('les cas transversaux existent au niveau du thème sans placement arbitraire dans le chapitre',()=>{
 expect(casPratiquesDuTheme('inexistant')).toEqual([])
 const themes=Object.keys(ALL_CHAPTERS).filter(id=>casPratiquesDuTheme(id).length)
 expect(themes.length).toBeGreaterThan(0)
 for(const id of themes)expect(casPratiquesDuTheme(id).every(c=>c.questions?.length)).toBe(true)
})
it('les textes légaux sont traduits comme phrases entières sans perdre les liens',()=>{
 for(const lang of ['en','es','it','de','ar']){
  const d=JSON.parse(readFileSync(new URL(`../src/localisation/public.${lang}.json`,import.meta.url),'utf8'))
  for(const [key,value] of Object.entries(d))if(key.includes('[[revizstmg@gmail.com|'))expect(value).toContain('|mailto:revizstmg@gmail.com]]')
 }
})
