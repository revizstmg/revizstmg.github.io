import { checkGrade } from '../../../supabase/functions/examen-blanc/grading.js'
import { reserverIA, verifierIA } from './ia.js'
import { SUBJECTS, chargerTout, themeChapters } from './index.js'
import { SUPA_URL, SUPA_ANON } from '../supabase.js'
import { getSession, getValidToken } from '../auth.js'
import { checkExam, checkPlan, DURATIONS } from '../../../supabase/functions/examen-blanc/contract.js'
export { DURATIONS }
export async function examCatalog() {
  await chargerTout()
  return SUBJECTS.filter(s => !s.comingSoon).flatMap(s => (s.chapters || []).flatMap(theme => themeChapters(theme).map(ch => ({ id: ch.id, title: ch.title, subject: s.name, level: s.niveau === 'premiere' ? 'premiere' : 'terminale', subjectId: s.id, themeId: theme.id, idx: ch.idx, section: ch.section }))))
}
export function courseText(section) {
  if (section.blocks) return section.blocks.map(b => typeof b.c === 'string' ? b.c : Array.isArray(b.c) ? b.c.join('\n') : b.rows ? [b.head || [], ...b.rows].map(r => r.join(' · ')).join('\n') : '').filter(Boolean).join('\n\n')
  return [section.intro, ...(section.points || []), section.formula].filter(Boolean).join('\n\n')
}
export function toCourses(catalog, ids) {
  return ids.map(id => {
    const c = catalog.find(c => c.id === id)
    if (!c) throw new Error('invalid_response')
    return { id: c.id, title: c.title, subject: c.subject, level: c.level, text: courseText(c.section) }
  })
}
export async function examReady(signal) {
  const r = await fetch(`${SUPA_URL}/functions/v1/examen-blanc`, { headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}` }, signal })
  if (!r.ok) return false
  return (await r.json()).ready === true
}
export async function requestExam(body, accountId, signal) {
  const token = await getValidToken()
  if (!token || getSession()?.user?.id !== accountId) throw new Error('login_required')
  // Le plan ne doit pas être gaspillé si la génération qui le suit serait refusée (quota du mois atteint).
  if (body.action === 'plan') verifierIA('examen')
  // Seule la génération compte : le plan et la correction prolongent la même utilisation.
  const valider = reserverIA('examen', { suite: body.action === 'plan' || body.action === 'grade' })
  const r = await fetch(`${SUPA_URL}/functions/v1/examen-blanc`, { method: 'POST', headers: { apikey: SUPA_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || (r.status === 401 ? 'login_required' : 'server_error'))
  valider()
  if (getSession()?.user?.id !== accountId) throw new Error('login_required')
  return body.action === 'plan' ? checkPlan(data.plan, body.catalog) : body.action === 'grade' ? checkGrade(data.grade, body.exam) : checkExam(data.exam, body.courses, body.duration)
}
export const draftKey = id => `revizstmg_exam_v1_${id}`
export function readDraft(id, storage = localStorage) {
  if (!id) return null
  try {
    const draft = JSON.parse(storage.getItem(draftKey(id)) || 'null')
    if (!draft || draft.owner !== id || !DURATIONS.includes(draft.duration) || !Array.isArray(draft.courses) || !draft.courses.length) return null
    checkExam(draft.exam, draft.courses, draft.duration)
    if (!draft.answers || typeof draft.answers !== 'object' || Array.isArray(draft.answers) || Object.values(draft.answers).some(v => typeof v !== 'string' || v.length > 16000)) return null
    if (draft.submittedAt != null && (!Number.isFinite(draft.submittedAt) || draft.submittedAt <= 0)) return null
    if (draft.startedAt != null && (!Number.isFinite(draft.startedAt) || draft.startedAt <= 0)) return null
    if (draft.grade) draft.grade = checkGrade(draft.grade, draft.exam)
    return draft
  } catch { return null }
}
export function secondsLeft(draft, now = Date.now()) {
  return draft.startedAt ? Math.max(0, Math.ceil((draft.startedAt + draft.duration * 60000 - now) / 1000)) : draft.duration * 60
}
