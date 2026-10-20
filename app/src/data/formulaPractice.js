import { commun } from '../content/contenu.js'
export const FORMULA_PRACTICE = commun('atelier-formules')
const categories = ['Mathématiques', 'Management', 'Économie']
const specialties = {'gestion-finance':'Gestion & Finance',mercatique:'Mercatique','rh-communication':'Ressources humaines'}
export function formulasForTrack(track) {
  if (!track) return []
  const allowed = [...categories, ...(track.level === 'terminale-stmg' ? [specialties[track.specialty]] : [])]
  return FORMULA_PRACTICE.filter(f => allowed.includes(f.cat) && (!f.terminale || track.level === 'terminale-stmg'))
}
export const displayNumber = value => value.toLocaleString('fr-FR',{maximumFractionDigits:2})
function evaluate(node, values) {
  if (typeof node === 'number') return node
  if (typeof node === 'string') return values[node]
  const [op,left,right]=node, a=evaluate(left,values),b=evaluate(right,values)
  if(op==='+') return a+b
  if(op==='-') return a-b
  if(op==='*') return a*b
  if(op==='/') return a/b
  if(op==='pow') return a**b
  throw new Error('Opération inconnue')
}
function calculation(node,values) {
  if(typeof node==='number') return displayNumber(node)
  if(typeof node==='string') return displayNumber(values[node])
  const signs={'+':'+','-':'−','*':'×','/':'÷',pow:'^'}
  return `(${calculation(node[1],values)} ${signs[node[0]]} ${calculation(node[2],values)})`
}
export function generateFormulaExercise(formula, random=Math.random) {
  const values=Object.fromEntries(formula.inputs.map(p=>[p.symbol,p.min+Math.floor(random()*((p.max-p.min)/p.step+1))*p.step]))
  const answer=Math.round((evaluate(formula.expression,values)+Number.EPSILON)*100)/100
  return {formula,values,answer,calculation:calculation(formula.expression,values)}
}
export function buildFormulaSession(formulas,count,random=Math.random) {
  if(!formulas.length) return []
  const result=[]
  while(result.length<count) {
    const cycle=[...formulas]
    for(let i=cycle.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cycle[i],cycle[j]]=[cycle[j],cycle[i]]}
    for(const f of cycle){if(result.length===count) break;result.push(generateFormulaExercise(f,random))}
  }
  return result
}
export function checkFormulaAnswer(input,answer) {
  const cleaned=String(input).trim().replace(/[\s\u00a0\u202f]/g,'').replace('−','-').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0)).replace(/٬/g,'').replace('٫','.').replace(',','.')
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned) || !Number.isFinite(Number(cleaned))) return null
  return Math.abs(Number(cleaned)-answer)<0.005
}
