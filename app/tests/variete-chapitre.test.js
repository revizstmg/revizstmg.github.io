import {test,expect} from 'vitest'
import {themeChapters} from '../src/data/index.js'
import {avecGraine} from './outils.js'
const cours=()=>[...Array.from({length:24},(_,i)=>({t:'p',c:`Le **concept ${i}** sert à analyser cette situation précise du cours et ses conséquences pour les acteurs.`})),{t:'table',h:'Notions et définitions',head:['Notion','Définition'],rows:Array.from({length:20},(_,i)=>[`concept ${i}`,`Description propre au concept ${i} avec ses caractéristiques distinctives.`])}]
const chapter=blocks=>avecGraine('variete',()=>themeChapters({id:'variete-test',subjectId:'management',cours:[{h:'Mon chapitre',blocks}],games:[]})[0])
test('une phrase ne figure pas dans plusieurs exercices à trous/QCM/saisie du chapitre',()=>{
 const ch=chapter(cours()),owners=new Map()
 const gaps=ch.games.filter(g=>/::(?:trou\d|strou|qtrou)$/.test(g.id))
 expect(gaps.some(g=>g.type==='trou')).toBe(true)
 expect(gaps.some(g=>g.type==='saisie')).toBe(true)
 expect(gaps.some(g=>g.type==='qcm')).toBe(true)
 for(const game of gaps)for(const q of game.questions){
  expect(q.drawSource).toBeTruthy()
  expect(!owners.has(q.drawSource)||owners.get(q.drawSource)===game.id).toBe(true)
  owners.set(q.drawSource,game.id)
 }
 expect(owners.size).toBe(24)
 expect(ch.games.some(g=>g.id.endsWith('::mix'))).toBe(false)
})
test('les QCM notion→définition et définition→notion portent sur des notions distinctes',()=>{
 const games=chapter(cours()).games
 const forward=games.filter(g=>/::qdef/.test(g.id)).flatMap(g=>g.questions)
 const reverse=games.filter(g=>/::qcas/.test(g.id)).flatMap(g=>g.questions)
 expect(forward.length).toBeGreaterThan(0);expect(reverse.length).toBeGreaterThan(0)
 for(const q of reverse)expect(forward.some(f=>f.q.includes(`« ${q.choices[q.answer]} »`))).toBe(false)
})
test('les autres mots en gras d’une phrase offrent de vraies variantes sans couper le contexte',()=>{
 const games=chapter([{t:'p',c:'Le **principe alpha** décrit un **mécanisme beta** dont les effets sont expliqués dans cette phrase entière.'},{t:'p',c:'Le **principe gamma** correspond à une autre propriété précise et clairement expliquée dans ce chapitre.'}]).games
 const bank=games.filter(g=>g.type==='trou').flatMap(g=>g.questions)
 expect(bank.map(q=>q.answer)).toContain('mécanisme beta')
 expect(bank.find(q=>q.answer==='mécanisme beta').text).toBe('Le principe alpha décrit un ____ dont les effets sont expliqués dans cette phrase entière.')
 expect(bank.find(q=>q.answer==='principe alpha').drawSource).toBe(bank.find(q=>q.answer==='mécanisme beta').drawSource)
})
test('un chapitre court ne multiplie pas les trois formats du même lot',()=>{
 const games=chapter(cours().slice(0,3)).games
 const gaps=games.filter(g=>/::(?:trou\d|strou|qtrou)$/.test(g.id))
 expect(gaps).toHaveLength(1)
 expect(gaps[0].questions).toHaveLength(3)
 expect(gaps[0].questionCount).toBeLessThan(3)
})
