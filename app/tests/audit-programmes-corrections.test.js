import {test,expect,beforeAll} from 'vitest'
import {readFileSync} from 'node:fs'
import * as C from '../src/data/index.js'
import {verifier,estLibre} from '../src/data/exercicesManuel.js'
import {sqlMatches} from '../src/data/sqlAnswers.js'
import {CALC} from '../src/calc.js'
import {avecGraine} from './outils.js'
const manual=(l,id)=>JSON.parse(readFileSync(new URL(`../resources/langues/${l}.json`,import.meta.url))).exercises.find(x=>x.id===id)
beforeAll(()=>C.chargerTout())
test('les contre-exemples de langues : variantes recevables et accents distinctifs',()=>{
 for(const [l,id,a] of [['en','en-ex-001','has been working'],['en','en-ex-088','He does not work on Sundays.'],['en','en-ex-094','These products are sold.'],['it','it-ex-071','Sono studente.']])expect(verifier(manual(l,id),a)).toBe(true)
 expect(verifier(manual('es','es-ex-117'),'Mi padre esta en casa.')).toBe(false)
 expect(verifier(manual('es','es-ex-006'),'fuímos')).toBe(false)
 expect(verifier(manual('ar','ar-ex-081'),'مَن')).toBe(true)
 expect(verifier(manual('ar','ar-ex-081'),'مِن')).toBe(false)
 for(const id of ['de-ex-008','de-ex-032','de-ex-064','de-ex-068','de-ex-072','de-ex-079','de-ex-084','de-ex-099'])expect(estLibre(manual('de',id))).toBe(true)
})
test('SQL : préserver les littéraux, accepter les alias sans accepter une autre requête',()=>{
 const a="SELECT nom FROM CLIENT WHERE ville = 'Lyon'"
 expect(sqlMatches("SELECT nom FROM CLIENT WHERE ville = 'lyon'",a)).toBe(false)
 expect(sqlMatches("SELECT c.nom FROM CLIENT AS c WHERE c.ville = 'Lyon';",a)).toBe(true)
 expect(sqlMatches("SELECT c.nom FROM CLIENT c WHERE c.ville = 'Paris'",a)).toBe(false)
 expect(sqlMatches(a+'; DELETE FROM CLIENT',a)).toBe(false)
})
test('les exemples résolus ne sont pas des définitions décontextualisées',()=>{
 const sec={h:'Exemple traité : dérivée',blocks:[{t:'list',c:['**Dérivée** : f’(x)=2x−6.']}]}
 expect(C.sectionDefinitions(sec,'math-c3','maths').defs).toEqual([])
})
test('SQL : l’astérisque est conservé dans les questions tirées du cours',()=>{
 const theme=C.ALL_CHAPTERS['sig-t2'];const ch=C.themeChapters(theme).find(ch=>ch.title.includes('SQL')&&JSON.stringify(ch.section).includes('SELECT * = toutes'))
 expect(ch).toBeTruthy()
 const games=C.jeuxDuChapitre(ch,theme)
 const sql=JSON.stringify(games)
 expect(sql).toContain('SELECT *')
 expect(sql).not.toContain('SELECT = toutes')
})
test('pas de distracteurs temporels équivalents sur plusieurs tirages',()=>{
 const t=C.ALL_CHAPTERS['hg-h3'];const ch=C.themeChapters(t).find(ch=>JSON.stringify(ch.section).includes('Les **années 1950-1960**'))
 expect(ch).toBeTruthy()
 for(let n=0;n<20;n++)avecGraine(String(n),()=>{
  for(const g of C.jeuxDuChapitre(ch,t))for(const q of g.questions||[])if(q.choices&&q.choices.some(x=>/années 1950-1960/.test(x)))expect(q.choices).not.toContain('Trente Glorieuses')
 })
})
test('programmes 2026-2027 : parcours et exercices correspondent au niveau',()=>{
 expect(C.ALL_CHAPTERS['math-c7']).toBeUndefined()
 const t=C.ALL_CHAPTERS['math-c8'];expect(t).toBeTruthy()
 expect(JSON.stringify(t.cours)).toMatch(/logarithme/i)
 const p=C.ALL_CHAPTERS['p1-math-c5'];expect(JSON.stringify(p.cours)).toMatch(/Ajustement affine/)
 const p3=C.ALL_CHAPTERS['p1-math-c3'];expect(p3.games.some(g=>g.gen==='discriminant')).toBe(false)
 expect(JSON.stringify(p3.games)).not.toContain('Δ = b²')
})
test('comparaison de suites : premier dépassement au rang 11, pas 9',()=>{
 const first=Array.from({length:20},(_,n)=>n).find(n=>500*1.06**n>500+40*n)
 expect(first).toBe(11)
 expect(JSON.stringify(C.ALL_CHAPTERS['math-c2'].cours)).not.toContain('dès n = 9')
 expect(JSON.stringify(C.ALL_CHAPTERS['math-c2'].cours)).toContain('n = 11')
})
test('les arrondis au centime et au dixième ne valident pas une autre valeur',()=>{
 for(const id of ['valeur_apres_evolution','taux_evolution','seuil'])avecGraine(id,()=>{
  const q=CALC[id]();const wrong=q.answer+(id==='seuil'?100:id==='taux_evolution'?0.1:0.4)
  expect(Math.abs(wrong-q.answer)).toBeGreaterThan(q.tolerance)
 })
})
test('les nouveaux générateurs numériques suivent des résultats indépendants',()=>{
 for(let n=0;n<40;n++)avecGraine(String(n),()=>{
  const q=CALC.image_exponentielle();const [,k,a,x]=q.prompt.match(/= (\d+) × (\d+)\^x.*f\((-?\d+)\)/)
  expect(q.answer).toBe(Math.round(Number(k)*Number(a)**Number(x)*100)/100)
  const l=CALC.logarithme_decimal();expect(Number.isInteger(l.answer)).toBe(true);expect(Math.abs(Math.log10(10**l.answer)-l.answer)).toBeLessThan(1e-10)
 })
})

test('les définitions de CAF, du PIB et de la diversification restent harmonisées',()=>{
 const defs=JSON.parse(readFileSync(new URL('../content/gestion-finance/definitions.json',import.meta.url)))
 expect(JSON.stringify(defs)).toContain('Capacité d’autofinancement (CAF)')
 expect(JSON.stringify(defs)).not.toContain('Capacité d’autofinancement (CAF moins dividendes)')
 const catalogue=JSON.parse(readFileSync(new URL('../content/commun/formules.json',import.meta.url)))
 const items=(cat)=>catalogue.find(c=>c.cat===cat).parts.flatMap(p=>p.items)
 const pib=items('Économie').find(i=>i.name==='PIB aux prix du marché')
 expect(pib.f).toContain('Impôts sur les produits')
 expect(pib.f).toContain('Subventions sur les produits')
 expect(items('Management').find(i=>i.name==='Choix de périmètre').f).toContain('nouveau domaine d’activité stratégique')
 expect(items('Droit').length).toBeGreaterThan(10)
})
