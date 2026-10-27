import { beforeAll, expect, it } from 'vitest'
import { chargerMatieres } from '../src/data/index.js'
import { vacancesSubjects, vacancesChapters, createVacances, prepareVacancesSession, answerVacances, vacancesScore, vacancesSessionDone } from '../src/data/vacances.js'
import { cleanVacancesSummary, vacancesSummary, mergeVacances } from '../src/data/vacancesState.js'
import { mergeProgress, chargeUtile } from '../src/progression.js'
import { buildChildSnapshot } from '../src/store.jsx'
import { vacancesMessages } from '../src/i18n/vacances.js'
const track={level:'terminale-stmg',specialty:'gestion-finance'}
let subject,chapters
beforeAll(async()=>{await chargerMatieres(['droit','economie','management','p1-droit','p1-economie','p1-management']);subject=vacancesSubjects(track).find(s=>s.id==='droit');chapters=vacancesChapters(subject).slice(0,3)},120000)
const make=(extra={})=>createVacances({subject,track,selection:chapters.map(ch=>ch.id),startDate:'2026-12-20',id:'programme-1',now:10,...extra})
const answerAll=(p,phase,correct=true)=>{
 const qs=phase==='initial'?p.initialQuestions:phase==='final'?p.finalQuestions:p.sessions[phase].questions
 for(const q of qs)p=answerVacances(p,phase,q.id,correct?q.answer:(q.answer+1)%q.choices.length,100+Object.keys(phase==='initial'?p.initialAnswers:phase==='final'?p.finalAnswers:p.sessions[phase].answers).length)
 return p
}
it('propose une sélection réelle dans chacun des deux niveaux sans matière hors périmètre',()=>{
 for(const t of [track,{level:'premiere-stmg'}]){expect(vacancesSubjects(t)).toHaveLength(3);for(const s of vacancesSubjects(t))expect(vacancesChapters(s).length).toBeGreaterThan(0)}
})
it('les deux bilans et le travail sont disjoints et exclusivement liés aux chapitres choisis',()=>{
 const p=make(),a=new Set(p.initialQuestions.map(q=>q.q)),b=new Set(p.finalQuestions.map(q=>q.q)),practice=new Set(p.practice.map(q=>q.q))
 expect(a.size).toBe(6);expect(b.size).toBe(6)
 for(const q of [...p.initialQuestions,...p.finalQuestions,...p.practice])expect(p.chapters.map(c=>c.id)).toContain(q.chapterId)
 for(const q of a){expect(b.has(q)).toBe(false);expect(practice.has(q)).toBe(false)}
 for(const q of b)expect(practice.has(q)).toBe(false)
 for(const ch of chapters){const demo=ch.questions[0].q;expect(a.has(demo)).toBe(false);expect(b.has(demo)).toBe(false)}
 expect(p.sessions.map(s=>s.date)).toEqual(['2026-12-20','2026-12-22','2026-12-24','2026-12-26','2026-12-27','2026-12-29','2026-12-31','2027-01-02'])
 expect(make({rhythm:3}).sessions).toHaveLength(6)
})
it('refuse les sélections invalides et les dates impossibles',()=>{
 for(const x of [{selection:[]},{selection:['bad']},{selection:[...chapters.map(c=>c.id),'bad']},{minutes:1},{rhythm:20},{startDate:'2026-02-31'},{subject:{...subject,id:'philosophie'}}])expect(()=>make(x)).toThrow()
})
it('ne crée aucun résultat ni séance avant le test et conserve les réponses après rechargement',()=>{
 let p=make();expect(vacancesScore(p.initialQuestions,p.initialAnswers)).toBeNull();expect(prepareVacancesSession(p,0)).toBe(p)
 p=answerAll(p,'initial');expect(vacancesScore(p.initialQuestions,p.initialAnswers)).toBe(100)
 p=prepareVacancesSession(p,0,200);expect(p.sessions[0].questions).toHaveLength(3)
 const q=p.sessions[0].questions[0];p=answerVacances(p,0,q.id,q.answer,300)
 const reloaded=JSON.parse(JSON.stringify(p));expect(prepareVacancesSession(reloaded,0).sessions[0]).toEqual(p.sessions[0]);expect(answerVacances(p,0,q.id,(q.answer+1)%q.choices.length)).toBe(p)
 expect(prepareVacancesSession(p,1)).toBe(p);expect(answerVacances(p,'final',p.finalQuestions[0].id,0)).toBe(p)
})
it('adapte la séance aux difficultés, évite les doublons et utilise les questions non vues en priorité',()=>{
 let p=make()
 for(const q of p.initialQuestions)p=answerVacances(p,'initial',q.id,q.chapterId===chapters[0].id?(q.answer+1)%q.choices.length:q.answer,40)
 p=prepareVacancesSession(p,0,60)
 expect(p.sessions[0].questions.filter(q=>q.chapterId===chapters[0].id)).toHaveLength(2)
 const ids=new Set(p.sessions[0].questions.map(q=>q.id));expect(ids.size).toBe(3)
 p=answerAll(p,0);p=prepareVacancesSession(p,1,1000)
 expect(p.sessions[1].questions.some(q=>ids.has(q.id))).toBe(false)
})
it('termine le parcours et partage seulement des bilans agrégés avec consentement',()=>{
 let p=answerAll(make(),'initial',false)
 for(let i=0;i<p.sessions.length;i++){p=prepareVacancesSession(p,i,500+i);p=answerAll(p,i);expect(vacancesSessionDone(p.sessions[i])).toBe(true)}
 const seen=new Map();for(const s of p.sessions)for(const q of s.questions)seen.set(q.id,(seen.get(q.id)||0)+1)
 expect(Math.max(...seen.values())).toBeLessThanOrEqual(2)
 p=answerAll(p,'final');expect(vacancesSummary(p,track)).toMatchObject({done:8,total:8,initial:0,final:100})
 expect(vacancesSummary(p,{level:'premiere-stmg'})).toBeNull()
 const state={track,parentShare:false,parcours:{vacances:p},chapters:{},themeTime:{}}
 expect(buildChildSnapshot(state,{}).subjects.some(s=>s.vacances)).toBe(false)
 const snap=buildChildSnapshot({...state,parentShare:true},{})
 expect(snap.subjects.find(s=>s.vacances).vacances).toEqual(vacancesSummary(p,track));expect(JSON.stringify(snap)).not.toContain('initialQuestions')
})
it('fusionne les réponses entre appareils et garde le parcours lors de modifications des objectifs',()=>{
 const p=make(),[q,r]=p.initialQuestions
 const a=answerVacances(p,'initial',q.id,q.answer,100),b=answerVacances(p,'initial',r.id,r.answer,110)
 expect(Object.keys(mergeVacances(a,b).initialAnswers)).toHaveLength(2)
 const merged=mergeProgress({parcours:{maj:100,vacances:a}},{parcours:{maj:200,objectifs:{noteVisee:14},vacances:b}})
 expect(Object.keys(merged.parcours.vacances.initialAnswers)).toHaveLength(2);expect(merged.parcours.objectifs.noteVisee).toBe(14)
 expect(chargeUtile({parcours:merged.parcours}).parcours).toEqual(merged.parcours)
 expect(mergeVacances(a,make({id:'nouveau',now:500})).id).toBe('nouveau')
})
it('limite le résumé parental aux chiffres agrégés et ignore les données incohérentes',()=>{
 expect(cleanVacancesSummary({total:8,done:2,initial:50,final:null,date:'2026-12-20',answers:'private'})).toEqual({total:8,done:2,initial:50,final:null,date:'2026-12-20'})
 expect(cleanVacancesSummary({total:8,done:99})).toBeUndefined();expect(cleanVacancesSummary({total:8,done:0,initial:500}).initial).toBeNull()
})
it('contient tous les libellés dans les six langues hors ligne',()=>{
 for(const [lang,values] of Object.entries(vacancesMessages)){expect(Object.keys(values)).toEqual(Object.keys(vacancesMessages.fr));for(const v of Object.values(values))expect(typeof v,lang).toBe('string')}
})
