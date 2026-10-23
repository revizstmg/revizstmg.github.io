import { usePublicText } from '../i18n.js'
import { useState, useRef, useEffect } from 'react'
import { examCatalog, toCourses } from '../data/examenPersonnalise.js'
import { getSession, getValidToken } from '../auth.js'
import { SUPA_URL, SUPA_ANON } from '../supabase.js'
import { checkFiles, COPY_TYPES, MAX_COPY_BYTES } from '../../../supabase/functions/examen-blanc/grading.js'
import { checkStudyResult } from '../../../supabase/functions/examen-blanc/study.js'
const read = f => new Promise((resolve,reject)=>{const r=new FileReader(); r.onload=()=>resolve({mimeType:f.type,data:String(r.result).split(',')[1]}); r.onerror=reject; r.readAsDataURL(f)})
export function StudyResult({result}) {
 if (!result) return null
 return <div className="space-y-4" lang="fr"><p className="whitespace-pre-wrap text-sm">{result.summary}</p>{result.weaknesses.map((w,i)=><div key={i}><h4 className="font-semibold">{w.skill}</h4><p className="text-sm">{w.evidence}</p><p className="text-sm">{w.advice}</p></div>)}{result.exercises.map((e,i)=><div key={`${e.chapterId}:${e.question}`} className="rounded-xl border border-slate-400 p-3"><h4 className="font-semibold">Exercice {i+1} · {e.skill}</h4><p className="whitespace-pre-wrap text-sm">{e.question}</p><label className="mt-3 block text-sm">Ta réponse<textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-400 bg-transparent p-2" /></label><details className="mt-2 text-sm"><summary className="cursor-pointer">Voir la correction</summary><p className="whitespace-pre-wrap">{e.correction}</p></details></div>)}</div>
}
export default function NoteRevision({subject,chapter,missed,owner,result,onResult,onBusy}) {
 const tr=usePublicText()
 const [subjectFiles,setSubjectFiles]=useState([]),[copyFiles,setCopyFiles]=useState([]),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const controller=useRef(null),lock=useRef(false),mounted=useRef(true)
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort()}},[])
 const choose=(event,set,previous=[])=>{const f=[...previous,...Array.from(event.target.files||[])];event.target.value='';if(f.length>3 || f.some(x=>!COPY_TYPES.includes(x.type))){setError('Maximum 3 fichiers PDF, JPEG, PNG ou WebP par dépôt.');return}set(f);setConsent(false);onResult(null)}
 const send=async()=>{
  if(lock.current)return
  setError(''); const all=[...subjectFiles,...copyFiles]
  if(!subject||!chapter)return setError('Choisis la matière et le chapitre.')
  if(all.length&&(!subjectFiles.length||!copyFiles.length||!consent))return setError('Ajoute le sujet et la copie, puis autorise leur analyse.')
  if(all.reduce((n,f)=>n+f.size,0)>MAX_COPY_BYTES)return setError('6 Mo maximum pour tous les fichiers.')
  if(!missed.trim()&&!all.length)return setError('Indique une question manquée.')
  lock.current=true;setBusy(true);onBusy(true);const ac=new AbortController();controller.current=ac;const timer=setTimeout(()=>ac.abort(),180000)
  try{
   const token=await getValidToken();if(!token||getSession()?.user?.id!==owner)throw Error('login_required')
   const catalog=(await examCatalog()).filter(c=>c.subjectId===subject&&(chapter==='*'||c.themeId===chapter))
   if(catalog.length>24)throw Error('choose_chapter')
   const courses=toCourses(catalog,catalog.map(c=>c.id));const files=all.length?checkFiles(await Promise.all(all.map(read))):[]
   if(ac.signal.aborted)return
   const r=await fetch(`${SUPA_URL}/functions/v1/examen-blanc`,{method:'POST',headers:{apikey:SUPA_ANON,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},signal:ac.signal,body:JSON.stringify({action:'study',missed:missed.trim()||'Comparer les erreurs de la copie au sujet fourni.',courses,files,subjectFiles:subjectFiles.length})})
   const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||'server_error')
   if(!mounted.current||ac.signal.aborted||getSession()?.user?.id!==owner)return
   onResult(checkStudyResult(data.study,courses));setSubjectFiles([]);setCopyFiles([]);setConsent(false)
  }catch(e){if(mounted.current)setError(e.message==='login_required'?'Connecte-toi pour demander une analyse.':e.message==='choose_chapter'?'Choisis un chapitre précis pour cibler tes révisions.':'Analyse interrompue ou indisponible. Tes questions sont conservées ; réessaie.')}
  finally{clearTimeout(timer);lock.current=false;if(mounted.current){setBusy(false);onBusy(false)}}
 }
 return <section className="space-y-3 rounded-2xl border border-slate-400 p-4"><p className="kicker">Ton prochain progrès</p><h3 className="font-display text-xl">Transformer ce devoir en entraînement</h3><p className="text-sm">Bilan, exercices ciblés et analyse du sujet et de ta copie : ces outils sont accessibles aux comptes connectés pendant le développement. Les exercices restent dans le programme, avec des situations et formats adaptés au devoir. Aucune note future n’est garantie.</p><details><summary className="cursor-pointer text-sm font-semibold">Déposer mon sujet et ma copie</summary><div className="mt-3 space-y-3"><p className="text-xs">PDF ou photos JPEG, PNG, WebP. Trois fichiers par dépôt, 6 Mo au total. Vérifie leur lisibilité.</p><label className="block text-sm">Sujet<input type="file" multiple accept={COPY_TYPES.join(',')} disabled={busy} onChange={e=>choose(e,setSubjectFiles)} className="block w-full text-xs" /></label><label className="block text-sm">Ma copie<input type="file" multiple accept={COPY_TYPES.join(',')} disabled={busy} onChange={e=>choose(e,setCopyFiles)} className="block w-full text-xs" /></label><label className="block text-sm">Photographier le sujet<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} onChange={e=>choose(e,setSubjectFiles,subjectFiles)} className="block w-full text-xs" /></label><label className="block text-sm">Photographier ma copie<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} onChange={e=>choose(e,setCopyFiles,copyFiles)} className="block w-full text-xs" /></label>{[...subjectFiles,...copyFiles].map((f,i)=><p key={i} className="break-all text-xs">{i+1}. {f.name}</p>)}{(subjectFiles.length>0||copyFiles.length>0)&&<button type="button" className="text-sm underline" disabled={busy} onClick={()=>{setSubjectFiles([]);setCopyFiles([]);setConsent(false);onResult(null)}}>Retirer les fichiers</button>}<label className="flex gap-2 text-sm"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />J’autorise leur envoi à l’IA pour cette analyse. Les fichiers ne sont pas conservés dans ma progression. Je masque les données personnelles inutiles.</label></div></details><button type="button" disabled={busy} className="btn-primary" onClick={send}>{tr(busy?'Préparation en cours…':'Préparer mon bilan et mes exercices')}</button>{error&&<p role="alert" className="text-sm">{tr(error)}</p>}<StudyResult result={result} /></section>
}
