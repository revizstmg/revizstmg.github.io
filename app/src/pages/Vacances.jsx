import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, useThemeTimer } from '../store.jsx'
import { Rich } from '../components/ui.jsx'
import { Figure } from '../games/Calcul.jsx'
import Contenu from '../content/Contenu.jsx'
import { todayKey } from '../data/srs.js'
import { ALL_CHAPTERS } from '../data/index.js'
import { courseText } from '../data/examenPersonnalise.js'
import { vacancesSubjects, vacancesChapters, createVacances, prepareVacancesSession, answerVacances, vacancesScore, vacancesSessionDone, vacancesTrackKey } from '../data/vacances.js'
import { vacancesText } from '../i18n/vacances.js'
import './Vacances.css'
const chapterUrl = (p,ch) => `/subject/${p.subjectId}/theme/${ch.themeId}/chapter/${ch.idx}`
export default function Vacances() {
 const {state} = useStore()
 if (!state.track) {
  const m=(key,values)=>vacancesText(state.lang,key,values)
  return <div className="vacances-page space-y-6"><header className="vacances-hero"><h1 className="font-display">{m('title')}</h1><p>{m('intro')}</p><p>{m('scope')}</p></header><ParentInfo m={m} sharing={false}/><Link className="btn-primary" to="/changer">{m('try')}</Link></div>
 }
 return <VacancesPage key={`${state.account?.id || 'trial'}:${vacancesTrackKey(state.track)}`} />
}
function VacancesPage() {
 const {state,setParcours} = useStore(), m = (k,v) => vacancesText(state.lang,k,v)
 const subjects = vacancesSubjects(state.track)
 const program = state.parcours?.vacances?.trackKey === vacancesTrackKey(state.track) ? state.parcours.vacances : null
 const [editing,setEditing] = useState(false), [phase,setPhase] = useState(null)
 const [sid,setSid] = useState(program?.subjectId || '')
 const update = fn => setParcours(previous => ({...previous,vacances:fn(previous.vacances)}))
 const replace = () => { if (window.confirm(m('replace'))) {setEditing(true);setPhase(null)} }
 return <div className="vacances-page space-y-6">
  <header className="vacances-hero"><p className="kicker">☀️ RévizSTMG</p><h1 className="font-display">{m('title')}</h1><p>{m('intro')}</p><p>{m('scope')}</p></header>
  {!state.account?.id && <p className="vacances-note">{m('local')}</p>}
  {(!program || editing) ? <>
   <label className="vacances-subject">{m('subject')}<select aria-label={m('subject')} value={sid} onChange={e=>setSid(e.target.value)}><option value="">{m('chooseSubject')}</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label>
   <Contenu matieres={sid?[sid]:[]}><Setup key={sid} subject={subjects.find(s=>s.id===sid)} m={m} track={state.track} onCreate={p=>{if (!program && state.parcours?.vacances && !window.confirm(m('replace'))) return;update(()=>p);setEditing(false);setPhase('initial')}} /></Contenu>
   {program && <button type="button" className="btn-ghost" onClick={()=>setEditing(false)}>{m('back')}</button>}
  </> : <Contenu matieres={[program.subjectId]}>
   {phase !== null ? <Activity program={program} phase={phase} m={m} onAnswer={(id,picked)=>update(p=>p?.id===program.id?answerVacances(p,phase,id,picked):p)} onBack={()=>setPhase(null)}/> : <Overview program={program} m={m} lang={state.lang} onPhase={setPhase} onStart={index=>{update(p=>p?.id===program.id?prepareVacancesSession(p,index):p);setPhase(index)}} onReplace={replace}/>} 
  </Contenu>}
  <ParentInfo m={m} sharing={state.parentShare}/>
 </div>
}
function Setup({subject,m,track,onCreate}) {
 const chapters = useMemo(()=>vacancesChapters(subject),[subject])
 const [selection,setSelection]=useState(['']),[goal,setGoal]=useState('bases'),[date,setDate]=useState(todayKey()),[rhythm,setRhythm]=useState(4),[minutes,setMinutes]=useState(20),[error,setError]=useState('')
 const sample = chapters.find(ch=>selection.includes(ch.id))?.questions[0]
 function submit(e) {
  e.preventDefault()
  try {onCreate(createVacances({subject,selection:selection.filter(Boolean),track,startDate:date,goal,minutes,rhythm,id:crypto.randomUUID()}))} catch (error) {setError(m(error.message==='insufficient_questions'?'capacity':'error'))}
 }
 if (!subject) return <p className="card p-5">{m('chooseSubject')}</p>
 if (!chapters.length) return <p className="card p-5">{m('empty')}</p>
 return <form className="card vacances-setup" onSubmit={submit}>
  <h2 className="font-display text-2xl">{m('start')}</h2>
  <div className="vacances-fields"><label>{m('goal')}<select aria-label={m('goal')} value={goal} onChange={e=>setGoal(e.target.value)}><option value="bases">{m('bases')}</option><option value="controle">{m('controle')}</option></select></label><label>{m('date')}<input aria-label={m('date')} type="date" required value={date} onChange={e=>setDate(e.target.value)} /></label><label>{m('rhythm')}<select aria-label={m('rhythm')} value={rhythm} onChange={e=>setRhythm(Number(e.target.value))}><option value={3}>3</option><option value={4}>4</option></select></label><label>{m('duration')}<select aria-label={m('duration')} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}>{[15,20,30].map(n=><option key={n} value={n}>{m('minutes',{n})}</option>)}</select></label></div>
  <fieldset><legend className="font-semibold">{m('chapters')}</legend><p className="mt-2 text-sm">{m('selection')}</p><div className="mt-3 space-y-3">{selection.map((id,i)=><label className="block text-sm font-semibold" key={i}>{m('chapter',{n:i+1})}<select aria-label={m('chapter',{n:i+1})} className="vacances-chapter-select mt-2" value={id} onChange={e=>setSelection(ids=>ids.map((v,j)=>i===j?e.target.value:v))}><option value="">{m('chooseChapter')}</option>{chapters.filter(ch=>ch.id===id||!selection.includes(ch.id)).map(ch=><option key={ch.id} value={ch.id}>{ch.title}</option>)}</select></label>)}{selection.length<3 && <button type="button" className="btn-ghost" onClick={()=>setSelection(ids=>[...ids,''])}>{m('addChapter')}</button>}</div></fieldset>
  {sample && <details className="vacances-note"><summary>{m('preview')}</summary><p className="mt-3 text-sm">{m('previewHelp')}</p><div lang="fr" translate="no" className="mt-3 space-y-2"><p>{sample.q}</p><p><strong>{m('correction')}</strong> {sample.choices[sample.answer]}</p><Rich text={sample.explain}/></div></details>}
  <p className="text-sm">{m('initialHelp')}</p><p className="text-sm">{m('estimate')}</p>
  {error && <p role="alert">{error}</p>}
  <button className="btn-primary" disabled={!selection.some(Boolean)} type="submit">{m('begin')}</button>
 </form>
}
function Overview({program:p,m,lang,onPhase,onStart,onReplace}) {
 const initial=vacancesScore(p.initialQuestions,p.initialAnswers), final=vacancesScore(p.finalQuestions,p.finalAnswers)
 const done=p.sessions.filter(vacancesSessionDone).length, index=p.sessions.findIndex(s=>!vacancesSessionDone(s))
 const date = value => new Date(`${value}T12:00:00Z`).toLocaleDateString(lang || 'fr',{day:'numeric',month:'short',timeZone:'UTC'})
 return <>
  <section className="card p-5 space-y-4"><p className="kicker">{p.subjectName} · {m(p.goal)}</p><h2 className="font-display text-2xl">{m('plan')}</h2><p>{m('progress',{done,total:p.sessions.length})}</p><progress className="vacances-progress" max={p.sessions.length} value={done} aria-label={m('plan')}/>
  {initial===null ? <><p>{m('initialHelp')}</p><button className="btn-primary" onClick={()=>onPhase('initial')}>{m(Object.keys(p.initialAnswers).length?'resume':'begin')}</button></> : index>=0 ? <><p>{m('adapt')}</p><button className="btn-primary" onClick={()=>onStart(index)}>{m(p.sessions[index].questions.length?'resumeSession':'nextSession')}</button></> : final===null ? <><p>{m('finalHelp')}</p><button className="btn-primary" onClick={()=>onPhase('final')}>{m(Object.keys(p.finalAnswers).length?'resume':'finalStart')}</button></> : <Link className="btn-primary" to="/parcours">{m('follow')}</Link>}
  </section>
  <section className="card p-5 space-y-4" aria-labelledby="vacances-results"><h2 id="vacances-results" className="font-display text-2xl">{m('results')}</h2><div className="vacances-scores"><div><h3>{m('initial')}</h3><strong>{initial===null?m('pending'):`${initial} %`}</strong></div><div><h3>{m('final')}</h3><strong>{final===null?m('pending'):`${final} %`}</strong></div></div><p className="text-sm">{m('resultHelp')}</p>
  {initial!==null && <details><summary>{m('chapterResult')}</summary><ul className="mt-3 space-y-4">{p.chapters.map(ch=>{const qs=p.initialQuestions.filter(q=>q.chapterId===ch.id),fs=p.finalQuestions.filter(q=>q.chapterId===ch.id),a=vacancesScore(qs,p.initialAnswers),b=vacancesScore(fs,p.finalAnswers);return <li key={ch.id}><p lang="fr" translate="no">{ch.title}</p><p className="text-sm">{m('initial')} : {a===null?m('pending'):`${a} %`} · {m('final')} : {b===null?m('pending'):`${b} %`}</p><Link className="underline" to={chapterUrl(p,ch)}>{m('returnCourse')}</Link></li>})}</ul></details>}
  </section>
  <section aria-labelledby="vacances-sessions"><h2 id="vacances-sessions" className="font-display text-2xl mb-4">{m('sessions')}</h2><ol className="vacances-sessions">{p.sessions.map((s,i)=><li className="card p-4" key={i}><div><h3 className="font-semibold">{m('session',{n:i+1})}</h3><p className="mt-1 text-sm">{date(s.date)} · {m('minutes',{n:p.minutes})}</p></div><span>{m(vacancesSessionDone(s)?'done':'upcoming')}</span></li>)}</ol><p className="mt-3 text-sm">{m('estimate')}</p><p className="mt-2 text-sm">{m('revisit')}</p></section>
  <button className="btn-ghost" onClick={onReplace}>{m('restart')}</button>
 </>
}
function Activity({program:p,phase,m,onAnswer,onBack}) {
 const initial=phase==='initial',final=phase==='final',session=typeof phase==='number'?p.sessions[phase]:null
 const questions=initial?p.initialQuestions:final?p.finalQuestions:session?.questions || []
 const answers=initial?p.initialAnswers:final?p.finalAnswers:session?.answers || {}
 const first=questions.findIndex(q=>!answers[q.id])
 const [index,setIndex]=useState(first<0?questions.length:first),[reading,setReading]=useState(!!session && !Object.keys(answers).length)
 const heading=useRef(null)
 const q=questions[index]
 const focus = session && p.chapters.find(ch=>ch.id===(q?.chapterId || session.focus))
 useThemeTimer(session ? focus?.themeId : null)
 useEffect(()=>{heading.current?.focus()},[index,reading])
 const title=initial?m('initial'):final?m('final'):m('session',{n:phase+1})
 if (!questions.length) return <button className="btn-ghost" onClick={onBack}>{m('back')}</button>
 return <section className="space-y-4"><button className="lien-retour" onClick={onBack}>← {m('back')}</button><h2 ref={heading} tabIndex={-1} className="font-display text-3xl">{title}</h2>
 {reading ? <div className="card p-5 space-y-4"><h3 className="font-display text-2xl">{m('read')}</h3><p>{m('readingHelp')}</p>{[...new Set(questions.map(q=>q.chapterId))].map(id=>{const ch=p.chapters.find(ch=>ch.id===id),current=ALL_CHAPTERS[ch.themeId]?.cours?.[ch.idx];return <details key={id} open={id===session.focus}><summary lang="fr" translate="no">{ch.title}</summary><div lang="fr" translate="no" tabIndex={0} className="vacances-reading"><Rich text={courseText(current || {})}/></div><Link className="underline" to={chapterUrl(p,ch)}>{m('returnCourse')}</Link></details>})}<button className="btn-primary" onClick={()=>setReading(false)}>{m('practice')}</button></div> : q ? <div className="card p-5 space-y-4" data-vacances-question={q.id}>
  <p>{m('question',{n:index+1,total:questions.length})}</p><p className="text-sm" lang="fr" translate="no">{p.chapters.find(ch=>ch.id===q.chapterId)?.title}</p><h3 className="text-lg font-semibold" lang="fr" translate="no">{q.q}</h3>{q.fig&&<Figure fig={q.fig}/>}
  <div className="vacances-choices">{q.choices.map((text,i)=><button type="button" disabled={!!answers[q.id]} className="vacances-choice" key={i} lang="fr" translate="no" onClick={()=>onAnswer(q.id,i)}>{String.fromCharCode(65+i)}. {text}</button>)}</div>
  {answers[q.id] && <><div className="vacances-note" role="status"><p className="font-semibold">{m(answers[q.id].correct?'correct':'incorrect')}</p><div lang="fr" translate="no" className="mt-2 space-y-2"><p>{m('correction')} {q.choices[q.answer]}</p><Rich text={q.explain}/></div></div><button className="btn-primary" onClick={()=>index+1<questions.length?setIndex(i=>i+1):onBack()}>{m(index+1<questions.length?'next':'finish')}</button></>}
 </div> : <button className="btn-primary" onClick={onBack}>{m('back')}</button>}
 {session&&focus&&<details className="card p-5" open={p.goal==='controle'}><summary>{m('written')}</summary><p className="mt-3 text-sm">{m('writtenHelp')}</p><Link className="btn-ghost mt-3" to={chapterUrl(p,focus)}>{m('returnCourse')}</Link></details>}
 </section>
}
function ParentInfo({m,sharing}) {
 return <section className="vacances-parent" aria-labelledby="vacances-parent-title"><h2 id="vacances-parent-title" className="font-display text-2xl">{m('parent')}</h2><p>{m('parentHelp')}</p><p>{m('pricing')}</p><p>{m(sharing?'shared':'privacy')}</p><Link className="btn-ghost" to="/parametres?rubrique=donnees&reglage=parents">{m('share')}</Link></section>
}
