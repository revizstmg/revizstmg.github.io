import { FORMULA_PRACTICE } from './formulaPractice.js'
const key = scope => `stmg_formula_session_v1:${scope}`
export function readWorkshop(scope) {
  try {
    const data = JSON.parse(localStorage.getItem(key(scope)))
    if (data?.version !== 1 || !Array.isArray(data.selected) || ![1,2,3,5].includes(data.repeat)) return null
    if (data.session !== null && (!Array.isArray(data.session) || !data.session.length || data.session.length > 200)) return null
    if (data.session && (!Number.isInteger(data.index) || data.index < 0 || data.index >= data.session.length)) return null
    const byId = new Map(FORMULA_PRACTICE.map(f => [f.id, f]))
    const session = data.session?.map(q => {
      const formula = byId.get(q.formula?.id)
      if (!formula || !Number.isFinite(q.answer) || typeof q.calculation !== 'string' || !q.values || formula.inputs.some(p => !Number.isFinite(q.values[p.symbol]))) throw new Error('séance invalide')
      return {...q, formula}
    }) || null
    const results = Array.isArray(data.results) ? data.results.filter(r => r && typeof r.correct === 'boolean' && byId.has(r.formulaId)) : []
    return {...data, session, results, selected: data.selected.filter(id => byId.has(id))}
  } catch { return null }
}
export function saveWorkshop(scope, data) {
  try { localStorage.setItem(key(scope), JSON.stringify({...data, version:1})); return true } catch { return false }
}
export function clearWorkshop(scope) { try { localStorage.removeItem(key(scope)) } catch { /* stockage indisponible */ } }
export function formulaCourse(formula, track) {
  const premiere = track.level === 'premiere-stmg', n = Number(formula.id.slice(1))
  let sid, tid
  if (formula.cat === 'Mathématiques') {
    sid = premiere ? 'p1-maths' : 'maths'
    tid = n <= 8 ? (premiere ? 'p1-math-c1' : 'math-c1') : n <= 10 ? (premiere ? 'p1-math-c2' : 'math-c2') : n <= 12 ? (premiere ? 'p1-math-c5' : 'math-c4') : n === 13 ? 'math-c5' : 'math-c6'
  } else if (formula.cat === 'Gestion & Finance') { sid='gestion-finance';tid=n<=20?'gf-t1':n<=23?'gf-t2':'gf-t3' }
  else if (formula.cat === 'Management') { sid=premiere?'p1-sgn':'management';tid=premiere?null:'mgmt-t1' }
  else if (formula.cat === 'Économie') { sid=n<=32?'p1-economie':'economie';tid=n<=32?'p1-eco-t3':n===33?'eco-t7':'eco-t8' }
  else if (formula.cat === 'Mercatique') { sid='mercatique';tid=n===36?'mkg-t3':'mkg-t4' }
  else { sid='rh-communication';tid='rh-t4' }
  return tid ? `/subject/${sid}/theme/${tid}` : `/subject/${sid}`
}
