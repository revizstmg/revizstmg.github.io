import {practiceUnits,checkPracticeResult} from '../../../supabase/functions/examen-blanc/practice.js'
import {reserverIA} from './ia.js'
import {SUPA_URL,SUPA_ANON} from '../supabase.js'
import {getValidToken,getSession} from '../auth.js'
export {practiceUnits}
export function practiceKey(course,owner){let h=2166136261;for(const c of course.text)h=Math.imul(h^c.charCodeAt(0),16777619);return `revizstmg_practice_v1:${owner||'trial'}:${course.id}:${h>>>0}`}
export function readPractice(course,owner,storage=localStorage){
 try{const d=JSON.parse(storage.getItem(practiceKey(course,owner))||'null');if(!d||!Array.isArray(d.previous)||d.previous.some(s=>typeof s!=='string')||d.previous.length>60)return {counts:{},previous:[]};return {counts:d.counts&&typeof d.counts==='object'?d.counts:{},previous:d.previous,bank:d.bank?checkPracticeResult(d.bank,{course,targets:d.targets,previous:[]}):null,targets:d.targets}}
 catch{return {counts:{},previous:[]}}
}
export function practiceTargets(course,history={}){
 return practiceUnits(course).sort((a,b)=>(Number(history.counts?.[a.id])||0)-(Number(history.counts?.[b.id])||0)).slice(0,6).map(u=>u.id)
}
export async function requestPractice(course,history,owner,signal){
 const token=await getValidToken();signal.throwIfAborted()
 if(!owner||!token||getSession()?.user?.id!==owner)throw Error('login_required')
 const body={action:'practice',course,targets:practiceTargets(course,history),previous:(history.previous||[]).slice(-60)}
 const valider=reserverIA('serie');const r=await fetch(`${SUPA_URL}/functions/v1/examen-blanc`,{method:'POST',headers:{apikey:SUPA_ANON,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal})
 const data=await r.json().catch(()=>({}));signal.throwIfAborted()
 if(!r.ok)throw Error(data.error||(r.status===401?'login_required':'server_error'))
 valider()
 if(getSession()?.user?.id!==owner)throw Error('login_required')
 const bank=checkPracticeResult(data.practice,body),counts={...history.counts}
 for(const id of body.targets)counts[id]=(Number(counts[id])||0)+1
 return {counts,previous:[...body.previous,...bank.questions.map(q=>q.q)].slice(-60),targets:body.targets,bank}
}
