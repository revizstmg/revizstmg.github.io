import {useEffect,useMemo,useRef,useState} from 'react'
import {useStore} from '../store.jsx'
import {usePublicText} from '../i18n.js'
import {practiceKey,readPractice,requestPractice,practiceUnits} from '../data/practice.js'
import {withControlDeadline} from '../controlRequest.js'
import Qcm from '../games/Qcm.jsx'
import {ContexteCorrection} from '../games/common.jsx'
import './PracticeStudio.css'
export default function PracticeStudio({course,themeId,index,color}){
 const {state}=useStore()
 return <Studio key={`${state.account?.id||'trial'}:${course.id}`} course={course} themeId={themeId} index={index} color={color} owner={state.account?.id}/>
}
function Studio({course,themeId,index,color,owner}){
 const {recordResult,noterReponses}=useStore(),tr=usePublicText()
 const [history,setHistory]=useState(()=>readPractice(course,owner)),[busy,setBusy]=useState(false),[error,setError]=useState(''),[playing,setPlaying]=useState(false),[result,setResult]=useState(null),[saveError,setSaveError]=useState(false),[run,setRun]=useState(0)
 const controller=useRef(null),mounted=useRef(true),locked=useRef(false),finished=useRef(false),heading=useRef(null)
 const units=practiceUnits(course),bank=history.bank
 const game=useMemo(()=>bank?{id:`${course.id}::practice`,questions:bank.questions,count:bank.questions.length}:null,[bank,course.id])
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;controller.current?.abort(Error('cancelled'))}},[])
 const create=async()=>{
  if(locked.current)return;locked.current=true;setBusy(true);setError('');const ac=new AbortController();controller.current=ac
  try{const next=await withControlDeadline(signal=>requestPractice(course,history,owner,signal),ac,150000);if(!mounted.current)return
   setHistory(next);try{localStorage.setItem(practiceKey(course,owner),JSON.stringify(next));setSaveError(false)}catch{setSaveError(true)}
   finished.current=false;setResult(null);setRun(n=>n+1);setPlaying(true);requestAnimationFrame(()=>heading.current?.focus())
  }catch(e){if(mounted.current)setError(tr(e.message==='login_required'?'Connecte-toi pour créer une série originale.':e.message==='cancelled'?'Attente annulée. Rien n’a été ajouté.':e.message==='timeout'?'La préparation prend trop de temps. Réessaie ou utilise les exercices disponibles ci-dessous.':e.message==='rate_limit'?'Trop de demandes. Patiente avant de réessayer.':e.message==='invalid_response'?'La série reçue ne respecte pas le chapitre ou manque de variété. Elle n’a pas été ajoutée.':e.message==='out_of_scope'?'Ce passage du cours ne permet pas de préparer une série fiable. Les autres exercices restent disponibles.':'Le service qui crée les questions est indisponible pour le moment. Les exercices du chapitre restent disponibles ; réessaie plus tard.'))}
  finally{locked.current=false;if(mounted.current)setBusy(false)}
 }
 const done=({correct,total,ratees=[],reussies=[]})=>{
  if(finished.current)return;finished.current=true
  const pct=total?Math.round(100*correct/total):0
  recordResult({chapterId:themeId,gameId:`${course.id}::practice`,pct,correct,total,xp:correct*10})
  const locate=q=>({...q,chapterIndex:index,themeId})
  noterReponses({themeId,type:'qcm',ratees:ratees.map(locate),reussies:reussies.map(locate)})
  setResult({correct,total});setPlaying(false);requestAnimationFrame(()=>heading.current?.focus())
 }
 return <section className="practice-studio" data-practice-studio>
  <header><div><p className="kicker">🎯 {tr('À toi de réfléchir')}</p><h2 ref={heading} tabIndex={-1}>{tr('Comprendre et appliquer')}</h2></div><span>{tr('Une série à la fois')}</span></header>
  {!playing?<><p>{tr('Des situations, des décisions à justifier et des erreurs à repérer. Les passages encore peu travaillés passent en premier, dans tout le chapitre.')}</p><ol className="practice-skills"><li>🧩 {tr('Analyser une situation')}</li><li>🔎 {tr('Vérifier un raisonnement')}</li><li>💡 {tr('Expliquer une décision')}</li></ol>
   {result&&<div className="practice-result" role="status"><strong>{result.correct} / {result.total}</strong><span>{tr('Réponses justes dans cette série')}</span></div>}
   <div className="practice-actions">{bank&&<button className="btn-ghost" disabled={busy} onClick={()=>{finished.current=false;setResult(null);setRun(n=>n+1);setPlaying(true)}}>{tr(result?'Revoir cette série':'Ouvrir ma série')}</button>}<button className="btn-primary" disabled={busy||!owner||!units.length||course.text.length>60000} onClick={create}>{tr(bank?'Créer une nouvelle série':'Créer ma série')}</button></div>
   {!owner&&<p className="text-sm">{tr('Connecte-toi pour créer une série originale. Les exercices de mémorisation restent accessibles sans compte.')}</p>}
   <p className="practice-privacy">{tr('Le cours est envoyé à un service d’intelligence artificielle externe (Gemini, de Google), uniquement quand tu le demandes, avec les questions déjà posées dans ce chapitre. Tes réponses et ton identité ne sont pas envoyées. Les questions créées par l’IA peuvent comporter des erreurs ; chaque correction indique le passage du cours dont elle vient.')}</p>
  </>:<><div className="practice-play-title"><p>{tr('Prends le temps de raisonner avant de choisir.')}</p><button className="underline" onClick={()=>setPlaying(false)}>{tr('Fermer la série')}</button></div><ContexteCorrection.Provider value={{themeId,idx:index}}><Qcm key={run} game={game} color={color} mode="solo" onDone={done}/></ContexteCorrection.Provider></>}
  {busy&&<div className="mt-4"><p role="status">{tr('Préparation des situations à partir du chapitre…')}</p><button className="btn-ghost mt-2" onClick={()=>controller.current?.abort(Error('cancelled'))}>{tr('Annuler l’attente')}</button></div>}{error&&<p role="alert" className="mt-4">{error}</p>}{saveError&&<p role="alert" className="mt-3">{tr('La série fonctionne, mais ce navigateur ne peut pas la conserver après fermeture.')}</p>}
 </section>
}
