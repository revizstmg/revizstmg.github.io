import { useEffect, useRef, useState } from 'react'
import {reserverIA} from '../data/ia.js'
import { useStore } from '../store.jsx'
import { usePublicText } from '../i18n.js'
import { getSession, getValidToken } from '../auth.js'
import { SUPA_URL, SUPA_ANON } from '../supabase.js'
import { checkTutorReply } from '../../../supabase/functions/examen-blanc/tutor.js'
export default function CourseTutor({course}) {
 const {state}=useStore(), tr=usePublicText()
 const owner=state.account?.id
 const [messages,setMessages]=useState([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[pending,setPending]=useState('')
 const abort=useRef(null), lock=useRef(false), mounted=useRef(true),end=useRef(null)
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;abort.current?.abort()}},[])
 useEffect(()=>{if(messages.length)end.current?.scrollIntoView({block:'nearest'})},[messages.length])
 const send=async value=>{
  const question=(typeof value==='string'?value:input).trim()
  if(lock.current||!question||question.length>2000)return
  setInput(question);setError('');setPending(question);setBusy(true);lock.current=true
  const ac=new AbortController();abort.current=ac;const timer=setTimeout(()=>ac.abort(),150000)
  try{
   const token=await getValidToken()
   if(!owner||!token||getSession()?.user?.id!==owner)throw Error('login_required')
   const next=[...messages,{role:'user',text:question}]
   reserverIA();const response=await fetch(`${SUPA_URL}/functions/v1/examen-blanc`,{method:'POST',headers:{apikey:SUPA_ANON,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action:'tutor',course,messages:next.slice(-19)}),signal:ac.signal})
   const data=await response.json().catch(()=>({}))
   if(!response.ok)throw Error(data.error||'server_error')
   const reply=checkTutorReply(data.tutor)
   if(!mounted.current||ac.signal.aborted||getSession()?.user?.id!==owner)return
   setMessages([...next,{role:'assistant',text:reply.reply}]);setInput('')
  }catch(e){if(mounted.current)setError(e.message==='login_required'?'Connecte-toi pour discuter avec le tuteur.':e.message==='rate_limit'?'Beaucoup de messages ont été envoyés récemment. Fais une pause puis reprends cette discussion.':e.message==='out_of_scope'?'Revenons au chapitre ouvert : quelle notion veux-tu comprendre ?':'Le tuteur est momentanément indisponible. Ton message est conservé ; réessaie.')}
  finally{clearTimeout(timer);lock.current=false;if(mounted.current){setBusy(false);setPending('')}}
 }
 return <details className="no-print card mt-4 p-4" data-course-tutor>
  <summary className="cursor-pointer font-display text-lg font-semibold">Comprendre le cours</summary>
  <div className="mt-4 space-y-4">
   <p className="text-sm">On reprend ensemble, autant de fois que nécessaire. Je peux changer d’exemple, simplifier ou expliquer une étape à la fois. La discussion reste centrée sur ce chapitre.</p>
   <p className="text-xs text-slate-500 dark:text-slate-400">Tes messages et le cours sont transmis au service d’IA. La discussion reste disponible pendant cette visite et n’est pas enregistrée dans ton compte. L’IA peut se tromper : vérifie les points importants dans le cours.</p>
   <div tabIndex={0} role="log" aria-label={tr('Discussion avec le tuteur')} aria-live="polite" aria-relevant="additions" className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
    {messages.map((message,i)=><div key={i} className={`rounded-xl border border-slate-300 p-3 dark:border-slate-600 ${message.role==='user'?'ml-4':'mr-4'}`}><p className="mb-1 text-xs font-semibold">{tr(message.role==='user'?'Toi':'Tuteur')}</p><p className="whitespace-pre-wrap break-words text-sm" translate="no">{message.text}</p></div>)}
    {busy&&<p role="status" className="text-sm">Le tuteur prépare une autre explication…</p>}
    {busy&&<p className="whitespace-pre-wrap break-words text-sm" translate="no">{pending}</p>}
    <div ref={end} />
   </div>
   <fieldset disabled={busy} className="space-y-3"><legend className="sr-only">Discuter du cours</legend>
    <div className="flex flex-wrap gap-2">{['Explique-moi ce cours','Plus simplement','Un exemple concret','Pas à pas','Je ne comprends toujours pas'].map(label=><button key={label} type="button" className="rounded-full border border-slate-400 px-3 py-2 text-xs font-medium" onClick={()=>send(tr(label))}>{tr(label)}</button>)}</div>
    <label className="block text-sm font-medium">Qu’est-ce qui te bloque ?<textarea rows={3} maxLength={2000} value={input} onChange={e=>setInput(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-400 bg-transparent p-3 text-sm" /></label>
    <button type="button" className="btn-primary" disabled={!input.trim()} onClick={()=>send()}>Envoyer au tuteur</button>
   </fieldset>
   {error&&<p role="alert" className="text-sm">{tr(error)}</p>}
  </div>
 </details>
}
