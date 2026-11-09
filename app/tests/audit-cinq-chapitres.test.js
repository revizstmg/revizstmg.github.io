import {test,expect,beforeAll} from 'vitest'
import {chargerTout,ALL_CHAPTERS,themeChapters} from '../src/data/index.js'
beforeAll(()=>chargerTout())
for(const [id,index,answers]of [
 ['gf-t3',5,['MCV','rentabilité','jours']],
 ['mkg-t1',1,['hédoniste','oblatif','motivation','satisfaction']],
 ['rh-t2',2,['organisation','médiation','arbitrage','constructif']],
 ['sig-t1',0,['stocker','PGI','collecter','traiter']],
])test(id+' : chaque question manuelle porte sur les notions du chapitre explicite',()=>{
 const chapters=themeChapters(ALL_CHAPTERS[id]);const positions=chapters.filter(ch=>ch.games.some(g=>g.id===id+'-trou'));expect(positions.map(ch=>ch.idx)).toEqual([index])
 const game=positions[0].games.find(g=>g.id===id+'-trou');expect(game.questions.map(q=>q.answer)).toEqual(answers)
 const course=JSON.stringify(positions[0].section).toLowerCase();for(const answer of answers)expect(course).toContain(answer.toLowerCase())
})
