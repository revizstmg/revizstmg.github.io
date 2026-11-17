import {beforeEach,afterEach,test,expect,vi} from 'vitest'
const identity=vi.hoisted(()=>({id:'A'}))
vi.mock('../src/auth.js',()=>({getSession:()=>({user:{id:identity.id}}),isSignedIn:()=>!!identity.id}))
vi.mock('../src/reseau.js',()=>({rpc:vi.fn()}))
import {rpc} from '../src/reseau.js'
import {activerRappelsPush,desactiverRappelsPush} from '../src/push.js'
let sub,manager
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}}
const flush=()=>vi.advanceTimersByTimeAsync(1)
beforeEach(()=>{
 vi.useFakeTimers();identity.id='A';rpc.mockReset();rpc.mockImplementation(async name=>name==='revizstmg_push_cle'?'AQID':null)
 sub={endpoint:'https://push.test/synthetic',toJSON:()=>({endpoint:'https://push.test/synthetic',keys:{p256dh:'fake',auth:'fake'}}),unsubscribe:vi.fn(async()=>true)}
 manager={getSubscription:vi.fn(async()=>null),subscribe:vi.fn(async()=>sub)}
 vi.stubGlobal('window',{PushManager:function(){}});vi.stubGlobal('Notification',{permission:'granted'});vi.stubGlobal('navigator',{serviceWorker:{ready:Promise.resolve({pushManager:manager})}})
})
afterEach(async()=>{await vi.advanceTimersByTimeAsync(40001);vi.useRealTimers();vi.unstubAllGlobals()})
const inscriptions=()=>rpc.mock.calls.filter(([n])=>n==='revizstmg_push_abonner')
test('activation normale : seul le bon horaire est confirmé',async()=>{
 expect(await activerRappelsPush('20:30')).toBe(true);expect(inscriptions()).toHaveLength(1);expect(inscriptions()[0][1].p_minute).toBe(1230)
})
test('arrêt pendant subscribe : pas de réinscription, souscription tardive retirée',async()=>{
 const wait=deferred();manager.subscribe.mockReturnValue(wait.promise)
 const on=activerRappelsPush('18:00');await flush();expect(manager.subscribe).toHaveBeenCalledTimes(1)
 expect(await desactiverRappelsPush()).toBe(true);wait.resolve(sub)
 expect(await on).toBe(false);expect(inscriptions()).toHaveLength(0);expect(sub.unsubscribe).toHaveBeenCalledTimes(1)
})
test('compte changé pendant subscribe : aucun enregistrement sous le suivant',async()=>{
 const wait=deferred();manager.subscribe.mockReturnValue(wait.promise)
 const on=activerRappelsPush('18:00');await flush();identity.id='B';wait.resolve(sub)
 expect(await on).toBe(false);expect(inscriptions()).toHaveLength(0);expect(sub.unsubscribe).toHaveBeenCalledTimes(1)
})
test('nouvel horaire avant ancienne souscription : seule la dernière demande est écrite',async()=>{
 const wait=deferred();manager.subscribe.mockReturnValueOnce(wait.promise).mockResolvedValueOnce(sub)
 const old=activerRappelsPush('18:00');await flush();expect(await activerRappelsPush('20:00')).toBe(true)
 wait.resolve(sub);expect(await old).toBe(false);expect(inscriptions().map(([,a])=>a.p_minute)).toEqual([1200]);expect(sub.unsubscribe).not.toHaveBeenCalled()
})
test('arrêt puis nouvelle activation : la réponse ancienne ne détruit pas la nouvelle',async()=>{
 const wait=deferred();manager.subscribe.mockReturnValueOnce(wait.promise).mockResolvedValueOnce(sub)
 const old=activerRappelsPush('18:00');await flush();await desactiverRappelsPush();expect(await activerRappelsPush('21:00')).toBe(true)
 wait.resolve(sub);expect(await old).toBe(false);expect(inscriptions().map(([,a])=>a.p_minute)).toEqual([1260]);expect(sub.unsubscribe).not.toHaveBeenCalled()
})
test('écritures déjà parties : le dernier horaire attend la fin de la première',async()=>{
 const wait=deferred();let first=true
 rpc.mockImplementation(async name=>{if(name==='revizstmg_push_cle')return 'AQID';if(name==='revizstmg_push_abonner'&&first){first=false;return wait.promise}})
 const old=activerRappelsPush('18:00');await flush();const next=activerRappelsPush('20:00');await flush();expect(inscriptions()).toHaveLength(1)
 wait.resolve(null);expect(await old).toBe(false);expect(await next).toBe(true);expect(inscriptions().map(([,a])=>a.p_minute)).toEqual([1080,1200])
})
test('arrêt après inscription partie : la désinscription suit cette inscription',async()=>{
 const wait=deferred();rpc.mockImplementation(async name=>name==='revizstmg_push_cle'?'AQID':name==='revizstmg_push_abonner'?wait.promise:null)
 const on=activerRappelsPush('18:00');await flush();manager.getSubscription.mockResolvedValue(sub)
 const off=desactiverRappelsPush();await flush();expect(rpc.mock.calls.some(([n])=>n==='revizstmg_push_desabonner')).toBe(false)
 wait.resolve(null);expect(await on).toBe(false);expect(await off).toBe(true);expect(rpc.mock.calls.map(([n])=>n)).toEqual(['revizstmg_push_cle','revizstmg_push_abonner','revizstmg_push_desabonner'])
})
for(const phase of ['ready','getSubscription','subscribe'])test(`activation ${phase} silencieuse : résultat borné et aucune inscription tardive`,async()=>{
 const wait=deferred()
 if(phase==='ready')navigator.serviceWorker.ready=wait.promise
 else manager[phase].mockReturnValue(wait.promise)
 const on=activerRappelsPush('18:00');await vi.advanceTimersByTimeAsync(20001);expect(await on).toBe(false)
 wait.resolve(phase==='ready'?{pushManager:manager}:sub);await flush();expect(inscriptions()).toHaveLength(0)
})
test('intention de composant invalidée pendant attente : aucun enregistrement',async()=>{
 let current=true;const wait=deferred();manager.subscribe.mockReturnValue(wait.promise)
 const on=activerRappelsPush('18:00',()=>current);await flush();current=false;wait.resolve(sub)
 expect(await on).toBe(false);expect(inscriptions()).toHaveLength(0)
})
