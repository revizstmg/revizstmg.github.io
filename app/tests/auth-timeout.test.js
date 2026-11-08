import {test,expect,vi,afterEach} from 'vitest'
import {signIn,signUp} from '../src/auth.js'
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
for(const action of [signIn,signUp])test('Auth silencieux : attente bornée et reprise '+action.name,async()=>{
 vi.useFakeTimers();vi.stubGlobal('window',{location:{origin:'https://revizstmg.github.io',pathname:'/'}});let signal
 vi.stubGlobal('fetch',vi.fn((_,init)=>{signal=init.signal;return new Promise(()=>{})}))
 const request=action({email:'test@example.com',password:'Test12345'})
 const expected=expect(request).rejects.toThrow('Le serveur ne répond pas')
 await vi.advanceTimersByTimeAsync(15001);await expected;expect(signal.aborted).toBe(true)
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({msg:'Invalid login credentials'}),{status:400})))
 await expect(action({email:'test@example.com',password:'Test12345'})).rejects.toThrow('E-mail ou mot de passe incorrect.')
})
