import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, useThemeTimer } from '../store.jsx'
import Contenu from '../content/Contenu.jsx'
import { readPosition, savePosition } from '../data/readingPosition.js'
import { acquiredQuestions, errorSteps, resumeInSubject } from '../data/revisionPaths.js'
import { usePublicText } from '../i18n.js'
import GameHost from '../games/GameHost.jsx'
import { ALL_CHAPTERS } from '../data/index.js'

const labels={follow:'Suivre le fil',errors:'Comprendre mes erreurs',acquired:'Ancrer mes connaissances'}
const actions={follow:'Reprendre mes révisions',errors:'Retravailler mes erreurs',acquired:'Lancer mon QCM'}
const help={follow:'Choisis une matière : reprends au prochain exercice à travailler, ou sélectionne un chapitre précis.',errors:'Retrouve les questions que tu as ratées dans cette matière, avec leur correction. Tu peux cibler un chapitre.',acquired:'Un QCM mélange tes bonnes réponses de cette matière et des exercices réussis à 100 %, en répartissant les questions entre les chapitres.'}
export default function RevisionPath({mode,subjects,onBack}) {
 const tr=usePublicText(), title=useRef(null)
 const [sid,setSid]=useState(''),[tid,setTid]=useState('')
 useEffect(()=>title.current?.focus(),[mode])
 const subject=sid==='all' && mode==='acquired' ? {id:'all',name:'Toutes mes matières',color:'var(--c-accent-fort)',chapters:subjects.flatMap(s=>s.chapters)} : subjects.find(s=>s.id===sid)
 return <section className="mx-auto max-w-3xl space-y-5">
  <button className="lien-retour" onClick={onBack}>← {tr('Choisir une autre méthode')}</button>
  <header className="page-hero"><p className="kicker">{tr('Ton parcours de révision')}</p><h1 tabIndex={-1} ref={title} className="font-display text-3xl">{tr(labels[mode])}</h1><p className="mt-3 text-sm">{tr(help[mode])}</p></header>
  <div className="card grid gap-4 p-5 sm:grid-cols-2">
   <label htmlFor="revision-subject" className="text-sm font-semibold">{tr('Matière')}<select id="revision-subject" aria-label={tr('Matière')} className="mt-2 min-h-11 w-full rounded-xl border border-slate-400 bg-transparent p-2" value={sid} onChange={e=>{setSid(e.target.value);setTid('')}}><option value="">{tr('Choisis une matière')}</option>{mode==='acquired' && <option value="all">{tr('Toutes mes matières')}</option>}{subjects.map(s=><option value={s.id} key={s.id}>{tr(s.name)}</option>)}</select></label>
   <Contenu matieres={sid==='all'?subjects.map(s=>s.id):sid?[sid]:[]}><ChapterPicker subject={subject} tid={tid} setTid={setTid} mode={mode}/></Contenu>
  </div>
  {subject ? <Contenu matieres={sid==='all'?subjects.map(s=>s.id):[sid]}><ReadyPath key={`${mode}:${sid}:${tid}`} mode={mode} subject={subject} themeId={tid}/></Contenu> : <p className="text-sm text-slate-500 dark:text-slate-300">{tr('Choisis une matière pour commencer.')}</p>}
 </section>
}
function ReadyPath({mode,subject,themeId}) {
 const {state}=useStore(),tr=usePublicText()
 const [active,setActive]=useState(null),[index,setIndex]=useState(0),[finished,setFinished]=useState(false)
 const position=readPosition(state.account?.id,subject.id)
 const resume=mode==='follow'?resumeInSubject(state,subject,themeId,position):null
 const errors=mode==='errors'?errorSteps(state,subject,themeId):[]
 const acquired=mode==='acquired'?acquiredQuestions(state,subject,themeId):[]
 useThemeTimer(active && mode!=='acquired' ? active[index]?.themeId : null)
 const canStart=mode==='follow'?!!resume:mode==='errors'?!!errors.length:!!acquired.length
 const start=()=>{
  const steps=mode==='follow'?[resume]:mode==='errors'?errors:[{themeId:acquired[0].themeId,game:{id:'revision-acquis',type:'qcm',title:'Ancrer mes connaissances',questions:acquired}}]
  if(mode==='follow' && state.account?.id) savePosition(state.account.id,{subjectId:subject.id,themeId:resume.themeId,chapterIndex:resume.chapterIndex,page:position?.themeId===resume.themeId && position.chapterIndex===resume.chapterIndex ? position.page : 0})
  setActive(steps);setIndex(0);setFinished(false)
 }
 if(active && !finished) {
  const step=active[index]
  return <div className="space-y-3"><p className="text-sm">{tr(subject.name)} · {tr('Série {current} / {total}',{current:index+1,total:active.length})}</p><GameHost key={`${mode}:${index}:${step.game.id}`} game={step.game} chapterId={step.themeId} color={subject.color} modeInitial="train" onExit={()=>setActive(null)} suite={{label:tr(index+1<active.length?'Série suivante':'Terminer cette révision'),onClick:()=>index+1<active.length?setIndex(i=>i+1):setFinished(true)}}/></div>
 }
 return <section className="card space-y-4 p-5" aria-live="polite">
  {finished ? <><h2 className="font-display text-2xl">{tr('Révision terminée')}</h2><p>{tr('Tes réponses ont été enregistrées. Tu peux poursuivre dans cette matière ou changer de chapitre.')}</p></> : canStart ? <>
   <h2 className="font-display text-xl">{tr('Prêt à commencer')}</h2>
   {mode==='follow' && <p className="text-sm">{tr('Prochaine étape :')} {tr(resume.title)}</p>}
   {mode==='errors' && <p className="text-sm">{tr('Questions à retravailler : {count}',{count:errors.reduce((n,s)=>n+s.game.questions.length,0)})}</p>}
   {mode==='acquired' && <p className="text-sm">{tr('Questions issues de tes acquis : {count}',{count:acquired.length})}</p>}
  </> : <><h2 className="font-display text-xl">{tr(mode==='errors'?'Aucune erreur dans cette sélection':mode==='acquired'?'Pas encore de bonnes réponses à réviser ici':'Tu as terminé les exercices de cette sélection')}</h2><p className="text-sm">{tr(mode==='acquired'?'Réussis des exercices de cours : tes bonnes réponses alimenteront ce parcours.':mode==='errors'?'Choisis un autre chapitre ou continue tes cours.':'Choisis un autre chapitre pour poursuivre.')}</p><Link to={subject.id==='all'?'/cours':`/subject/${subject.id}`}  className="btn">{tr('Ouvrir les cours de cette matière')}</Link></>}
  {canStart && <button className="btn-gold min-h-11" onClick={start}>{tr(finished?'Continuer dans cette matière':actions[mode])}</button>}
 </section>
}

function ChapterPicker({subject,tid,setTid,mode}) {
 const tr=usePublicText()
 return <label htmlFor="revision-chapter" className="text-sm font-semibold">{tr('Chapitre (facultatif)')}<select id="revision-chapter" aria-label={tr('Chapitre (facultatif)')} disabled={!subject} className="mt-2 min-h-11 w-full rounded-xl border border-slate-400 bg-transparent p-2 disabled:opacity-50" value={tid} onChange={e=>setTid(e.target.value)}><option value="">{tr(mode==='follow' ? 'Là où je me suis arrêté' : 'Tous les chapitres')}</option>{subject?.chapters.map(t=><optgroup key={t.id} label={tr(t.name)}><option value={t.id}>{tr(t.name)}</option>{(ALL_CHAPTERS[t.id]?.cours || []).map((section,idx)=><option key={idx} value={`${t.id}::${idx}`}>{tr(section.h || `Partie ${idx+1}`)}</option>)}</optgroup>)}</select></label>
}
