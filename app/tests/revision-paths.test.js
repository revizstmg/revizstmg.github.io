import {beforeAll, test,expect,vi,afterEach} from 'vitest'
import {ALL_CHAPTERS,SUBJECTS,chargerTout,themeChapters,jeuxDuChapitre} from '../src/data/index.js'
import {acquiredQuestions,errorSteps,resumeInSubject,updateSuccesses} from '../src/data/revisionPaths.js'
import {readPosition,savePosition} from '../src/data/readingPosition.js'
import {mergeProgress,chargeUtile} from '../src/progression.js'
beforeAll(()=>chargerTout())
afterEach(()=>vi.unstubAllGlobals())
const subject=()=>SUBJECTS.find(s=>s.id==='maths')
const q=(text,themeId)=>({q:text,choices:['Juste','Faux'],answer:0,explain:'Explication',themeId})
test('les acquis mélangent uniquement les bonnes réponses de la matière et du chapitre choisis',()=>{
 const good=[['A','math-c1'],['B','math-c2'],['Droit','droit-t5']].map(([text,tid])=>q(text,tid))
 const reussites=updateSuccesses([],{type:'qcm',reussies:good},10)
 const state={chapters:{},reussites,erreurs:[]}
 expect(new Set(acquiredQuestions(state,subject()).map(x=>x.themeId))).toEqual(new Set(['math-c1','math-c2']))
 expect(acquiredQuestions(state,subject(),'math-c2').map(x=>x.q)).toEqual(['B'])
 const blocked={...state,erreurs:[{themeId:'math-c1',type:'qcm',q:good[0]}]}
 expect(acquiredQuestions(blocked,subject()).map(x=>x.q)).toEqual(['B'])
 expect(acquiredQuestions(state,subject(),'droit-t5')).toEqual([])
})
test('aucune réussite inventée à partir d’un ancien score partiel',()=>{
 const theme=ALL_CHAPTERS['math-c1'], game=themeChapters(theme).flatMap(ch=>ch.games).find(g=>g.type==='qcm')
 expect(game).toBeTruthy()
 expect(acquiredQuestions({chapters:{'math-c1':{games:{[game.id]:80}}}},subject())).toEqual([])
 expect(acquiredQuestions({chapters:{'math-c1':{games:{[game.id]:100}}}},subject()).length).toBeGreaterThan(0)
})
test('les erreurs gardent leur type et leur thème, sans exclure les erreurs non encore dues',()=>{
 const errors=[{themeId:'math-c1',type:'trou',q:{text:'Un ____',answer:'mot'},due:'2099-01-01'},{themeId:'math-c2',type:'qcm',q:q('B')},{themeId:'droit-t5',type:'qcm',q:q('Hors matière')}]
 const steps=errorSteps({erreurs:errors},subject(),'math-c1')
 expect(steps).toHaveLength(1);expect(steps[0].game.type).toBe('trou');expect(steps[0].game.questions).toEqual([errors[0].q])
 expect(errorSteps({erreurs:[]},subject())).toEqual([])
})
test('suivre le fil reste dans la matière et saute les exercices déjà réussis',()=>{
 const s=subject(),first=resumeInSubject({chapters:{}},s,'math-c2')
 expect(first.themeId).toBe('math-c2')
 const next=resumeInSubject({chapters:{'math-c2':{games:{[first.game.id]:100}}}},s,'math-c2')
 expect(next.themeId).toBe('math-c2');expect(next.game.id).not.toBe(first.game.id)
 const done={}
 for(const t of s.chapters) done[t.id]={games:Object.fromEntries(themeChapters(ALL_CHAPTERS[t.id]).flatMap(ch=>jeuxDuChapitre(ch,ALL_CHAPTERS[t.id])).map(g=>[g.id,100]))}
 expect(resumeInSubject({chapters:done},s)).toBeNull()
})
test('chaque matière garde sa position, sans fuite entre comptes et sans casser l’ancien repère',()=>{
 const cache=new Map();vi.stubGlobal('localStorage',{getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)})
 savePosition('a',{subjectId:'maths',themeId:'math-c2',chapterIndex:1,page:2})
 savePosition('a',{subjectId:'droit',themeId:'droit-t5',chapterIndex:2,page:3})
 expect(readPosition('a','maths')).toMatchObject({themeId:'math-c2',page:2})
 expect(readPosition('a')).toMatchObject({themeId:'droit-t5',page:3})
 expect(readPosition('b','maths')).toBeNull()
})
test('les bonnes réponses sont dédupliquées et font partie de la progression sauvegardée',()=>{
 const r={themeId:'math-c1',type:'qcm',reussies:[q('A')]}
 const first=updateSuccesses([],r,10), updated=updateSuccesses(first,r,20)
 expect(updated).toHaveLength(1);expect(updated[0].at).toBe(20)
 expect(chargeUtile({reussites:updated}).reussites).toEqual(updated)
 expect(mergeProgress({reussites:first},{reussites:updated}).reussites).toEqual(updated)
})
test('un chapitre précis filtre aussi la section du cours, pas seulement le thème',()=>{
 const qs=[{...q('Section un','math-c1'),chapterIndex:0},{...q('Section deux','math-c1'),chapterIndex:1}]
 const reussites=updateSuccesses([],{type:'qcm',reussies:qs})
 expect(acquiredQuestions({reussites},subject(),'math-c1::1').map(q=>q.q)).toEqual(['Section deux'])
 expect(errorSteps({erreurs:qs.map(q=>({themeId:q.themeId,type:'qcm',q}))},subject(),'math-c1::0')[0].game.questions).toEqual([qs[0]])
 expect(resumeInSubject({chapters:{}},subject(),'math-c1::1').chapterIndex).toBe(1)
})
