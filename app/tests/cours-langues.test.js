import {beforeAll,expect,test} from 'vitest'
import {readFileSync} from 'node:fs'
import * as C from '../src/data/index.js'
import {chaptersForLanguages} from '../src/data/studyLanguages.js'
import {avecGraine} from './outils.js'
const source=id=>JSON.parse(readFileSync(new URL(`../content/${id}/matiere.json`,import.meta.url)))
beforeAll(async()=>{await C.chargerMatiere('langues');await C.chargerMatiere('p1-langues')})
for(const sid of ['langues','p1-langues']) {
 test(`${sid} : arabe et italien possèdent des cours et des exercices dans chaque section`,()=>{
  for(const lang of ['ar','it']) {
   const themes=chaptersForLanguages(C.getSubject(sid).chapters,[lang]).filter(t=>t.id!=='p1-lng-axes')
   expect(themes).toHaveLength(4)
   expect(themes.every(t=>t.id.startsWith(`lng-${lang}-`))).toBe(true)
   for(const t of themes) for(const [idx,ch] of C.themeChapters(t).entries()) {
    expect(ch.section.blocks.filter(b=>b.t==='p').map(b=>b.c).join(' ').length).toBeGreaterThan(600)
    const authored=t.games.find(g=>g.id.includes(`-s${idx+1}-qcm`))
    expect(authored).toBeTruthy()
    expect(C.jeuxDuChapitre(ch,t).some(g=>g.id===authored.id)).toBe(true)
    for(const g of t.games.filter(g=>g.id!==authored.id)) expect(ch.games.some(x=>x.id===g.id)).toBe(false)
    for(const q of authored.questions) {
     expect(q.choices[q.answer]).toBeTruthy()
     expect(new Set(q.choices).size).toBe(q.choices.length)
     expect(q.explain.length).toBeGreaterThan(20)
    }
   }
  }
 })
 test(`${sid} : une section garde ses exercices si les autres sections changent`,()=>{
  for(const lang of ['ar','it']) {
   const t=C.getSubject(sid).chapters.find(t=>t.id.startsWith(`lng-${lang}-`)&&t.id.endsWith('-gram'))
   const changed={...t,cours:t.cours.map((s,i)=>i===0?s:{h:'Intrus',blocks:[{t:'p',c:'Le droit des sociétés et la TVA.'}]})}
   const vue=x=>avecGraine('langues-isolation',()=>C.jeuxDuChapitre(C.themeChapters(x)[0],x))
   expect(vue(changed)).toEqual(vue(t))
  }
 })
}
test('les axes de Première et Terminale restent dans le niveau associé',()=>{
 for(const lang of ['ar','it']) {
  const terminale=source('langues').chapters.filter(t=>t.id.startsWith(`lng-${lang}-`))
  const premiere=source('p1-langues').chapters.filter(t=>t.id.startsWith(`lng-${lang}-`))
  expect(terminale.some(t=>t.id.endsWith('culture-premiere'))).toBe(false)
  expect(premiere.some(t=>t.id.endsWith('culture-terminale'))).toBe(false)
  expect(terminale.find(t=>t.id.endsWith('culture-terminale')).cours).toHaveLength(6)
  expect(premiere.find(t=>t.id.endsWith('culture-premiere')).cours).toHaveLength(6)
 }
})
test('le choix en Première conserve anglais/espagnol et les repères communs sans afficher les autres langues',()=>{
 const chapters=C.getSubject('p1-langues').chapters
 expect(chaptersForLanguages(chapters,['en']).map(t=>t.id)).toEqual(['p1-lng-en','p1-lng-axes'])
 expect(chaptersForLanguages(chapters,['es']).map(t=>t.id)).toEqual(['p1-lng-es','p1-lng-axes'])
 expect(chaptersForLanguages(chapters,['ar']).filter(t=>t.id!=='p1-lng-axes').every(t=>t.id.startsWith('lng-ar-'))).toBe(true)
})
test('un QCM dédié exige un rattachement explicite ; les anciens QCM de synthèse restent au thème',()=>{
 const t=C.ALL_CHAPTERS['lng-it-gram'], g=t.games[0]
 expect(C.themeChapters({...t,games:[{...g,id:'non-rattache',sectionOnly:true}]}).every(ch=>!ch.games.some(x=>x.id==='non-rattache'))).toBe(true)
 expect(C.themeChapters({...t,games:[{...g,sectionOnly:false}]}).every(ch=>!ch.games.some(x=>x.id===g.id))).toBe(true)
})
