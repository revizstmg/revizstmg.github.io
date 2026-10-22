import { makeCalcSet, makeCalcMix } from '../calc.js'
// Les trois parcours utilisent uniquement la matière choisie et son contenu chargé.
import { ALL_CHAPTERS, themeChapters, jeuxDuChapitre, shuffle } from './index.js'
const prompt = q => String(q?.q || q?.text || q?.statement || q?.prompt || '')
export const successKey = (type, q) => q?.sourceKey || `${type}|${prompt(q)}`
export function updateSuccesses(previous = [], {themeId, type, reussies = []}, now = Date.now()) {
  const entries = new Map(previous.map(e=>[e.id,e]))
  for(const q of reussies) {
    const tid=q.themeId || themeId
    if(!tid || !prompt(q) || !['qcm','vraifaux','trou','saisie','calcul'].includes(type)) continue
    const id=`${tid}|${successKey(type,q)}`
    entries.set(id,{id,themeId:tid,type,q,at:now})
  }
  return [...entries.values()].sort((a,b)=>b.at-a.at).slice(0,2000)
}
const scopeParts = scope => { const [themeId,raw] = scope.split('::'); return {themeId,index:raw===undefined?null:Number(raw)} }
export function scopedThemes(subject, scope='') {
  const {themeId}=scopeParts(scope)
  return (subject?.chapters || []).map(t=>ALL_CHAPTERS[t.id]).filter(t=>t?.cours && (!themeId || t.id===themeId))
}
export function resumeInSubject(state,subject,scope='',position=null) {
  const {index:selectedIndex}=scopeParts(scope)
  let themes=scopedThemes(subject,scope)
  const start=themes.findIndex(t=>t.id===(position?.themeId || (state.lastChapter?.subjectId===subject.id ? state.lastChapter.chapterId : '')))
  if(start>0) themes=[...themes.slice(start),...themes.slice(0,start)]
  for(const theme of themes) {
    const chapters=themeChapters(theme).filter(ch=>selectedIndex===null || ch.idx===selectedIndex)
    const scores=state.chapters?.[theme.id]?.games || {}
    const first=selectedIndex===null && theme.id===position?.themeId ? Math.min(position.chapterIndex || 0,Math.max(0,chapters.length-1)) : 0
    const ordered=[...chapters.slice(first),...chapters.slice(0,first)]
    for(const chapter of ordered) {
      const games=jeuxDuChapitre(chapter,theme)
      const next=games.find(g=>(scores[g.id] || 0)<80)
      if(next) return {themeId:theme.id,chapterIndex:chapter.idx,game:next,title:chapter.title}
    }
  }
  return null
}
function inSection(entry,scope) {
  const {index}=scopeParts(scope)
  if(index===null) return true
  if(Number.isInteger(entry.q?.chapterIndex)) return entry.q.chapterIndex===index
  const theme=ALL_CHAPTERS[entry.themeId]
  return themeChapters(theme).some(ch=>ch.idx===index && ch.games.some(g=>g.type===entry.type && (g.questions || []).some(q=>successKey(g.type,q)===successKey(entry.type,entry.q))))
}
export function errorSteps(state,subject,themeId='') {
  const allowed=new Set(scopedThemes(subject,themeId).map(t=>t.id)), groups=new Map()
  // Les erreurs dues passent d’abord, mais l’élève peut retravailler toutes ses erreurs.
  const errors=[...(state.erreurs || [])].filter(e=>allowed.has(e.themeId) && inSection(e,themeId)).sort((a,b)=>String(a.due || '').localeCompare(String(b.due || '')))
  for(const e of errors.slice(0,12)) {
    const key=`${e.themeId}|${e.type}`
    if(!groups.has(key)) groups.set(key,{themeId:e.themeId,game:{id:`carnet-${e.type}`,type:e.type,title:'Comprendre mes erreurs',questions:[]}})
    groups.get(key).game.questions.push(e.q)
  }
  return [...groups.values()]
}
function asQcm(entry, chapter) {
  const {type,q,themeId}=entry
  if(type==='qcm' && Array.isArray(q.choices) && Number.isInteger(q.answer)) return {...q,themeId,chapterIndex:q.chapterIndex ?? chapter?.idx,sourceKey:successKey(type,q)}
  if(type==='vraifaux') return {q:q.statement,choices:['Vrai','Faux'],answer:q.answer?0:1,explain:q.explain,themeId,chapterIndex:q.chapterIndex ?? chapter?.idx,sourceKey:successKey(type,q)}
  if(type==='calcul' && Number.isFinite(q.answer)) {
    const step=Math.max(1,Math.abs(q.answer)*0.1,(q.tolerance || 0.01)*4)
    const choices=[q.answer,q.answer+step,q.answer-step,q.answer+2*step].map(v=>`${Number(v.toFixed(6)).toLocaleString('fr-FR',{maximumFractionDigits:6})}${q.unit?' '+q.unit:''}`)
    return {q:q.prompt,choices,answer:0,explain:q.explain,fig:q.fig,themeId,chapterIndex:q.chapterIndex ?? chapter?.idx,sourceKey:successKey(type,q)}
  }
  if(!['trou','saisie'].includes(type) || typeof q.answer!=='string' || !chapter) return null
  // Aucun distracteur extérieur au chapitre : reprendre seulement les choix
  // déjà validés pour le même terme dans un QCM de cette section.
  const match=chapter.games.filter(g=>g.type==='qcm').flatMap(g=>g.questions || []).find(x=>String(x.choices?.[x.answer]).toLocaleLowerCase()===q.answer.toLocaleLowerCase())
  if(!match) return null
  return {q:type==='trou'?q.text:q.prompt,choices:match.choices,answer:match.answer,explain:q.explain,themeId,chapterIndex:q.chapterIndex ?? chapter?.idx,sourceKey:successKey(type,q)}
}
export function acquiredQuestions(state,subject,themeId='',limit=12) {
  const themes=scopedThemes(subject,themeId), allowed=new Set(themes.map(t=>t.id))
  const failures=new Set((state.erreurs || []).map(e=>`${e.themeId}|${successKey(e.type,e.q)}`))
  const entries=[...(state.reussites || []).filter(e=>allowed.has(e.themeId) && inSection(e,themeId))]
  const sections=new Map()
  const relevant=themes.filter(t=>entries.some(e=>e.themeId===t.id) || Object.values(state.chapters?.[t.id]?.games || {}).includes(100))
  for(const theme of relevant) for(const chapter of themeChapters(theme)) {
    const games=jeuxDuChapitre(chapter,theme)
    for(const g of games) {
      for(const q of g.questions || []) sections.set(`${theme.id}|${successKey(g.type,q)}`,chapter)
      // Avant l’historique individuel, seul un score 100 % prouve que toutes
      // les questions de l’exercice ont été réussies. Un 80 % ne suffit pas.
      if(scopeParts(themeId).index!==null && chapter.idx!==scopeParts(themeId).index) continue
      if(state.chapters?.[theme.id]?.games?.[g.id]!==100) continue
      const known=g.type==='calcul' ? (g.gens ? makeCalcMix(g.gens,2) : g.gen ? makeCalcSet(g.gen,2) : g.questions || []) : g.questions || []
      for(const q of known) entries.push({themeId:theme.id,type:g.type,q:{...q,chapterIndex:chapter.idx}})
    }
  }
  const seen=new Set(), pools=new Map()
  for(const e of entries) {
    const key=`${e.themeId}|${successKey(e.type,e.q)}`
    if(failures.has(key) || seen.has(key)) continue
    const q=asQcm(e,sections.get(key)); if(!q) continue
    seen.add(key)
    if(!pools.has(e.themeId)) pools.set(e.themeId,[])
    pools.get(e.themeId).push(q)
  }
  // Chaque chapitre admissible est représenté avant de reprendre un second tour.
  const queues=shuffle([...pools.values()]).map(shuffle), out=[]
  while(out.length<limit && queues.some(q=>q.length)) for(const queue of queues) {
    if(out.length>=limit) break
    if(queue.length) out.push(queue.shift())
  }
  return shuffle(out)
}
