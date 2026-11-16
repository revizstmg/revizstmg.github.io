import {beforeEach,afterEach,test,expect,vi} from 'vitest'
const identity=vi.hoisted(()=>({id:'A'}))
vi.mock('../src/auth.js',()=>({getSession:()=>identity.id?{user:{id:identity.id}}:null,isSignedIn:()=>!!identity.id}))
vi.mock('../src/reseau.js',()=>({rpc:vi.fn()}))
import {rpc} from '../src/reseau.js'
import {desactiverRappelsPush} from '../src/push.js'
let sub,manager
beforeEach(()=>{
 vi.useFakeTimers();identity.id='A';rpc.mockReset();rpc.mockResolvedValue(null)
 sub={endpoint:'https://push.test/synthetic',unsubscribe:vi.fn(async()=>true)}
 manager={getSubscription:vi.fn(async()=>sub)}
 vi.stubGlobal('window',{PushManager:function(){}});vi.stubGlobal('Notification',{permission:'granted'})
 vi.stubGlobal('navigator',{serviceWorker:{ready:Promise.resolve({pushManager:manager})}})
})
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
for(const phase of ['ready','getSubscription','rpc','unsubscribe'])test(`arrêt push : ${phase} silencieux ne bloque pas l’appelant`,async()=>{
 if(phase==='ready')navigator.serviceWorker.ready=new Promise(()=>{})
 if(phase==='getSubscription')manager.getSubscription.mockImplementation(()=>new Promise(()=>{}))
 if(phase==='rpc')rpc.mockImplementation(()=>new Promise(()=>{}))
 if(phase==='unsubscribe')sub.unsubscribe.mockImplementation(()=>new Promise(()=>{}))
 const pending=desactiverRappelsPush();await vi.advanceTimersByTimeAsync(6001)
 expect(await pending).toBe(false)
})
test('arrêt normal : suppression du bon endpoint et désabonnement local confirmés',async()=>{
 expect(await desactiverRappelsPush()).toBe(true)
 expect(rpc).toHaveBeenCalledTimes(1);expect(rpc).toHaveBeenCalledWith('revizstmg_push_desabonner',{p_endpoint:sub.endpoint});expect(sub.unsubscribe).toHaveBeenCalledTimes(1)
})
test('réponse getSubscription après expiration : aucune action tardive',async()=>{
 let finish;manager.getSubscription.mockImplementation(()=>new Promise(r=>{finish=r}))
 const pending=desactiverRappelsPush();await vi.advanceTimersByTimeAsync(6001);expect(await pending).toBe(false)
 finish(sub);await vi.advanceTimersByTimeAsync(1);expect(rpc).not.toHaveBeenCalled();expect(sub.unsubscribe).not.toHaveBeenCalled()
})
test('changement de compte pendant la recherche : aucune désinscription du nouveau compte',async()=>{
 let finish;manager.getSubscription.mockImplementation(()=>new Promise(r=>{finish=r}))
 const pending=desactiverRappelsPush();await vi.advanceTimersByTimeAsync(1);identity.id='B';finish(sub)
 expect(await pending).toBe(false);expect(rpc).not.toHaveBeenCalled();expect(sub.unsubscribe).not.toHaveBeenCalled()
})
test('un refus natif ne devient pas une confirmation de désinscription',async()=>{
 sub.unsubscribe.mockResolvedValue(false);expect(await desactiverRappelsPush()).toBe(false)
})
