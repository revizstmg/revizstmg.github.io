import {beforeEach,afterEach,test,expect,vi} from 'vitest'
vi.mock('../src/auth.js',()=>({getSession:()=>globalThis.testSession}))
vi.mock('../src/classroom.js',()=>({submitQuizResult:vi.fn()}))
import {pendingQuizResults,queueQuizResult,flushQuizResults} from '../src/quizOutbox.js'
import {withNetworkTimeout} from '../src/networkTimeout.js'
import {readWorkshop,saveWorkshop} from '../src/data/workshopSession.js'
import {buildFormulaSession,FORMULA_PRACTICE} from '../src/data/formulaPractice.js'
beforeEach(()=>{const values=new Map();vi.stubGlobal('localStorage',{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)});vi.stubGlobal('testSession',{user:{id:'eleve'}})})
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers()})
const result={quizId:'quiz-1',name:'Élève',score:2,total:3}
test('un échec conserve le résultat ; une reprise confirmée le retire',async()=>{
 queueQuizResult('eleve',result)
 await expect(flushQuizResults('eleve',async()=>{throw Error('réseau')})).rejects.toThrow()
 expect(pendingQuizResults('eleve')).toHaveLength(1)
 const send=vi.fn().mockResolvedValue(undefined)
 await flushQuizResults('eleve',send)
 expect(send.mock.calls[0][0]).toMatchObject(result)
 expect(pendingQuizResults('eleve')).toHaveLength(0)
})
test('les résultats ne passent jamais sous une autre session, même après déconnexion',async()=>{
 queueQuizResult('eleve',result);const send=vi.fn()
 globalThis.testSession={user:{id:'prof'}}
 await expect(flushQuizResults('eleve',send)).rejects.toThrow(/session/)
 globalThis.testSession=null
 await expect(flushQuizResults('eleve',send)).rejects.toThrow(/session/)
 expect(send).not.toHaveBeenCalled();expect(pendingQuizResults('eleve')).toHaveLength(1)
})
test('une tentative plus récente survit à la réponse de la précédente',async()=>{
 queueQuizResult('eleve',result)
 let finish;const send=vi.fn(()=>new Promise(resolve=>finish=resolve))
 const pending=flushQuizResults('eleve',send)
 expect(flushQuizResults('eleve',send)).toBe(pending)
 queueQuizResult('eleve',{...result,score:3});finish();await pending
 expect(pendingQuizResults('eleve')[0].score).toBe(3)
})
test('un changement de compte pendant la réponse ne détruit pas le résultat',async()=>{
 queueQuizResult('eleve',result)
 await expect(flushQuizResults('eleve',async()=>{globalThis.testSession={user:{id:'prof'}}})).rejects.toThrow(/session/)
 expect(pendingQuizResults('eleve')).toHaveLength(1)
})
test('un serveur muet est interrompu sans nouvelle soumission automatique',async()=>{
 vi.useFakeTimers();let signal;const request=vi.fn(s=>{signal=s;return new Promise(()=>{})})
 const promise=withNetworkTimeout(request,100);const assertion=expect(promise).rejects.toThrow(/répond pas/)
 await vi.advanceTimersByTimeAsync(100);await assertion
 expect(signal.aborted).toBe(true);expect(request).toHaveBeenCalledTimes(1)
})
test('la reprise garde les mêmes valeurs et reste séparée par compte',()=>{
 const session=buildFormulaSession(FORMULA_PRACTICE.slice(0,1),2)
 saveWorkshop('eleve',{selected:[session[0].formula.id],repeat:2,session,index:1,answer:'12,5',results:[{formulaId:session[0].formula.id,correct:false}]})
 const saved=readWorkshop('eleve');expect(saved.session).toEqual(session);expect(saved.answer).toBe('12,5');expect(saved.index).toBe(1)
 expect(readWorkshop('prof')).toBeNull()
 localStorage.setItem('stmg_formula_session_v1:eleve','{invalid');expect(readWorkshop('eleve')).toBeNull()
})
