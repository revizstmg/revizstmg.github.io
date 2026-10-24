import {test,expect} from 'vitest'
import {mergeMissions,updateMission,missionStatus,missionKey} from '../src/data/missionProgress.js'
import {mergeProgress,chargeUtile} from '../src/progression.js'
import {restoreAccountState} from '../src/store.jsx'
import {chapterMission,nextMissionTarget,missionSubjects,bossResult} from '../src/data/missions.js'
import {chargerTout,chapitreDuJeu} from '../src/data/index.js'
import {missionMessages} from '../src/i18n/missions.js'
const track={level:'terminale-stmg',specialty:'gestion-finance'}
const mark=(missions,stage,pct=100,day='2026-10-24',assisted=false,now=1)=>updateMission(missions,{themeId:'gf-t1',index:0,stage,pct,day,assisted,now})

test('une baisse, une fusion ou un doublon ne retirent pas une compétence validée',()=>{
 const a=mark({},'understand',100)
 const b=mark(mark({},'understand',60,'2026-10-25',true,2),'apply',80)
 for(const data of [mergeMissions(a,b),mergeMissions(b,a)]){
  expect(missionStatus(data,'gf-t1',0).completed).toBe(2)
  expect(data[missionKey('gf-t1',0,'understand')].best).toBe(100)
 }
 expect(mergeMissions(a,a)).toEqual(a)
 expect(mark(a,'understand',0,'2026-10-25',true,3)[missionKey('gf-t1',0,'understand')].autonomousBest).toBe(100)
})
test('la maîtrise demande une réussite autonome réellement espacée et ne se gagne pas par répétition immédiate',()=>{
 let s=mark(mark({},'understand'),'apply')
 s=mark(s,'boss',100,'2026-10-24',true)
 expect(missionStatus(s,'gf-t1',0).medal).toBe('completed')
 s=mark(s,'boss',100)
 expect(missionStatus(s,'gf-t1',0).medal).toBe('autonomous')
 for(let n=0;n<20;n++)s=mark(s,'boss',100)
 expect(missionStatus(s,'gf-t1',0).stages[2].successDays).toEqual(['2026-10-24'])
 s=mark(s,'boss',100,'2026-10-25')
 expect(missionStatus(s,'gf-t1',0).medal).toBe('autonomous')
 s=mark(s,'boss',100,'2026-10-26')
 expect(missionStatus(s,'gf-t1',0).medal).toBe('durable')
 expect(mark(s,'boss',100,'date invalide')).toEqual(s)
})
test('les missions suivent la sauvegarde et restent isolées entre comptes',()=>{
 const missions=mark({},'understand')
 const a={missions,xp:0},b={missions:mark({},'apply'),xp:0}
 expect(chargeUtile(a).missions).toEqual(missions)
 expect(missionStatus(mergeProgress(a,b).missions,'gf-t1',0).completed).toBe(2)
 const restored=restoreAccountState({account:{id:'a'},missions,profile:{},chapters:{},track}, {id:'b',name:'B',level:'terminale-stmg',progress:{missions:{}}},{user:{id:'b',email:'b@test.fr'}})
 expect(restored.missions).toEqual({})
})
test('les dates anciennes restent disponibles après de nombreuses révisions',()=>{
 let s=mark(mark({},'understand'),'apply')
 for(let n=1;n<=20;n++)s=mark(s,'boss',100,'2026-10-'+String(n).padStart(2,'0'))
 const row=missionStatus(s,'gf-t1',0).stages[2]
 expect(row.successDays.length).toBeLessThanOrEqual(6)
 expect(row.successDays[0]).toBe('2026-10-01')
 expect(missionStatus(s,'gf-t1',0).medal).toBe('durable')
})
test('le défi final nécessite ses deux manches et ne compense pas une manche ratée',()=>{
 expect(bossResult([{pct:100,correct:3,total:3}])).toBeNull()
 expect(bossResult([{pct:100,correct:3,total:3},{pct:67,correct:2,total:3,assisted:true}])).toMatchObject({pct:83,assisted:true})
 expect(bossResult([{pct:100,correct:10,total:10},{pct:0,correct:0,total:1}]).pct).toBeLessThan(80)
})
test('la cible reste dans le programme, exclut les langues PDF et reprend une mission commencée',()=>{
 for(const t of [track,{level:'premiere-stmg'}]){
  const next=nextMissionTarget({track:t,missions:{}})
  expect(missionSubjects(t).some(s=>s.id===next.subjectId)).toBe(true)
  expect(next.subjectId).not.toMatch(/langues/)
 }
 const missions=mark({},'understand',20)
 expect(nextMissionTarget({track,missions},{themeId:'eco-t6',chapterIndex:0})).toMatchObject({themeId:'gf-t1',index:0})
 expect(nextMissionTarget({track:null,missions:{}})).toBeNull()
})
test('reconnaissance, application et défi réutilisent exclusivement les exercices de la section choisie',async()=>{
 await chargerTout()
 let checked=0
 for(const t of [track,{level:'premiere-stmg'}]){
  for(const subject of missionSubjects(t)){
   for(const theme of subject.chapters.slice(0,2)){
    const plan=chapterMission(theme.id,0)
    if(!plan?.rounds.length)continue
    for(const game of [...Object.values(plan.practice),...plan.rounds]){
     expect(plan.games.some(g=>g.id===game.id)).toBe(true)
     expect(chapitreDuJeu(theme.id,game.id)).toBe(0)
     expect(game.type).not.toBe('flashcard')
    }
    checked++
   }
  }
 }
 expect(checked).toBeGreaterThan(15)
})
test('les six langues traduisent toutes les missions avec les mêmes variables',()=>{
 const keys=Object.keys(missionMessages.fr).sort(),vars=s=>(s.match(/\{\w+\}/g)||[]).sort()
 for(const m of Object.values(missionMessages)){
  expect(Object.keys(m).sort()).toEqual(keys)
  for(const key of keys){
   expect(m[key],key).toBeTruthy()
   expect(vars(m[key]),key).toEqual(vars(missionMessages.fr[key]))
  }
 }
})
