import {useMemo,useRef,useState} from 'react'
import {Link,Navigate,useNavigate,useParams} from 'react-router-dom'
import {useStore,useThemeTimer} from '../store.jsx'
import {getSubject,getChapter,themeChapters} from '../data/index.js'
import {chapterMission,missionSubjects,nextMissionTarget,missionUrl,bossResult} from '../data/missions.js'
import {missionStatus,MISSION_PASS} from '../data/missionProgress.js'
import {missionMessages,missionFormat as fmt} from '../i18n/missions.js'
import {CourseText} from '../components/Course.jsx'
import GameHost from '../games/GameHost.jsx'
import Introuvable from './Introuvable.jsx'
import './Missions.css'

export default function Missions() {
 const {state}=useStore(),{sid,tid,cidx}=useParams()
 if(!state.track)return <Navigate to="/" replace/>
 if(!missionSubjects(state.track).some(s=>s.id===sid&&s.chapters.some(t=>t.id===tid)))return <Introuvable retour={{to:'/cours',label:missionMessages[state.lang]?.course || missionMessages.fr.course}}/>
 return <MissionPage key={(state.account?.id || 'trial')+':'+sid+':'+tid+':'+cidx} sid={sid} tid={tid} index={Number(cidx)}/>
}
function MissionPage({sid,tid,index}) {
 const {state,recordMission}=useStore(),navigate=useNavigate()
 const m=missionMessages[state.lang] || missionMessages.fr
 const subject=getSubject(sid),theme=getChapter(tid)
 const mission=useMemo(()=>Number.isInteger(index)&&index>=0?chapterMission(tid,index):null,[tid,index])
 const [run,setRun]=useState(null),[bilan,setBilan]=useState(null)
 const [round,setRound]=useState(0)
 const [pickerOpen,setPickerOpen]=useState(false)
 const choices=useMemo(()=>pickerOpen?subject.chapters.map(t=>({...t,sections:themeChapters(t)})):[],[pickerOpen,subject])
 const results=useRef([])
 const heading=useRef(null)
 useThemeTimer(tid)
 const playingGame=useMemo(()=>{
  if(!run || !mission)return null
  const game=run==='boss'?mission.rounds[round]:mission.practice[run]
  const title=m[run]+(run==='boss'?' · '+fmt(m.round,{n:round+1}):'')
  return {...game,title}
 },[mission,run,round,m])
 if(!mission)return <Introuvable retour={{to:'/cours',label:m.course}}/>
 const status=missionStatus(state.missions,tid,index)
 const courseUrl='/subject/'+sid+'/theme/'+tid+'/chapter/'+index
 const target=nextMissionTarget(state,{themeId:tid,chapterIndex:index})
 const currentUrl='/missions/'+sid+'/'+tid+'/'+index
 const nextUrl=target && missionUrl(target)
 const start=stage=>{
  results.current=[];setRound(0);setBilan(null);setRun(stage)
 }
 const done=result=>{
  if(run==='boss'){
   results.current[round]=result
   if(round===1){
    const final=bossResult(results.current)
    if(final){recordMission({themeId:tid,index,stage:run,...final});setBilan({...final,stage:run,rounds:[...results.current]})}
   }
  } else {
   recordMission({themeId:tid,index,stage:run,...result})
   setBilan({...result,stage:run})
  }
 }
 const finish=()=>{
  if(run==='boss'&&round===0){setRound(1);return}
  setRun(null)
  requestAnimationFrame(()=>heading.current?.focus())
 }
 if(run){
  return <GameHost key={run+':'+round} game={playingGame} chapterId={tid} chapterIndex={index} color={subject.color}
   modeInitial="train" guided onResult={done}
   hint={{label:m.hint,help:m.hintHelp,text:mission.hint}}
   onExit={()=>{setRun(null);setBilan(null);results.current=[]}}
   suite={{label:run==='boss'&&round===0?m.nextRound:m.result,onClick:finish}}/>
 }
 const won=bilan?.pct>=MISSION_PASS
 return <div className="mission-page animate-lux space-y-6" data-mission-page>
  <header className="mission-hero">
   <div><p className="mission-eyebrow">{m.studio}</p><h1 ref={heading} tabIndex={-1} className="font-display"><CourseText text={mission.chapter.title}/></h1><p className="mission-lead">{m.intro}</p><p className="mission-location"><CourseText text={subject.short || subject.name}/> · <CourseText text={theme.short || theme.name}/></p></div>
   <div className="mission-emblem" aria-hidden><span>✦</span><strong>{status.completed}/3</strong></div>
  </header>
  {bilan&&<section className={'mission-result '+(won?'mission-result-success':'')} aria-live="polite">
   <p className="mission-kicker">{m[bilan.stage]}</p><h2 className="font-display">{won?m.success:m.failure}</h2>
   <strong className="mission-score">{bilan.pct} %</strong>
   {bilan.rounds&&<ul>{bilan.rounds.map((r,i)=><li key={i}>{fmt(m.resultRound,{n:i+1,pct:r.pct})}</li>)}</ul>}
   <p>{bilan.stage==='boss'?m.bossRule:m.goal}</p>
   {won&&bilan.assisted&&<p>{m.assisted}</p>}
   <div className="mission-actions"><button type="button" className="mission-primary" onClick={()=>{if(won)setBilan(null);else start(bilan.stage)}}>{won?m.continue:m.retry}</button><Link className="mission-secondary" to={courseUrl}>{m.course}</Link></div>
  </section>}
  {!mission.rounds.length?<section className="card p-6"><p>{m.noGames}</p><Link to={courseUrl} className="mission-primary">{m.course}</Link></section>:<>
   <section className="mission-map" aria-labelledby="mission-path-title">
    <div className="mission-map-heading"><h2 id="mission-path-title" className="font-display">{m.title}</h2><span>{fmt(m.steps,{n:status.completed})}</span></div>
    <ol className="mission-path">{status.stages.map((s,i)=>{
     const passed=s.best>=MISSION_PASS, locked=status.stages.slice(0,i).some(p=>p.best<MISSION_PASS)
     return <li key={s.id} data-state={passed?'done':locked?'locked':'active'}>
      <span className="mission-node" aria-hidden>{passed?'✓':i+1}</span>
      <div><p className="mission-stage-state">{passed?m.passed:locked?m.locked:m.ready}</p><h3 className="font-display">{m[s.id]}</h3><p>{m[s.id+'Help']}</p>{s.updatedAt>0&&<small>{s.best} %</small>}</div>
     </li>
    })}</ol>
    <div className="mission-launch">
     <div><strong>{m[status.next]}</strong><p>{status.next==='boss'?m.bossRule:m.goal}</p></div>
     <button type="button" className="mission-primary" onClick={()=>start(status.next)}>{status.completed===3?m.replay:status.next==='boss'?m.startBoss:status.practiced?m.continue:m.start}<span aria-hidden>→</span></button>
    </div>
    <p className="mission-save">{m.save}</p>
   </section>
   <section className="mission-mastery">
    <span aria-hidden className="mission-medal">{status.medal==='durable'?'✦':status.medal==='autonomous'?'◇':'○'}</span>
    <div><h2 className="font-display">{status.medal?m[status.medal]:m.autonomous}</h2><p>{m.medalHelp}</p></div>
   </section>
  </>}
  <div className="mission-bottom-links"><Link to={courseUrl}>{m.course} ↗</Link>{status.completed===3&&nextUrl!==currentUrl&&<Link to={nextUrl}>{m.next} →</Link>}{state.classCode&&<Link to="/classe">{m.class} ↗</Link>}</div>
  <details className="mission-picker card" onToggle={e=>setPickerOpen(e.currentTarget.open)}><summary>{m.choose}</summary>{pickerOpen&&<div className="mission-picker-fields">
   <label>{m.subject}<select value={sid} onChange={e=>{const s=missionSubjects(state.track).find(s=>s.id===e.target.value);if(s)navigate(`/missions/${s.id}/${s.chapters[0].id}/0`)}}>{missionSubjects(state.track).map(s=><option key={s.id} value={s.id}>{s.short || s.name}</option>)}</select></label>
   <label>{m.chapter}<select value={tid+'::'+index} onChange={e=>{const parts=e.target.value.split('::');navigate(`/missions/${sid}/${parts[0]}/${parts[1]}`)}}>{choices.map(t=><optgroup key={t.id} label={t.short || t.name}>{t.sections.map(c=><option key={c.id} value={t.id+'::'+c.idx}>{c.idx+1} · {c.title}</option>)}</optgroup>)}</select></label>
  </div>}</details>
 </div>
}
