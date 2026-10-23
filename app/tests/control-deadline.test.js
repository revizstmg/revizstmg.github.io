import { test,expect,vi,afterEach } from 'vitest'
import { withControlDeadline } from '../src/controlRequest.js'
afterEach(()=>vi.useRealTimers())
test('une connexion bloquée se termine même si elle ignore AbortSignal',async()=>{
 vi.useFakeTimers();const ac=new AbortController()
 const pending=withControlDeadline(()=>new Promise(()=>{}),ac,100)
 const rejected=expect(pending).rejects.toThrow('timeout')
 await vi.advanceTimersByTimeAsync(101);await rejected
 expect(ac.signal.aborted).toBe(true);expect(vi.getTimerCount()).toBe(0)
})
test('annuler débloque immédiatement une lecture JSON bloquée',async()=>{
 const ac=new AbortController()
 const pending=withControlDeadline(async()=>{await Promise.resolve();return new Promise(()=>{})},ac)
 const rejected=expect(pending).rejects.toThrow('cancelled')
 ac.abort(Error('cancelled'));await rejected
})
test('une réponse valide est rendue sans attendre et ne sera pas annulée ensuite',async()=>{
 vi.useFakeTimers();const ac=new AbortController()
 expect(await withControlDeadline(async()=>({points:4}),ac,100)).toEqual({points:4})
 await vi.advanceTimersByTimeAsync(101);expect(ac.signal.aborted).toBe(false);expect(vi.getTimerCount()).toBe(0)
})
