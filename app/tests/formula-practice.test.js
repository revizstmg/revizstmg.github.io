import { test, expect } from 'vitest'
import { FORMULA_PRACTICE, formulasForTrack, generateFormulaExercise, buildFormulaSession, checkFormulaAnswer } from '../src/data/formulaPractice.js'
import { FORMULAS } from '../src/data/formulas.js'
import { resolveTabs } from '../src/navTabs.js'
test('les formules sont rattachées au catalogue et filtrées par filière',()=>{
 expect(new Set(FORMULA_PRACTICE.map(f=>f.id)).size).toBe(FORMULA_PRACTICE.length)
 for(const f of FORMULA_PRACTICE) expect(FORMULAS.find(c=>c.cat===f.cat)?.parts.flatMap(p=>p.items).find(i=>i.name===f.name)?.f).toBe(f.formula)
 const premiere=formulasForTrack({level:'premiere-stmg'})
 expect(premiere.length).toBeGreaterThan(10)
 expect(premiere.some(f=>f.terminale)).toBe(false)
 expect(formulasForTrack({level:'terminale-stmg',specialty:'mercatique'}).some(f=>f.cat==='Gestion & Finance')).toBe(false)
 expect(formulasForTrack({level:'terminale-stmg',specialty:'gestion-finance'}).some(f=>f.cat==='Gestion & Finance')).toBe(true)
 expect(formulasForTrack(null)).toEqual([])
 expect(resolveTabs(['accueil','express','formules'])).toEqual(['accueil','formules'])
})
test('les tirages produisent des résultats finis, variés et des corrections numériques',()=>{
 for(const f of FORMULA_PRACTICE){
  const answers=new Set()
  for(let i=0;i<100;i++){
   const q=generateFormulaExercise(f)
   expect(Number.isFinite(q.answer)).toBe(true)
   expect(q.calculation).not.toMatch(/NaN|undefined|Infinity/)
   expect(checkFormulaAnswer(String(q.answer).replace('.',','),q.answer,f.decimals || 2)).toBe(true)
   expect(checkFormulaAnswer(String(q.answer+1),q.answer)).toBe(false)
   answers.add(q.answer)
  }
  if (['Dérivée d’une constante','Dérivée de x','Symétrie de la loi normale'].includes(f.name)) expect(answers.size).toBe(1)
  else expect(answers.size,f.id).toBeGreaterThan(1)
 }
})
test('calculs de référence : TVA, seuil, salaire et taux composés',()=>{
 const expected={f03:0,f04:0.6,f06:-51,f07:66.67,f15:10,f16:110,f17:109.09,f25:5000,f38:1700,f39:2500}
 for(const [id,answer] of Object.entries(expected)) expect(generateFormulaExercise(FORMULA_PRACTICE.find(f=>f.id===id),()=>0).answer).toBe(answer)
})
test('la séance ne mélange que les formules choisies et les fait toutes travailler',()=>{
 const fs=FORMULA_PRACTICE.slice(0,3),session=buildFormulaSession(fs,9)
 expect(session).toHaveLength(9)
 for(const f of fs) expect(session.filter(q=>q.formula.id===f.id)).toHaveLength(3)
 expect(buildFormulaSession([],5)).toEqual([])
 for(const invalid of ['', 'abc','1foo','Infinity','NaN','1,2,3']) expect(checkFormulaAnswer(invalid,0)).toBeNull()
 expect(checkFormulaAnswer('1 234,56',1234.56)).toBe(true)
 expect(checkFormulaAnswer('−2.5',-2.5)).toBe(true)
 expect(checkFormulaAnswer('١٬٢٣٤٫٥٦',1234.56)).toBe(true)
 expect(checkFormulaAnswer('9'.repeat(400),0)).toBeNull()
})

// Un lien d’aide doit mener à une matière/thème existant, y compris en Première.
test('les liens de cours de l’atelier existent pour chaque filière',async()=>{
 const {formulaCourse}=await import('../src/data/workshopSession.js')
 const {SUBJECTS}=await import('../src/data/index.js')
 for(const track of [{level:'premiere-stmg'},...['gestion-finance','mercatique','rh-communication','sig'].map(specialty=>({level:'terminale-stmg',specialty}))]){
  for(const formula of formulasForTrack(track,true)){
   const [, ,sid,,tid]=formulaCourse(formula,track).split('/')
   const subject=SUBJECTS.find(s=>s.id===sid)
   expect(subject,formula.id).toBeTruthy()
   if(tid)expect(subject.chapters.some(c=>c.id===tid),`${formula.id}:${tid}`).toBe(true)
  }
 }
})

test('les calculs avancés suivent des identités indépendantes du moteur',()=>{
 const find=name=>FORMULA_PRACTICE.find(f=>f.name===name)
 const q=(name)=>generateFormulaExercise(find(name),()=>0)
 expect(q('Discriminant').answer).toBe(100**2-4*100*100)
 expect(q('Loi binomiale B(n ; p)').answer).toBeCloseTo(5*0.2*0.8**4,4)
 expect(q('Au moins k succès').answer).toBeCloseTo(1-0.8**5,4)
 expect(q('Écart-type (loi binomiale)').answer).toBeCloseTo(Math.sqrt(10*0.1*0.9),4)
 expect(q('Somme de termes géométriques').answer).toBeCloseTo(10+10*1.02,2)
 expect(q('Moyenne pondérée').answer).toBe(1)
 expect(q('TVA à partir du TTC').answer).toBe(20)
 expect(q('Taux d’amortissement linéaire').answer).toBe(50)
 expect(q('Borne supérieure de confiance').answer).toBe(0.5)
 expect(checkFormulaAnswer('0,6513',0.6513,4)).toBe(true)
 expect(checkFormulaAnswer('0,65',0.6513,4)).toBe(false)
})
test('catalogue complet, paramètres cohérents aux bornes et accès à toutes les filières',()=>{
 expect(formulasForTrack({level:'premiere-stmg'},true)).toEqual(FORMULA_PRACTICE)
 for(const cat of FORMULAS) for(const part of cat.parts) for(const item of part.items) {
  if (/[÷×√−]/.test(item.f)) expect(FORMULA_PRACTICE.some(f=>f.cat===cat.cat && f.name===item.name),`${cat.cat}: ${item.name}`).toBe(true)
 }
 for(const f of FORMULA_PRACTICE){
  expect(f.group,f.id).toBeTruthy()
  expect(f.course,f.id).toBeTruthy()
  for(const rand of [()=>0,()=>0.999999]){
   const q=generateFormulaExercise(f,rand)
   expect(Number.isFinite(q.answer),f.id).toBe(true)
   for(const p of f.inputs){
    expect(q.values[p.symbol],f.id).toBeGreaterThanOrEqual(p.min-1e-8)
    expect(q.values[p.symbol],f.id).toBeLessThanOrEqual(p.max+1e-8)
   }
   if(f.cat==='Mathématiques' && /Probabilité|Probabilités|Réunion|Indépendance|succès|Loi binomiale|Équiprobabilité|contraire/.test(f.name) && !/Espérance|Variance|Écart-type/.test(f.name)) {
    expect(q.answer,f.id).toBeGreaterThanOrEqual(0)
    expect(q.answer,f.id).toBeLessThanOrEqual(f.unit==='%' ? 100 : 1)
   }
  }
 }
})
