import { FORMULA_PRACTICE } from './formulaPractice.js'
const key = scope => `stmg_formula_session_v1:${scope}`
export function readWorkshop(scope) {
  try {
    const data = JSON.parse(localStorage.getItem(key(scope)))
    if (data?.version !== 1 || !Array.isArray(data.selected) || ![1,2,3,5].includes(data.repeat)) return null
    if (data.session !== null && (!Array.isArray(data.session) || !data.session.length || data.session.length > FORMULA_PRACTICE.length * 5)) return null
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
const courseSubjects = {
  'p1-math-':'p1-maths', 'math-':'maths', 'p1-eco-':'p1-economie',
  'eco-':'economie', 'p1-sgn-':'p1-sgn', 'gf-':'gestion-finance',
  'mgmt-':'management', 'mkg-':'mercatique', 'rh-':'rh-communication', 'sig-':'sig',
}
export function formulaCourse(formula, track) {
  const theme = track.level === 'premiere-stmg' && !formula.terminale ? formula.coursePremiere : formula.course
  const subject = Object.entries(courseSubjects).find(([prefix])=>theme?.startsWith(prefix))?.[1]
  return subject ? `/subject/${subject}/theme/${theme}` : '/cours'
}
