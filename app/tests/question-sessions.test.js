import {test,expect,vi,afterEach} from 'vitest'
import {selectQuestionSession,questionKey,drawQuestionSession,rememberQuestionSession} from '../src/data/questionSessions.js'
import {avecGraine} from './outils.js'
const bank=Array.from({length:18},(_,i)=>({text:`Le chapitre présente le concept ____ numéro ${i}.`,answer:`concept ${i}`,drawSource:`phrase ${i}`}))
afterEach(()=>vi.unstubAllGlobals())
test('trois parties couvrent une grande banque avant de répéter des questions',()=>{
 let previous={},seen=[]
 for(let i=0;i<3;i++){
  const session=avecGraine(`partie-${i}`,()=>selectQuestionSession(bank,6,previous))
  expect(session.questions).toHaveLength(6)
  expect(session.questions.some(q=>seen.includes(questionKey(q)))).toBe(false)
  seen.push(...session.questions.map(questionKey));previous=session.history
 }
 expect(new Set(seen).size).toBe(18)
})
test('une seule variante de la même phrase par partie ; un autre mot peut être masqué à la suivante',()=>{
 const variants=bank.slice(0,6).flatMap(q=>[q,{...q,text:q.text.replace('concept','terme'),answer:q.answer+' autre'}])
 const first=selectQuestionSession(variants,6)
 expect(new Set(first.questions.map(q=>q.drawSource)).size).toBe(6)
 const second=selectQuestionSession(variants,6,first.history)
 expect(second.questions.every(q=>!first.questions.some(old=>questionKey(old)===questionKey(q)))).toBe(true)
})
test('une banque courte reste exacte, sans doublon ni question inventée, et change la première question',()=>{
 const first=selectQuestionSession(bank.slice(0,3),6)
 const second=selectQuestionSession(bank.slice(0,3),6,first.history)
 expect(second.questions).toHaveLength(3)
 expect(second.questions.every(q=>bank.includes(q))).toBe(true)
 expect(questionKey(first.questions[0])).not.toBe(questionKey(second.questions[0]))
})
test('les tirages survivent au retour à l’exercice et sont isolés entre comptes',()=>{
 const values={};vi.stubGlobal('sessionStorage',{getItem:k=>values[k]||null,setItem:(k,v)=>{values[k]=v},removeItem:k=>{delete values[k]}})
 const game={id:'isolement-test',questionCount:6,questions:bank}
 const a=drawQuestionSession(game,'eleve-a');rememberQuestionSession(a)
 const b=drawQuestionSession(game,'eleve-a')
 expect(b.questions.some(q=>a.questions.includes(q))).toBe(false)
 const other=avecGraine('autre',()=>drawQuestionSession(game,'eleve-b'))
 expect(other.drawKey).not.toBe(a.drawKey)
 expect(other.drawHistory.seen).toHaveLength(6)
 expect(game.questions).toBe(bank)
})
test('pas de tirage sur le carnet d’erreurs ni sur un exercice sans limite explicite',()=>{
 const errors={id:'erreurs',questions:bank.slice(0,2)}
 expect(drawQuestionSession(errors,'eleve-a')).toBe(errors)
})
