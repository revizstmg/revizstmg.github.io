import {beforeEach,afterEach,it,expect,vi} from 'vitest'
let api
const session={token:'eleve-token',refresh:'refresh-test',user:{id:'eleve'},expires_at:9999999999}
beforeEach(async()=>{
 vi.resetModules();vi.useFakeTimers();const map=new Map()
 vi.stubGlobal('localStorage',{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)})
 localStorage.setItem('stmg_session',JSON.stringify(session));api=await import('../src/auth.js')
})
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
for(const phase of ['headers','body'])it(`profil ${phase} silencieux : délai complet puis reprise`,async()=>{
 let signal
 vi.stubGlobal('fetch',vi.fn((_,opts)=>{signal=opts.signal;return phase==='headers'?new Promise(()=>{}):Promise.resolve({ok:true,json:()=>new Promise(()=>{})})}))
 const pending=api.fetchProfile();const failed=expect(pending).rejects.toThrow('Le serveur ne répond pas')
 await vi.advanceTimersByTimeAsync(15001);await failed;expect(signal.aborted).toBe(true)
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify([{id:'eleve',progress:{xp:20}}]))))
 expect((await api.fetchProfile()).progress.xp).toBe(20);expect(api.getSession()).toEqual(session)
})
it('sauvegarde HTTP200 au corps bloqué : échec borné, reprise et aucune lecture de conflit tardive',async()=>{
 let body,signal
 const fetch=vi.fn((_,opts)=>{signal=opts.signal;return Promise.resolve({ok:true,json:()=>new Promise(r=>{body=r})})});vi.stubGlobal('fetch',fetch)
 const pending=api.envoyerProgression({_sync:{rev:1}},null)
 await vi.advanceTimersByTimeAsync(15001);expect(await pending).toEqual({ok:false,raison:'reseau'});expect(signal.aborted).toBe(true)
 body([]);await Promise.resolve();expect(fetch).toHaveBeenCalledTimes(1)
 fetch.mockResolvedValue(new Response(JSON.stringify([{id:'eleve'}])))
 expect(await api.envoyerProgression({_sync:{rev:2}},null)).toEqual({ok:true})
})
it('réponse de sauvegarde tardive après changement de compte : aucun succès ni conflit du nouvel utilisateur',async()=>{
 let finish;vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:()=>new Promise(r=>{finish=r})})))
 const pending=api.envoyerProgression({_sync:{rev:1}},null);await vi.advanceTimersByTimeAsync(1)
 localStorage.setItem('stmg_session',JSON.stringify({...session,user:{id:'autre'}}));finish([{id:'eleve'}])
 expect(await pending).toEqual({ok:false,raison:'session'})
})
it('renouvellement silencieux : session conservée, verrou libéré et réponse tardive ignorée',async()=>{
 let finish;const fetch=vi.fn(async()=>({ok:true,json:()=>new Promise(r=>{finish=r})}));vi.stubGlobal('fetch',fetch)
 const pending=api.refreshSession();await vi.advanceTimersByTimeAsync(15001);expect(await pending).toBeNull();expect(api.getSession()).toEqual(session)
 fetch.mockResolvedValue(new Response(JSON.stringify({access_token:'nouveau',refresh_token:'nouveau-refresh',user:session.user})))
 expect((await api.refreshSession()).token).toBe('nouveau')
 finish({access_token:'retard',user:session.user});await Promise.resolve();expect(api.getSession().token).toBe('nouveau')
})
