import {afterEach,beforeEach,expect,it,vi} from 'vitest'
vi.mock('../src/auth.js',()=>({getSession:()=>globalThis.__paymentSession,getValidToken:async()=> 'test-token'}))
import {lireEtatPaiement,demarrerPaiement} from '../src/data/abonnement.js'
beforeEach(()=>{globalThis.__paymentSession={user:{id:'A'}}})
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
it('rejette une réponse Checkout de l’ancien compte',async()=>{
 let resolve
 vi.stubGlobal('fetch',vi.fn(()=>new Promise(r=>{resolve=r})))
 const pending=demarrerPaiement('premium','mensuel',true)
 await vi.waitFor(()=>expect(fetch).toHaveBeenCalled())
 __paymentSession={user:{id:'B'}}
 resolve({ok:true,json:async()=>({url:'https://checkout.stripe.test/A'})})
 await expect(pending).rejects.toThrow('login_required')
})
it('borne une réponse bloquée et annule la requête',async()=>{
 vi.useFakeTimers();let signal
 vi.stubGlobal('fetch',vi.fn((u,o)=>{signal=o.signal;return new Promise(()=>{})}))
 const pending=lireEtatPaiement();const assertion=expect(pending).rejects.toThrow('network')
 await vi.advanceTimersByTimeAsync(15001);await assertion
 expect(signal.aborted).toBe(true)
})
it('borne aussi une lecture JSON bloquée',async()=>{
 vi.useFakeTimers()
 vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:()=>new Promise(()=>{})})))
 const pending=lireEtatPaiement();const assertion=expect(pending).rejects.toThrow('network')
 await vi.advanceTimersByTimeAsync(15001);await assertion
})
