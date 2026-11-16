import {publication,utilisation} from '/workspace/work/audit3-20261115-repo/app/scripts/stats-sources.mjs'
import {construireRapport} from '/workspace/work/audit3-20261115-repo/app/scripts/rapport.js'
import fs from 'node:fs'
const out={};let requests=[];let signal
const originalTimeout=AbortSignal.timeout
AbortSignal.timeout=()=>originalTimeout(20)
globalThis.fetch=async(url,opts)=>{requests.push(String(url));signal=opts?.signal;return {ok:true,json:()=>new Promise(()=>{})}}
let settled=false;publication(new Date('2026-11-15T12:00:00Z')).finally(()=>settled=true)
await new Promise(r=>setTimeout(r,100));out.githubBody={requests:requests.length,signalAborted:signal?.aborted,settledAfter100ms:settled,note:'Échéance accélérée à20ms ; corps json ne répond pas.'}
requests=[];signal=null;globalThis.fetch=(url,opts)=>{requests.push(String(url));signal=opts?.signal;return new Promise(()=>{})}
let uSettled=false;utilisation().finally(()=>uSettled=true);await new Promise(r=>setTimeout(r,100));out.supabaseHeaders={requests:requests.length,hasAbortSignal:!!signal,settledAfter100ms:uSettled,note:'Requête bloquée simulée ; aucune base contactée.'}
AbortSignal.timeout=originalTimeout
globalThis.fetch=async(url)=>{
const path=new URL(url).pathname;let data
if(path.endsWith('/runs'))data={workflow_runs:[{conclusion:'success',updated_at:'2026-11-15T09:00:00Z'}]}
else if(path.endsWith('/deployments'))data=[{id:2},{id:1}]
else if(path.includes('/deployments/2/'))data=[{state:'failure',created_at:'2026-11-15T11:00:00Z'}]
else if(path.includes('/deployments/1/'))data=[{state:'success',created_at:'2026-11-15T09:00:00Z'}]
else data=[]
return {ok:true,json:async()=>data}
}
const p=await publication(new Date('2026-11-15T12:00:00Z'))
const verif={construction:{ok:true},tests:{ok:true},parcours:{ok:true},miseEnLigne:{etat:'failure',date:'2026-11-15T11:00:00Z'},problemes:[]}
const merged={...p,miseEnLigne:p.miseEnLigne?.etat&&p.miseEnLigne.etat!=='unknown'?p.miseEnLigne:verif.miseEnLigne}
const rapport=construireRapport({jour:'2026-11-15',verif,publication:merged})
out.newDeploymentFailed={givenLatestState:'failure',givenLatestAt:'2026-11-15T11:00:00Z',reported:p.miseEnLigne,subject:rapport.sujet,allClear:rapport.sujet.includes('Rien à signaler')}
fs.writeFileSync('/workspace/output/audit3-20261115/repo/stats-probes.json',JSON.stringify(out,null,2));console.log(out)
