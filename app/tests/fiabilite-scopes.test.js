import {it,expect,vi,afterEach} from 'vitest'
import {scoresEnAttente,garderScore} from '../src/data/duelScores.js'
import {workshopFilters,saveWorkshop,readWorkshop} from '../src/data/workshopSession.js'
function storage(){const map=new Map();vi.stubGlobal('localStorage',{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)});return map}
afterEach(()=>vi.unstubAllGlobals())
it('duels : le score global sans propriétaire ne migre ni vers A ni vers B',()=>{
 storage();localStorage.setItem('stmg_duel_scores_attente',JSON.stringify({duel:{points:777,correct:9}}))
 expect(scoresEnAttente('A')).toEqual({});expect(scoresEnAttente('B')).toEqual({})
 garderScore('A','duel',{points:80,correct:1});expect(scoresEnAttente('A').duel.points).toBe(80);expect(scoresEnAttente('B')).toEqual({})
 garderScore('B','duel',{points:20,correct:0});garderScore('A','duel',null)
 expect(scoresEnAttente('A')).toEqual({});expect(scoresEnAttente('B').duel.points).toBe(20)
 expect(JSON.parse(localStorage.getItem('stmg_duel_scores_attente')).duel.points).toBe(777)
})
it('duels : corruption et scores invalides ignorés sans écrire sur une identité absente',()=>{
 const map=storage();map.set('stmg_duel_scores_attente:A','{corrompu');expect(scoresEnAttente('A')).toEqual({})
 expect(garderScore(null,'duel',{points:1,correct:0})).toBe(false);expect(garderScore('A','duel',{points:NaN,correct:0})).toBe(false)
})
it('atelier : programme et niveau conservés ; ancienne sélection hors classe récupérée',()=>{
 storage();const track={level:'premiere-stmg'}
 saveWorkshop('A',{selected:['f14'],repeat:2,session:null,programme:'all',level:'terminale'})
 expect(workshopFilters(readWorkshop('A'),track)).toEqual({programme:'all',level:'terminale'})
 expect(workshopFilters({selected:['f14']},track)).toEqual({programme:'all',level:'all'})
 expect(workshopFilters(null,track)).toEqual({programme:'track',level:'all'})
 expect(workshopFilters({selected:[],programme:'invalide',level:'invalide'},track)).toEqual({programme:'track',level:'all'})
})
