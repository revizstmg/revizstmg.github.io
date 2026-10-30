import {EXCELLENCE_SUBJECTS,checkExcellenceResult} from '../../../supabase/functions/examen-blanc/excellence.js'
import {reserverIA} from './ia.js'
import {getValidToken,getSession} from '../auth.js'
import {SUPA_URL,SUPA_ANON} from '../supabase.js'
export {EXCELLENCE_SUBJECTS,EXCELLENCE_RUBRIC} from '../../../supabase/functions/examen-blanc/excellence.js'
export const excellenceKey=owner=>`revizstmg_excellence_v1_${owner}`
export function readExcellence(owner,storage=localStorage){
 if(!owner)return {}
 try{
  const all=JSON.parse(storage.getItem(excellenceKey(owner))||'{}'),checked={}
  if(!all||typeof all!=='object'||Array.isArray(all))return {}
  for(const s of EXCELLENCE_SUBJECTS){const d=all[s.id];if(!d||typeof d.answer!=='string'||d.answer.length>60000)continue
   checked[s.id]={answer:d.answer,startedAt:Number.isFinite(d.startedAt)&&d.startedAt>0?d.startedAt:null,submitted:!!d.submitted,submittedAt:Number.isFinite(d.submittedAt)&&d.submittedAt>0?d.submittedAt:null}
   if(d.result)try{checked[s.id].result=checkExcellenceResult(d.result,d.answer)}catch{/* Une ancienne correction illisible n'efface pas la copie. */}
  }return checked
 }catch{return {}}
}
export async function correctExcellence(subjectId,answer,owner,signal){
 const token=await getValidToken();signal.throwIfAborted()
 if(!token||getSession()?.user?.id!==owner)throw Error('login_required')
 const valider=reserverIA('excellence');const r=await fetch(`${SUPA_URL}/functions/v1/examen-blanc`,{method:'POST',headers:{apikey:SUPA_ANON,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'excellence',subjectId,answer}),signal})
 const data=await r.json().catch(()=>({}));signal.throwIfAborted()
 if(!r.ok)throw Error(data.error||(r.status===401?'login_required':'server_error'))
 valider()
 if(getSession()?.user?.id!==owner)throw Error('login_required')
 return checkExcellenceResult(data.excellence,answer)
}
