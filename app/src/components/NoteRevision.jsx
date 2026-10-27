import {Link} from 'react-router-dom'
import {usePublicText} from '../i18n.js'
import {useState,useRef,useEffect,useId} from 'react'
import {COPY_TYPES} from '../../../supabase/functions/examen-blanc/grading.js'
import {requestStudy,checkStudyFiles,studyError,studyCourseLink,STUDY_TIMEOUT} from '../data/studyRequest.js'

export function StudyResult({result}){
 const tr=usePublicText(),uid=useId()
 if(!result)return null
 const ready=result.status==='ready'
 return <div className="space-y-4" lang="fr" data-no-translate aria-label={tr('Mon bilan')}>
  <p className="text-xs">{result.origin==='files'?'Bilan fondé sur le sujet et la copie transmis.':result.origin==='declared'?'Bilan fondé sur les difficultés déclarées : aucune copie n’a été vérifiée.':'Ancien bilan : sa provenance n’a pas été enregistrée. Vérifie ses conclusions avec le cours.'}</p>
  <p role={ready?'status':'alert'} className="whitespace-pre-wrap text-sm">{result.summary}</p>
  {!ready&&<p className="text-sm">{result.status==='unreadable'?'Reprends les photos, bien cadrées et nettes, ou saisis les questions manquées. Aucun résultat n’a été inventé.':'Choisis un autre chapitre ou précise les notions du devoir. Aucun exercice hors programme n’a été ajouté.'}</p>}
  {ready&&<><h4 className="font-display text-xl">Ce que tu vas retravailler</h4>{result.weaknesses.map((w,i)=>{
   const link=studyCourseLink(w.chapterId)
   return <div key={i} className="rounded-lg border border-slate-300 p-3 dark:border-slate-600"><h5 className="font-semibold">{w.skill}</h5><p className="mt-1 text-sm">{w.evidence}</p><p className="mt-1 text-sm">{w.advice}</p>{link&&<Link to={link} className="mt-2 inline-block text-sm underline">Revoir la notion dans le cours</Link>}</div>
  })}<h4 className="font-display text-xl">Ton entraînement</h4>{result.exercises.map((e,i)=><div key={`${e.chapterId}:${e.question}`} className="rounded-lg border border-slate-300 p-3 dark:border-slate-600"><h5 className="font-semibold">Exercice {i+1} · {e.skill}</h5><p className="whitespace-pre-wrap text-sm">{e.question}</p><label htmlFor={`${uid}-${i}`} className="mt-3 block text-sm">Ta réponse à l’exercice {i+1}</label><textarea id={`${uid}-${i}`} rows={3} maxLength={6000} className="mt-1 w-full rounded-lg border border-slate-400 bg-transparent p-2"/><details className="mt-2 text-sm"><summary className="cursor-pointer">Voir la correction</summary><p className="whitespace-pre-wrap">{e.correction}</p></details></div>)}<p className="text-xs">Les réponses d’entraînement ne sont pas envoyées pour correction et restent sur cette page. Le bilan automatique est une aide, pas une note officielle ni une garantie de résultat. Vérifie les explications avec le cours et ton professeur.</p></>}
 </div>
}
export default function NoteRevision({subject,chapter,missed,owner,result,onResult,onBusy}){
 const tr=usePublicText()
 const [subjectFiles,setSubjectFiles]=useState([]),[copyFiles,setCopyFiles]=useState([]),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const controller=useRef(null),lock=useRef(false),mounted=useRef(true),busyCallback=useRef(onBusy)
 busyCallback.current=onBusy
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort();busyCallback.current(false)}},[])
 const choose=(event,kind,append=false)=>{
  const selected=Array.from(event.target.files||[]);event.target.value=''
  if(!selected.length)return
  const next=append?[...(kind==='subject'?subjectFiles:copyFiles),...selected]:selected
  try{checkStudyFiles(kind==='subject'?next:subjectFiles,kind==='copy'?next:copyFiles)}catch(e){setError(next.length>3?'Maximum 3 fichiers par dépôt.':studyError(e.message));return}
  setError('');(kind==='subject'?setSubjectFiles:setCopyFiles)(next);setConsent(false);onResult(null)
 }
 const cancel=()=>{controller.current?.abort();setError('Analyse annulée. Tes questions et tes fichiers sont conservés dans cette page.')}
 const send=async()=>{
  if(lock.current)return
  setError('')
  const all=[...subjectFiles,...copyFiles]
  if(!subject||!chapter)return setError('Choisis la matière et le chapitre.')
  if(all.length&&(!subjectFiles.length||!copyFiles.length||!consent))return setError('Ajoute le sujet et la copie, puis autorise leur analyse.')
  if(!missed.trim()&&!all.length)return setError('Indique une question manquée.')
  lock.current=true;setBusy(true);onBusy(true)
  const ac=new AbortController();controller.current=ac;let timedOut=false
  const timer=setTimeout(()=>{timedOut=true;ac.abort()},STUDY_TIMEOUT)
  try{
   const value=await requestStudy({subject,chapter,missed,owner,subjectFiles,copyFiles,signal:ac.signal})
   if(!mounted.current||ac.signal.aborted)return
   onResult(value)
  }catch(e){if(mounted.current)setError(ac.signal.aborted?(timedOut?'Le délai est dépassé. Tes questions et tes fichiers restent dans cette page ; réessaie.':'Analyse annulée. Tes questions et tes fichiers sont conservés dans cette page.'):studyError(e.message))}
  finally{clearTimeout(timer);lock.current=false;if(mounted.current){setBusy(false);onBusy(false)}}
 }
 return <section className="space-y-3 rounded-xl border border-slate-300 p-4 dark:border-slate-600" aria-label={tr('Bilan du devoir')}>
  <p className="kicker">Ton prochain progrès</p><h3 className="font-display text-xl">Transformer ce devoir en entraînement</h3>
  <p className="text-sm">Le bilan et l’analyse de copie sont prévus dans Premium. Ultimate ajoute les exercices générés et l’accompagnement. Ces outils restent accessibles aux comptes connectés pendant le développement.</p>
  <p className="text-sm"><Link to="/exemple-bilan" className="underline">Voir un exemple de bilan</Link> · <Link to="/offres" className="underline">Comparer les offres</Link></p>
  <details><summary className="cursor-pointer text-sm font-semibold">Déposer mon sujet et ma copie</summary><div className="mt-3 space-y-3">
   <p className="text-xs">PDF ou photos JPEG, PNG, WebP. Trois fichiers par dépôt, 6 Mo au total. Vérifie leur lisibilité : page entière, texte net, bonne lumière, sans reflet. Pour un PDF, vérifie qu’il s’ouvre sans mot de passe. Maximum 30 pages.</p>
   <label className="block text-sm">Sujet<input type="file" multiple accept={COPY_TYPES.join(',')} disabled={busy} onChange={e=>choose(e,'subject')} className="block w-full text-xs"/></label>
   <label className="block text-sm">Ma copie<input type="file" multiple accept={COPY_TYPES.join(',')} disabled={busy} onChange={e=>choose(e,'copy')} className="block w-full text-xs"/></label>
   <label className="block text-sm">Photographier le sujet<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} onChange={e=>choose(e,'subject',true)} className="block w-full text-xs"/></label>
   <label className="block text-sm">Photographier ma copie<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} onChange={e=>choose(e,'copy',true)} className="block w-full text-xs"/></label>
   {[...subjectFiles,...copyFiles].map((f,i)=><p key={i} className="break-all text-xs">{i+1}. {f.name}</p>)}
   {allFilesPresent(subjectFiles,copyFiles)&&<button type="button" className="text-sm underline" disabled={busy} onClick={()=>{setSubjectFiles([]);setCopyFiles([]);setConsent(false);onResult(null);setError('')}}>Retirer les fichiers</button>}
   <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" disabled={busy} checked={consent} onChange={e=>setConsent(e.target.checked)}/>J’autorise leur envoi à l’IA pour cette analyse. Les fichiers ne sont pas conservés dans ma progression. Je masque les données personnelles inutiles.</label>
  </div></details>
  <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className="btn-primary" onClick={send}>{tr(busy?'Préparation en cours…':'Préparer mon bilan et mes exercices')}</button>{busy&&<button type="button" onClick={cancel} className="btn-ghost">Annuler l’analyse</button>}</div>
  {busy&&<p role="status" className="text-sm">Lecture et préparation en cours. Tu peux annuler ; le délai est limité à deux minutes.</p>}
  {error&&<p role="alert" className="text-sm">{tr(error)}</p>}
  <StudyResult result={result}/>
 </section>
}
const allFilesPresent=(a,b)=>a.length>0||b.length>0
