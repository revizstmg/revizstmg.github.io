// Brouillon limité à l’onglet et séparé par compte. Jamais de photo/PDF ni de clé.
const key=owner=>`revizstmg_note_draft_v1_${owner||'guest'}`
export function readNoteDraft(owner,storage){
 try{
  const s=storage||sessionStorage,raw=s.getItem(key(owner))
  if(!raw||raw.length>120000)return null
  const d=JSON.parse(raw)
  if(d.owner!==(owner||'guest')||typeof d.matiere!=='string'||typeof d.chapitre!=='string'||typeof d.questionsManquees!=='string'||d.questionsManquees.length>6000||typeof d.saisie!=='string'||d.saisie.length>5||!/^\d{4}-\d{2}-\d{2}$/.test(d.date))return null
  if(d.revision){
   const r=d.revision
   if(!['ready','unreadable','out_of_scope'].includes(r.status)||typeof r.summary!=='string'||r.summary.length>3000||!Array.isArray(r.weaknesses)||r.weaknesses.length>8||!Array.isArray(r.exercises)||r.exercises.length>8)return null
   if(r.weaknesses.some(w=>!w||['chapterId','skill','evidence','advice'].some(k=>typeof w[k]!=='string'||w[k].length>1200))||r.exercises.some(e=>!e||['chapterId','skill','question','correction'].some(k=>typeof e[k]!=='string'||e[k].length>5000)))return null
  }
  return d
 }catch{return null}
}
export function writeNoteDraft(owner,draft,storage){
 try{(storage||sessionStorage).setItem(key(owner),JSON.stringify({...draft,owner:owner||'guest'}));return true}catch{return false}
}
export function clearNoteDraft(owner,storage){try{(storage||sessionStorage).removeItem(key(owner))}catch{/* stockage indisponible */}}
