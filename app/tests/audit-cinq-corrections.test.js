import {beforeEach,afterEach,test,expect,vi} from 'vitest'
import {consumeOAuthRedirect,upsertProfile,updatePassword,getSession} from '../src/auth.js'
import {send} from '../src/reseau.js'
import {createGroup} from '../src/classroom.js'
let session
beforeEach(()=>{
 vi.useFakeTimers();const m=new Map();vi.stubGlobal('localStorage',{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)})
 session={token:'faux',refresh:'faux-refresh',user:{id:'compte-test',email:'test@example.test'},expires_at:9999999999};localStorage.setItem('stmg_session',JSON.stringify(session))
 vi.stubGlobal('window',{location:{hash:'#access_token=oauth-test&refresh_token=refresh-test',pathname:'/',search:''},dispatchEvent:vi.fn()});vi.stubGlobal('history',{replaceState:vi.fn()})
})
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
const silencieux=status=>new Response(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('{'))}}),{status,headers:{'Content-Type':'application/json'}})
test('OAuth : nettoyage immédiat, erreur bornée et nouvelle tentative possible',async()=>{
 vi.stubGlobal('fetch',vi.fn(()=>new Promise(()=>{})));const pending=consumeOAuthRedirect();expect(history.replaceState).toHaveBeenCalledWith(null,'','/')
 await vi.advanceTimersByTimeAsync(15001);expect(await pending).toMatchObject({error:expect.stringContaining('Le serveur ne répond pas')});expect(getSession()).toEqual(session)
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({id:'oauth-user'}))));expect(await consumeOAuthRedirect()).toMatchObject({ok:true,user:{id:'oauth-user'}})
})
test('OAuth : une réponse tardive ne remplace pas le nouveau compte',async()=>{
 let resolve;vi.stubGlobal('fetch',vi.fn(()=>new Promise(r=>{resolve=r})));const p=consumeOAuthRedirect();await vi.advanceTimersByTimeAsync(0)
 localStorage.setItem('stmg_session',JSON.stringify({...session,token:'nouveau',user:{id:'autre'}}));resolve(new Response(JSON.stringify({id:'ancien'})));expect(await p).toHaveProperty('error');expect(getSession().user.id).toBe('autre')
})
test('profil : envoi silencieux borné et nouvelle tentative avec saisie conservée',async()=>{
 vi.stubGlobal('fetch',vi.fn(()=>new Promise(()=>{})));const p=upsertProfile({name:'Nouveau prénom'});const e=expect(p).rejects.toThrow('Le serveur ne répond pas');await vi.advanceTimersByTimeAsync(15001);await e
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('[{"id":"compte-test","name":"Nouveau prénom"}]')));expect(await upsertProfile({name:'Nouveau prénom'})).toMatchObject({name:'Nouveau prénom'})
})
test('mot de passe : le corps HTTP400 silencieux est compris dans le délai',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>silencieux(400)));const p=updatePassword('Motdepasse123');const e=expect(p).rejects.toThrow('Le serveur ne répond pas');await vi.advanceTimersByTimeAsync(15001);await e
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}')));expect(await updatePassword('Motdepasse123')).toBe(true)
})
test.each([200,400])('POST social : en-têtes HTTP%s puis corps silencieux borné',async status=>{
 vi.stubGlobal('fetch',vi.fn(async()=>silencieux(status)));const p=createGroup({classCode:'classe-test',name:'Groupe'});const e=expect(p).rejects.toThrow('Le serveur ne répond pas');await vi.advanceTimersByTimeAsync(15001);await e
})
test('POST social : réponse lisible préservée et DELETE sans corps accepté',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('[{"id":"groupe"}]',{status:201})));expect(await createGroup({classCode:'classe-test',name:'Groupe'})).toMatchObject({id:'groupe'})
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(null,{status:204})));const r=await send('DELETE','class_group?id=eq.groupe');expect(r.status).toBe(204);expect(await r.text()).toBe('')
})
