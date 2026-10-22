// Historique de tirage local à l’onglet, distinct des résultats de l’élève.
// Une identité de compte ET un identifiant d’exercice isolent les tirages.
const memory = new Map()
const normalize = s => String(s || '').normalize('NFKC').toLocaleLowerCase('fr').replace(/\s+/g,' ').trim()
export const questionKey = q => normalize((q.text || q.prompt || q.q || '')+'|'+(typeof q.answer==='number' ? q.choices?.[q.answer] : q.answer))
const sourceKey = q => normalize(q.drawSource || q.sourceKey || q.text || q.prompt || q.q)
const shuffled = list => {
 const result=[...list]
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 return result
}
export function selectQuestionSession(questions,count,previous={}) {
 const seen=Array.isArray(previous?.seen)?previous.seen:[], sources=Array.isArray(previous?.sources)?previous.sources:[]
 const rank=(key,history)=>history.lastIndexOf(key)+1
 const unique=[...new Map(questions.map(q=>[questionKey(q),q])).values()]
 const ordered=shuffled(unique).sort((a,b)=>rank(sourceKey(a),sources)-rank(sourceKey(b),sources)||rank(questionKey(a),seen)-rank(questionKey(b),seen))
 const groups=new Set(),selected=[]
 for(const q of ordered) {
  const source=sourceKey(q)
  if(groups.has(source))continue
  groups.add(source);selected.push(q)
  if(selected.length>=Math.max(1,count))break
 }
 const result=shuffled(selected)
 // Même avec une toute petite banque, ne pas redémarrer sur la même question
 // si une autre est disponible. On ne prétend pas inventer de nouvelles notions.
 if(result.length>1 && questionKey(result[0])===previous.first) [result[0],result[1]]=[result[1],result[0]]
 return {questions:result,history:{first:result[0]?questionKey(result[0]):null,seen:[...seen,...result.map(questionKey)].slice(-512),sources:[...sources,...result.map(sourceKey)].slice(-512)}}
}
export function drawQuestionSession(game,accountId) {
 if(!game.questionCount || !game.questions?.length)return game
 const key=`stmg_question_draw_v1:${accountId || 'trial'}:${game.id}`
 let previous=memory.get(key) || {}
 try { previous=JSON.parse(sessionStorage.getItem(key)) || previous } catch { /* stockage indisponible */ }
 const result=selectQuestionSession(game.questions,game.questionCount,previous)
 return {...game,questions:result.questions,drawKey:key,drawHistory:result.history}
}
export function rememberQuestionSession(game) {
 const key=game.drawKey
 if(!key || !game.drawHistory)return
 memory.delete(key);memory.set(key,game.drawHistory)
 if(memory.size>100)memory.delete(memory.keys().next().value)
 try {
  sessionStorage.setItem(key,JSON.stringify(game.drawHistory))
  const keys=Object.keys(sessionStorage).filter(k=>k.startsWith('stmg_question_draw_v1:'))
  for(const k of keys.slice(0,Math.max(0,keys.length-100)))sessionStorage.removeItem(k)
 } catch { /* l’exercice reste utilisable sans stockage */ }
}
