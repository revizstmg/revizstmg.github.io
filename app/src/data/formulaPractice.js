import ATELIER from '../../content/commun/atelier-formules.json'
export const FORMULA_PRACTICE = ATELIER
const categories = ['Mathématiques', 'Management', 'Économie']
const specialties = {'gestion-finance':'Gestion & Finance',mercatique:'Mercatique','rh-communication':'Ressources humaines'}
export function formulasForTrack(track, all = false) {
  if (!track) return []
  if (all) return FORMULA_PRACTICE
  const allowed = [...categories, ...(track.level === 'terminale-stmg' ? [specialties[track.specialty]] : [])]
  return FORMULA_PRACTICE.filter(f => allowed.includes(f.cat) && (!f.terminale || track.level === 'terminale-stmg'))
}
export const displayNumber = (value, decimals = 2) => value.toLocaleString('fr-FR',{maximumFractionDigits:decimals})
function evaluate(node, values) {
  if (typeof node === 'number') return node
  if (typeof node === 'string') return values[node]
  const [op,left,right]=node
  const a=evaluate(left,values)
  if(op==='sqrt') return Math.sqrt(a)
  if(op==='binom' || op==='tail') {
    const p=evaluate(right,values), k=evaluate(node[3],values)
    const mass=j=>{
      let coefficient=1
      for(let i=1;i<=j;i++) coefficient*= (a-i+1)/i
      return coefficient*p**j*(1-p)**(a-j)
    }
    if(op==='binom') return mass(k)
    let total=0
    for(let j=k;j<=a;j++) total+=mass(j)
    return total
  }
  const b=evaluate(right,values)
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
  if(node[0]==='sqrt') return `√(${calculation(node[1],values)})`
  if(node[0]==='binom' || node[0]==='tail') return `X ~ B(${calculation(node[1],values)} ; ${calculation(node[2],values)}), P(X ${node[0]==='binom'?'=':'≥'} ${calculation(node[3],values)})`
  const signs={'+':'+','-':'−','*':'×','/':'÷',pow:'^'}
  return `(${calculation(node[1],values)} ${signs[node[0]]} ${calculation(node[2],values)})`
}
export function generateFormulaExercise(formula, random=Math.random) {
  const values=Object.fromEntries(formula.inputs.map(p=>[p.symbol,Number((p.min+Math.min(Math.floor(random()*(Math.round((p.max-p.min)/p.step)+1)),Math.round((p.max-p.min)/p.step))*p.step).toFixed(10))]))
  const precision=10**(formula.decimals || 2)
  const answer=Math.round((evaluate(formula.expression,values)+Number.EPSILON)*precision)/precision
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
export function checkFormulaAnswer(input,answer,decimals=2) {
  const cleaned=String(input).trim().replace(/[\s\u00a0\u202f]/g,'').replace('−','-').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0)).replace(/٬/g,'').replace('٫','.').replace(',','.')
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned) || !Number.isFinite(Number(cleaned))) return null
  return Math.abs(Number(cleaned)-answer)<0.5*10**(-decimals)
}
