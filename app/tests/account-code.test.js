import {beforeEach,expect,it,vi} from 'vitest'
vi.mock('../src/leaderboard.js',()=>({deviceId:()=>globalThis.__codeOwner,isoWeekKey:()=> '2026-W44'}))
vi.mock('../src/reseau.js',()=>({send:vi.fn(),rpc:vi.fn(),getJSON:vi.fn(),enc:encodeURIComponent,rest:x=>x}))
import {parentCode,publishChildStats} from '../src/parent.js'
import {friendCode,upsertMe} from '../src/friends.js'
import {send} from '../src/reseau.js'
let n=0
beforeEach(()=>{
 const data=new Map()
 vi.stubGlobal('localStorage',{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)})
 globalThis.__codeOwner=`code-test-${++n}-A`
 send.mockReset()
})
it('isole les codes des comptes et ne réattribue pas les anciennes clés globales',()=>{
 localStorage.setItem('stmg_parent_code','POLDGLOBAL');localStorage.setItem('stmg_friend_code','OLD123')
 const a=__codeOwner,pa=parentCode(),fa=friendCode()
 __codeOwner=a+'B'
 expect(parentCode()).not.toBe(pa);expect(friendCode()).not.toBe(fa)
 expect(parentCode()).not.toBe('POLDGLOBAL');expect(friendCode()).not.toBe('OLD123')
 __codeOwner=a
 expect(parentCode()).toBe(pa);expect(friendCode()).toBe(fa)
})
for(const [name,code,publish] of [['parent',parentCode,()=>publishChildStats({name:'Audit'})],['ami',friendCode,()=>upsertMe({name:'Audit'})]]){
 it(`${name} : une réponse tardive ne remplace pas le code du compte suivant`,async()=>{
  const a=__codeOwner;let resolve
  send.mockReturnValue(new Promise(r=>{resolve=r}))
  const pending=publish()
  __codeOwner=a+'B';const b=code()
  resolve({json:async()=>[{code:'ANCIEN'}]});await pending
  expect(code()).toBe(b)
 })
 it(`${name} : retrouve le code serveur du compte courant`,async()=>{
  send.mockResolvedValue({json:async()=>[{code:'SERVEUR'}]})
  await publish();expect(code()).toBe('SERVEUR')
 })
}
