import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { nextMissionTarget, missionUrl } from '../data/missions.js'
import { missionStatus, MISSION_PASS } from '../data/missionProgress.js'
import { readPosition } from '../data/readingPosition.js'
import { missionMessages, missionFormat } from '../i18n/missions.js'
import { CourseText } from './Course.jsx'
import '../pages/Missions.css'

export default function MissionCard({resumeUrl, resumeTitle}) {
 const {state}=useStore(), m=missionMessages[state.lang] || missionMessages.fr
 const target=nextMissionTarget(state,readPosition(state.account?.id))
 const status=target && missionStatus(state.missions,target.themeId,target.index)
 return <article className="home-resume-card mission-home" data-mission-card>
  <span className="mission-seal" aria-hidden>✦</span>
  <p className="mission-kicker">{m.studio}</p>
  <h2 className="font-display mission-home-title">{m.title}</h2>
  {target ? <>
   <p className="mission-home-subject"><CourseText text={target.subjectName+' · '+target.themeName} /></p>
   <ol className="mission-mini-path">{status.stages.map((s,i)=><li key={s.id} data-done={s.best>=MISSION_PASS}><span aria-hidden>{s.best>=MISSION_PASS?'✓':i+1}</span><small>{m[s.id]}</small></li>)}</ol>
   <p className="mission-home-progress">{missionFormat(m.steps,{n:status.completed})}</p>
   <Link to={missionUrl(target)} className="mission-primary">{status.practiced?m.continue:m.start}<span aria-hidden>↗</span></Link>
  </> : <><p>{m.none}</p><Link to="/cours" className="mission-primary">{m.start}</Link></>}
  {resumeUrl && <Link to={resumeUrl} className="mission-course-resume"><CourseText text={resumeTitle || ''} /><span>{m.resumeCourse} →</span></Link>}
 </article>
}
