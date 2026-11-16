import {test,expect,vi,afterEach} from 'vitest'
import {utilisation,publication} from '../scripts/stats-sources.mjs'
import {choisirEtatPublication} from '../scripts/etat-publication.mjs'
import {construireRapport} from '../scripts/rapport.js'
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
for(const phase of ['headers','body'])test(`statistiques Supabase ${phase} silencieux : délai, signal et reprise`,async()=>{
 vi.useFakeTimers();let signal
 vi.stubGlobal('fetch',vi.fn((_,o)=>{signal=o.signal;return phase==='headers'?new Promise(()=>{}):Promise.resolve({ok:true,json:()=>new Promise(()=>{})})}))
 const pending=utilisation();await vi.advanceTimersByTimeAsync(15001)
 expect((await pending).erreur).toContain('ne répond pas');expect(signal.aborted).toBe(true)
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({comptes:4}))))
 expect(await utilisation()).toEqual({comptes:4})
})
for(const latest of ['failure','success','cancelled','unknown'])test(`publication ${latest} : dernière tentative distincte du dernier succès`,async()=>{
 vi.stubGlobal('fetch',vi.fn(async url=>{
  const p=new URL(url).pathname
  let data=[]
  if(p.endsWith('/runs'))data={workflow_runs:[{conclusion:'success',updated_at:'2026-11-16T11:00:00Z'}]}
  else if(p.endsWith('/deployments'))data=[{id:2},{id:1}]
  else if(p.includes('/2/statuses'))data=latest==='unknown'?[]:[{state:latest==='cancelled'?'error':latest,description:latest==='cancelled'?'Deployment was cancelled':'',created_at:'2026-11-16T11:00:00Z'}]
  else if(p.includes('/1/statuses'))data=[{state:'success',created_at:'2026-11-16T09:00:00Z'}]
  return new Response(JSON.stringify(data))
 }))
 const p=await publication()
 expect(p.miseEnLigne.etat).toBe(latest==='cancelled'?'success':latest)
 expect(p.dernierePublication.etat).toBe('success')
 if(latest==='failure'){
  expect(p.dernierePublication.date).toBe('2026-11-16T09:00:00Z')
  const r=construireRapport({jour:'2026-11-16',publication:p,verif:{construction:{ok:true},tests:{ok:true},parcours:{ok:true}}})
  expect(r.sujet).toContain('en échec');expect(r.sujet).not.toContain('Rien à signaler')
 }
})
test('le contrôle récent échoué gagne, un succès ultérieur prouvé résout un ancien incident',()=>{
 const old={etat:'success',date:'2026-11-16T09:00:00Z'},bad={etat:'failure',date:'2026-11-16T11:00:00Z'}
 expect(choisirEtatPublication(old,bad)).toBe(bad)
 expect(choisirEtatPublication({...old,date:'2026-11-16T12:00:00Z'},bad).etat).toBe('success')
 expect(choisirEtatPublication(old,{etat:'error'}).etat).toBe('error')
 expect(choisirEtatPublication({etat:'unknown'},bad)).toBe(bad)
})
