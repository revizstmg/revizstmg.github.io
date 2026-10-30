import { withControlDeadline, CONTROL_WAIT_MS } from '../controlRequest.js'
import {reserverIA,messageAccesIA} from '../data/ia.js'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { usePublicText } from '../i18n.js'
import { getSession, getValidToken } from '../auth.js'
import { SUPA_URL, SUPA_ANON } from '../supabase.js'
import { checkControlResult } from '../../../supabase/functions/examen-blanc/control.js'

export default function ChapterControl({course}) {
 const {state}=useStore(), tr=usePublicText(), owner=state.account?.id
 const [exercise,setExercise]=useState(null),[answer,setAnswer]=useState(''),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[preparation,setPreparation]=useState('')
 const lock=useRef(false), mounted=useRef(true), controller=useRef(null), previous=useRef([]), answerField=useRef(null), resultHeading=useRef(null)
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort()}},[])
 useEffect(()=>{if(result)resultHeading.current?.focus()},[result])
 const send=async step=>{
  if(lock.current)return
  if(step==='correct'&&!answer.trim())return
  lock.current=true;setBusy(true);setError('')
  const ac=new AbortController();controller.current=ac
  try {
   const checked=await withControlDeadline(async signal=>{
   const token=await getValidToken()
   signal.throwIfAborted()
   if(!owner||!token||getSession()?.user?.id!==owner)throw Error('login_required')
   const body={action:'control',step,course,...(step==='prepare'?{previous:previous.current}:{exercise,answer:answer.trim()})}
   const valider=reserverIA('controle',{suite:step!=='prepare'});const response=await fetch(`${SUPA_URL}/functions/v1/examen-blanc`,{method:'POST',headers:{apikey:SUPA_ANON,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:ac.signal})
   const data=await response.json().catch(()=>({}))
   if(!response.ok)throw Error(data.error||(response.status===401?'login_required':'server_error'))
   valider()
   signal.throwIfAborted()
   return {control:checkControlResult(data.control,body),preparation:data.preparation==='course'?'course':''}
   },ac,step==='correct'?CONTROL_WAIT_MS:150000)
   if(!mounted.current||ac.signal.aborted||getSession()?.user?.id!==owner)return
   if(step==='prepare'){
    setExercise(checked.control);setPreparation(checked.preparation);setAnswer('');setResult(null);previous.current=[...previous.current,checked.control.question].slice(-5)
    requestAnimationFrame(()=>answerField.current?.focus())
   }else setResult(checked.control)
  }catch(e){if(mounted.current)setError(messageAccesIA(e.message)?messageAccesIA(e.message):e.message==='timeout'?'L’IA met trop de temps à répondre. Ta réponse est conservée ; tu peux réessayer.':e.message==='cancelled'?'Attente annulée. Ta réponse est conservée.':e.message==='login_required'?'Connecte-toi pour créer une question et faire corriger ta réponse.':e.message==='rate_limit'?'Beaucoup de demandes ont été envoyées. Patiente puis réessaie.':['provider_unavailable','provider_unreachable'].includes(e.message)?'Le service de correction est temporairement indisponible. Ta réponse est conservée ; réessaie dans quelques instants.':e.message==='invalid_response'?'La réponse du service est incomplète. Ta réponse est conservée ; réessaie.':['provider_permission','provider_key_invalid','provider_key_restricted','provider_billing_required','not_configured','provider_model_unavailable','provider_configuration','provider_service_disabled'].includes(e.message)?'Le service de correction doit être rétabli par l’équipe du site. Ta réponse est conservée.':e.message==='out_of_scope'?'Ce cours ne permet pas de préparer cette question. Reviens au cours ou essaie une autre question.':'La préparation ou la correction a échoué. Ta réponse est conservée ; réessaie.')}
  finally{lock.current=false;if(mounted.current)setBusy(false)}
 }
 return <section className="card no-print p-4 sm:p-6" data-chapter-control>
  <p className="kicker">À toi de rédiger</p>
  <h2 className="mt-2 font-display text-2xl">Questions type de contrôle</h2>
  <p className="mt-3 text-sm">Entraîne-toi à expliquer et à argumenter avec les notions de ce chapitre. Une question à la fois, cinq critères d’un point et une correction détaillée.</p>
  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Le cours et ta réponse sont transmis à l’IA. La note sur 5 est indicative et peut comporter des erreurs. Cette séance n’est pas sauvegardée ; copie ta réponse avant de quitter la page.</p>
  {!exercise&&<button type="button" className="btn-primary mt-4" disabled={busy} onClick={()=>send('prepare')}>Créer une question</button>}
  {preparation==='course'&&<p role="status" className="mt-3 text-sm">Le service qui crée les questions est indisponible pour le moment. Cette question de synthèse est construite directement à partir de ton cours, sans génération par l’IA. Tu pourras demander la correction après ta rédaction.</p>}
  {exercise&&<div className="mt-5 space-y-4">
   <div lang="fr" translate="no"><h3 className="font-semibold">{exercise.question}</h3><p className="mt-2 text-sm">5 points</p></div>
   <label className="block text-sm font-semibold">Ta réponse rédigée<textarea ref={answerField} rows={7} maxLength={8000} disabled={busy} value={answer} onChange={e=>{setAnswer(e.target.value);setResult(null)}} className="mt-2 w-full rounded-xl border border-slate-400 bg-transparent p-3 font-normal" /></label>
   <button type="button" className="btn-primary" disabled={busy||!answer.trim()} onClick={()=>send('correct')}>Corriger ma réponse</button>
   {result&&<section className="space-y-4 rounded-2xl border border-slate-400 p-4" lang="fr" translate="no">
    <h3 ref={resultHeading} tabIndex={-1} className="font-display text-2xl focus-visible:outline">{tr('Note indicative')} · {result.points}/5</h3>
    <p className="whitespace-pre-wrap text-sm">{result.feedback}</p>
    <ol className="space-y-3">{result.criteria.map(c=><li key={c.index} className="border-t border-slate-400 pt-3"><p className="font-semibold">{exercise.criteria[c.index].notion} · {c.points}/1</p><p className="mt-1 text-sm">{exercise.criteria[c.index].expected}</p><p className="mt-1 text-sm">{c.feedback}</p><details className="mt-2 text-sm"><summary className="cursor-pointer">{tr('Retrouver cette notion dans le cours')}</summary><blockquote className="mt-2 border-l-2 border-slate-400 pl-3">{exercise.criteria[c.index].source}</blockquote></details></li>)}</ol>
    <details className="text-sm"><summary className="cursor-pointer font-semibold">{tr('Voir la réponse attendue')}</summary><p className="mt-2 whitespace-pre-wrap">{exercise.correction}</p></details>
   </section>}
   <button type="button" className="btn-ghost" disabled={busy} onClick={()=>{if(!answer.trim()||result||window.confirm(tr('Remplacer cette question et effacer ta réponse ?')))send('prepare')}}>Une autre question</button>
  </div>}
  {busy&&<div className="mt-3 space-y-2"><p role="status" className="text-sm">L’IA travaille sur cette question…</p><button type="button" className="btn-ghost" onClick={()=>controller.current?.abort(Error('cancelled'))}>Annuler l’attente</button></div>}
  {error&&<p role="alert" className="mt-3 text-sm">{tr(error)}</p>}
 </section>
}
