import {it,expect} from 'vitest'
import {DOMAINES,ETAPES,TOTAL,nettoyerReponses,bilanAvenir,conseilsContexte} from '../src/data/avenir.js'
import {mergeProgress} from '../src/progression.js'
import {estPagePayante,estPageUltimate} from '../src/data/acces.js'
it('56 questions uniques réparties dans huit domaines et le contexte',()=>{
 const ids=ETAPES.flatMap(e=>e.questions.map(q=>q.id));expect(TOTAL).toBe(56);expect(new Set(ids).size).toBe(TOTAL);expect(DOMAINES).toHaveLength(8)
 for(const d of DOMAINES){expect(d.questions).toHaveLength(6);expect(d.formations.length).toBeGreaterThan(0)}
})
it('nettoyage : zéro et inconnue valides, réponses invalides exclues',()=>{
 expect(nettoyerReponses({'finance-0':0,'finance-1':'?','finance-2':8,'finance-3':null,duree:1,cout:10,secret:'texte'})).toEqual({'finance-0':0,'finance-1':'?',duree:1});expect(nettoyerReponses(null)).toEqual({})
})
it('aucune piste privilégiée avec des réponses inconnues ou toutes négatives',()=>{
 for(const value of ['?',0])expect(bilanAvenir(Object.fromEntries(DOMAINES.flatMap(d=>d.questions.map(q=>[q.id,value])))).filter(d=>d.explorable)).toHaveLength(0)
})
it('intérêt expliqué, sans filtrer selon les contraintes ou un niveau scolaire déclaré',()=>{
 const a=Object.fromEntries(DOMAINES.flatMap(d=>d.questions.map(q=>[q.id,d.id==='finance'?4:0])))
 const d=bilanAvenir({...a,mobilite:0,maths:2})[0];expect(d.id).toBe('finance');expect(d.positifs).toHaveLength(6);expect(d.explorable).toBe(true)
 expect(bilanAvenir({'finance-0':4,'finance-1':4})[0].explorable).toBe(false);expect(conseilsContexte({maths:2,mobilite:0}).join(' ')).toMatch(/pas une exclusion/)
})
it('fusion indépendante du dossier Avenir, effacement conservé, révisions préservées',()=>{
 const a={parcours:{maj:50,objectifs:{noteVisee:15},avenir:{maj:40,answers:{'finance-0':4}}}},b={parcours:{maj:100,avenir:{maj:30,answers:{'finance-0':0}}}}
 for(const [x,y] of [[a,b],[b,a]])expect(mergeProgress(x,y).parcours.avenir.answers).toEqual({'finance-0':4})
 const cleared={parcours:{maj:110,avenir:{maj:110,answers:{},step:0,finished:false}}}
 expect(mergeProgress(a,cleared).parcours.avenir.answers).toEqual({});expect(mergeProgress(a,cleared).parcours.objectifs).toEqual({noteVisee:15})
})
it('orientation accessible, parcours de révision toujours Ultimate',()=>{
 expect(estPagePayante('/parcours-avenir')).toBe(false);expect(estPageUltimate('/parcours-avenir')).toBe(false);expect(estPageUltimate('/parcours')).toBe(true)
})

import {ECHELLE,SOURCES,CONTEXTE} from '../src/data/avenir.js'
import {readFileSync} from 'node:fs'
for(const lang of ['en','es','it','de','ar'])it(`questionnaire et conseils Avenir disponibles hors ligne en ${lang}`,()=>{
 const book=JSON.parse(readFileSync(new URL(`../src/localisation/public.${lang}.json`,import.meta.url),'utf8'))
 const keys=[...DOMAINES.flatMap(d=>[d.title,d.intro,d.vigilance,...d.questions.map(q=>q.label),...d.metiers]),...CONTEXTE.flatMap(q=>[q.label,...q.options]),...ECHELLE.map(o=>o.label),...SOURCES.map(s=>s[0])]
 for(let i=0;i<4;i++)keys.push(...conseilsContexte({duree:i,alternance:i,mobilite:i,cout:i,cadre:i,maths:i,redaction:i}))
 for(const key of keys)expect(typeof book[key],`${lang}: ${key}`).toBe('string')
})

import {notesPourAvenir} from '../src/data/avenir.js'
it('notes : zéro conservé, cinq plus récentes et niveau courant, saisie facultative',()=>{
 const list=[...Array.from({length:6},(_,i)=>({matiere:'maths',note:i===0?20:0,date:`2026-10-${10+i}`})),{matiere:'p1-maths',note:20,date:'2026-11-01'},{matiere:'maths',note:30}]
 expect(notesPourAvenir(list,{},['maths']).maths).toBe(0)
 expect(notesPourAvenir(list,{maths:'12,5'},['maths']).maths).toBe(12.5)
 expect(notesPourAvenir(list,{maths:''},['maths']).maths).toBeUndefined()
 expect(notesPourAvenir(list,{maths:'invalide'},['maths']).maths).toBeUndefined()
 expect(notesPourAvenir(list,{'gestion-finance':'20'},['maths'])['gestion-finance']).toBeUndefined()
})
it('les notes départagent des intérêts proches, sans créer ni supprimer une piste',()=>{
 const a=Object.fromEntries(DOMAINES.flatMap(d=>d.questions.map(q=>[q.id,['finance','droit'].includes(d.id)?4:0])))
 const rows=bilanAvenir(a,{'gestion-finance':0,sgn:0,maths:0,economie:0,droit:20,philosophie:20,francais:20})
 expect(rows[0].id).toBe('droit');expect(rows.find(d=>d.id==='finance').explorable).toBe(true)
 for(const d of rows)expect(Math.abs(d.bonus)).toBeLessThanOrEqual(.2)
 expect(bilanAvenir({}, {droit:20}).some(d=>d.explorable)).toBe(false)
 expect(bilanAvenir(a,{maths:80}).find(d=>d.id==='finance').bonus).toBe(0)
 expect(bilanAvenir(a).every(d=>d.bonus===0)).toBe(true)
})
