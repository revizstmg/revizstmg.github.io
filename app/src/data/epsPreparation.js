import activities from '../../content/eps/activites.json'
import EPS from '../../content/commun/eps-bac.json'
import preparation from '../../content/eps/preparation.json'
export {activities, EPS, preparation}
const courseFamilies = ['demi-fond','haies','vitesse']
const familyMap = {sauts:'sauts',lancers:'lancers','natation-vitesse':'natation-vitesse'}
export const eventsFor = id => EPS.seuilsCA1.lignes.filter(r=>id==='courses'?courseFamilies.includes(r.famille):r.famille===familyMap[id])
export const activityFor = id => activities.find(a=>a.id===id)||null
export const fieldFor = id => EPS.champs.find(c=>c.numero===activityFor(id)?.ca)||null
export const defaultEvent = id => (id==='courses'?'d800':id==='sauts'?'longueur':id==='lancers'?'poids':id==='natation-vitesse'?'crawl50':'')
export const emptySport = (activityId='') => ({activityId,eventId:defaultEvent(activityId),current:'',target:'',split:'4-4'})
export const emptyPreparation = () => ({category:'',sports:[emptySport(),emptySport(),emptySport()]})
export function metricFor(sport) {
 const a=activityFor(sport?.activityId)
 if(!a)return null
 if(a.ca===1){
  const event=eventsFor(a.id).find(e=>e.id===sport.eventId)
  if(!event)return null
  return {label:event.nom,kind:event.type==='temps'?'time':'distance',min:0.01,max:event.type==='temps'?3600:10000,higher:event.type!=='temps',unit:event.type==='temps'?'s':'m',event}
 }
 return preparation.metrics[a.id]||null
}
function normalNumber(value){return String(value??'').trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace('٫','.').replace(',','.')}
export function parsePerformance(raw,metric) {
 if(!metric)return null
 const text=normalNumber(raw)
 if(!text||text.length>24)return null
 let value
 if(metric.kind==='time'&&/[:’'′]/.test(text)){
  const m=/^(\d{1,2})\s*[:’'′]\s*(\d{1,2}(?:\.\d{1,2})?)$/.exec(text)
  if(!m||Number(m[2])>=60)return null
  value=Number(m[1])*60+Number(m[2])
 }else{
  if(!/^\d+(?:\.\d{1,2})?$/.test(text))return null
  value=Number(text)
 }
 if(!Number.isFinite(value)||value<metric.min||value>metric.max||(metric.kind==='count'&&!Number.isInteger(value)))return null
 return value
}
export function formatPerformance(value,metric){
 if(!Number.isFinite(value))return ''
 const number=n=>String(Math.round(n*100)/100).replace('.',',')
 if(metric.kind==='time'){
  const tenth=Math.round(value*10),minutes=Math.floor(tenth/600),seconds=(tenth%600)/10
  return `${minutes}:${seconds<10?'0':''}${number(seconds)}`
 }
 return `${number(value)} ${metric.unit}`
}
export function validateSelection(draft){
 if(!['g','f'].includes(draft?.category))return 'categoryRequired'
 if(!Array.isArray(draft.sports)||draft.sports.length!==3||draft.sports.some(s=>!activityFor(s.activityId)))return 'sportsRequired'
 if(new Set(draft.sports.map(s=>s.activityId)).size!==3)return 'differentSports'
 if(new Set(draft.sports.map(s=>activityFor(s.activityId).ca)).size!==3)return 'differentFields'
 return null
}
export function validatePreparation(draft){
 const selection=validateSelection(draft)
 if(selection)return {selection}
 const errors={}
 draft.sports.forEach((s,i)=>{
  const metric=metricFor(s)
  if(!metric)errors[`${i}.event`]='eventRequired'
  if(parsePerformance(s.current,metric)===null)errors[`${i}.current`]='invalidPerformance'
  if(parsePerformance(s.target,metric)===null)errors[`${i}.target`]='invalidPerformance'
  if(!['4-4','6-2','2-6'].includes(s.split))errors[`${i}.split`]='invalidSplit'
 })
 return errors
}
export function buildPreparation(draft){
 if(Object.keys(validatePreparation(draft)).length)throw Error('Préparation EPS invalide')
 return {category:draft.category,sports:draft.sports.map(s=>{
  const activity=activityFor(s.activityId),metric=metricFor(s),current=parsePerformance(s.current,metric),target=parsePerformance(s.target,metric)
  const improvement=metric.higher?target-current:current-target
  const priority=improvement<=0?'consolidation':(metric.kind==='count'?improvement>=3:current>0&&improvement/current>0.1)?'technique':'regularite'
  const next=metric.kind==='count'?current+Math.sign(target-current):current+(target-current)/3
  const intermediate=improvement>0?Math.max(Math.min(next,Math.max(current,target)),Math.min(current,target)):target
  // Les valeurs du référentiel portent des unités et des apostrophes :
  // leur lecture est séparée de la saisie élève stricte.
  const official=metric.event?parseReference(metric.event,draft.category):null
  const [afl2,afl3]=s.split.split('-').map(Number)
  return {activity,metric,current,target,improvement,gap:Math.abs(target-current),intermediate,priority:preparation.priorities[priority],priorityId:priority,reference:official,referenceLabel:metric.event?(draft.category==='g'?metric.event.g:metric.event.f):null,afl2,afl3,field:fieldFor(activity.id)}
 })}
}
function parseReference(event,category){
 const raw=String(category==='g'?event.g:event.f)
 if(event.type==='temps'){
  const m=/^(\d+)’(\d+)$/.exec(raw);if(m)return Number(m[1])*60+Number(m[2])
  const s=/^(\d+)’’(\d*)$/.exec(raw);if(s)return Number(s[1])+(s[2]?Number(`0.${s[2]}`):0)
  const mm=/^(\d+)’$/.exec(raw);return mm?Number(mm[1])*60:null
 }
 const n=Number(raw.replace(/\s/g,'').replace(/m$/,'').replace(',','.'));return Number.isFinite(n)?n:null
}
export const draftKey = accountId => `stmg_eps_preparation_v1:${encodeURIComponent(accountId||'trial')}`
export function readPreparation(storage,key){
 try{
  const raw=storage.getItem(key);if(!raw||raw.length>5000)return emptyPreparation()
  const d=JSON.parse(raw);if(d.version!==1||!Array.isArray(d.sports)||d.sports.length!==3)return emptyPreparation()
  return {category:['g','f'].includes(d.category)?d.category:'',sports:d.sports.map(s=>{
   if(!activityFor(s?.activityId))return emptySport()
   const eventValid=activityFor(s.activityId).ca!==1||eventsFor(s.activityId).some(e=>e.id===s.eventId)
   return {...emptySport(s.activityId),eventId:eventValid?(s.eventId||''):defaultEvent(s.activityId),current:eventValid?String(s.current??'').slice(0,24):'',target:eventValid?String(s.target??'').slice(0,24):'',split:['4-4','6-2','2-6'].includes(s.split)?s.split:'4-4'}
  })}
 }catch{return emptyPreparation()}
}
export function savePreparation(storage,key,draft){try{storage.setItem(key,JSON.stringify({version:1,...draft}));return true}catch{return false}}
