import {useEffect,useState} from 'react'
import {fetchMembers,fetchClassOverviewQuizzes,fetchWall,todayKey} from '../classroom.js'

export default function ClassOverview({classCode,accountId,role,m,t,onSelect,lang,refreshKey=0}){
 const [data,setData]=useState(null),[reload,setReload]=useState(0)
 useEffect(()=>{
  let alive=true;setData(null)
  Promise.allSettled([fetchMembers(classCode),fetchClassOverviewQuizzes(classCode),fetchWall(classCode)]).then(results=>{
   if(!alive)return
   setData(Object.fromEntries(['members','quizzes','wall'].map((key,i)=>[key,results[i].status==='fulfilled'?results[i].value:null])))
  })
  return()=>{alive=false}
 },[classCode,accountId,role,reload,refreshKey])
 if(!data)return <p role="status" className="class-empty card">{t('pleaseWait')}</p>
 const students=data.members?.filter(member=>member.role!=='prof')
 const quizzes=data.quizzes?.filter(quiz=>quiz.status!=='proposed')
 const unanswered=data.wall?.filter(post=>post.kind!=='bravo'&&!post.resolved&&!post.answer)
 const teacher=role==='prof'
 const stats=[[students?.length,m.students],[students?.filter(member=>member.active_day===todayKey()).length,m.active],[quizzes?.length,m.quizzes],[unanswered?.length,m.questions]]
 const date=value=>{const d=value&&new Date(value);return d&&Number.isFinite(+d)?d.toLocaleDateString(lang || 'fr'):m.noDeadline}
 return <div className="class-overview">
  {Object.values(data).some(value=>value===null)&&<div className="class-alert" role="status"><p>{m.partial}</p><button className="btn-ghost" onClick={()=>setReload(n=>n+1)}>{t('retry')}</button></div>}
  <div className="class-stat-grid">{stats.map(([value,label])=><article className="class-stat card" key={label}><strong>{value??'—'}</strong><span>{label}</span></article>)}</div>
  <section className="class-quick card"><div><p className="class-kicker">{m.quick}</p><h3 className="font-display">{teacher?m.management:m.nextQuiz}</h3></div><div>
   <button className="class-primary" onClick={()=>onSelect('quiz',teacher?'create':null)}>{teacher?m.publishQuiz:m.openQuiz} <span aria-hidden>→</span></button>
   <button className="btn-ghost" onClick={()=>onSelect(teacher?'prof':'wall')}>{teacher?m.followStudents:m.ask}</button>
  </div></section>
  <div className="class-overview-columns">
   <section className="class-work card"><header><h3 className="font-display">{m.nextQuiz}</h3><span aria-hidden>01</span></header>
    {quizzes===null || quizzes===undefined?<p>{m.partial}</p>:quizzes.length?<ul>{quizzes.slice(0,4).map(quiz=><li key={quiz.id}><strong>{quiz.title || t('quizUntitled')}</strong><span>{date(quiz.due_at)}</span></li>)}</ul>:<p className="class-empty-text">{m.noQuiz}</p>}
    <button className="class-text-action" onClick={()=>onSelect('quiz')}>{m.openQuiz} →</button>
   </section>
   <section className="class-latest card"><header><h3 className="font-display">{m.latest}</h3><span aria-hidden>02</span></header>
    {data.wall===null?<p>{m.partial}</p>:data.wall.length?<ul>{data.wall.slice(0,3).map(post=><li key={post.id}><p>{post.text}</p></li>)}</ul>:<p className="class-empty-text">{m.noPosts}</p>}
    <button className="class-text-action" onClick={()=>onSelect('wall')}>{m.discussions} →</button>
   </section>
  </div>
  <section className="class-goal-preview"><span aria-hidden>✦</span><div><h3 className="font-display">{m.weekly}</h3><p>{m.goalHelp}</p></div><button className="btn-ghost" onClick={()=>onSelect('goal')}>{t('tabGoal')} →</button></section>
 </div>
}
