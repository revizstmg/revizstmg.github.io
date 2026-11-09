import {it,expect} from 'vitest'
import {DOMAINES,ETAPES,TOTAL,nettoyerReponses,bilanAvenir,conseilsContexte} from '../src/data/avenir.js'
import {mergeProgress} from '../src/progression.js'
import {estPagePayante,estPageUltimate} from '../src/data/acces.js'
it('56 questions uniques réparties dans huit domaines et le contexte',()=>{
 const ids=ETAPES.flatMap(e=>e.questions.map(q=>q.id));expect(TOTAL).toBe(56);expect(new Set(ids).size).toBe(TOTAL);expect(DOMAINES).toHaveLength(8)
 for(const d of DOMAINES){expect(d.questions).toHaveLength(6);expect(d.formations.length).toBeGreaterThan(0)}
})
it('nettoyage : zéro et inconnue valides, réponses invalides exclues',()=>{
 expect(nettoyerReponses({'finance-0':0,'finance-1':'?','finance-2':8,'finance-3':null,duree:1,cout:10,secret:'texte'})).toEqual({'finance-0':0,'finance-1':'?',duree:1});expect(nettoyerReponses(null)).toEqual({})
})
it('aucune piste privilégiée avec des réponses inconnues ou toutes négatives',()=>{
 for(const value of ['?',0])expect(bilanAvenir(Object.fromEntries(DOMAINES.flatMap(d=>d.questions.map(q=>[q.id,value])))).filter(d=>d.explorable)).toHaveLength(0)
})
it('intérêt expliqué, sans filtrer selon les contraintes ou un niveau scolaire déclaré',()=>{
 const a=Object.fromEntries(DOMAINES.flatMap(d=>d.questions.map(q=>[q.id,d.id==='finance'?4:0])))
 const d=bilanAvenir({...a,mobilite:0,maths:2})[0];expect(d.id).toBe('finance');expect(d.positifs).toHaveLength(6);expect(d.explorable).toBe(true)
 expect(bilanAvenir({'finance-0':4,'finance-1':4})[0].explorable).toBe(false);expect(conseilsContexte({maths:2,mobilite:0}).join(' ')).toMatch(/pas une exclusion/)
})
it('fusion indépendante du dossier Avenir, effacement conservé, révisions préservées',()=>{
 const a={parcours:{maj:50,objectifs:{noteVisee:15},avenir:{maj:40,answers:{'finance-0':4}}}},b={parcours:{maj:100,avenir:{maj:30,answers:{'finance-0':0}}}}
 for(const [x,y] of [[a,b],[b,a]])expect(mergeProgress(x,y).parcours.avenir.answers).toEqual({'finance-0':4})
 const cleared={parcours:{maj:110,avenir:{maj:110,answers:{},step:0,finished:false}}}
 expect(mergeProgress(a,cleared).parcours.avenir.answers).toEqual({});expect(mergeProgress(a,cleared).parcours.objectifs).toEqual({noteVisee:15})
})
it('orientation accessible, parcours de révision toujours Ultimate',()=>{
 expect(estPagePayante('/parcours-avenir')).toBe(false);expect(estPageUltimate('/parcours-avenir')).toBe(false);expect(estPageUltimate('/parcours')).toBe(true)
})
