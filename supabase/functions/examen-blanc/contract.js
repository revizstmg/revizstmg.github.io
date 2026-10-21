import { checkFiles } from './grading.js'
export const DURATIONS = [60, 120, 180, 240]
export function checkRequest(body) {
  if (!body || !DURATIONS.includes(body.duration) || typeof body.prompt !== 'string' || body.prompt.trim().length < 15 || body.prompt.length > 1500) throw new Error('invalid_request')
  if (!['plan', 'generate', 'grade'].includes(body.action)) throw new Error('invalid_request')
  const entries = body.action === 'plan' ? body.catalog : body.courses
  const limit = body.action === 'plan' ? 1600 : 24
  if (!Array.isArray(entries) || !entries.length || entries.length > limit) throw new Error('invalid_request')
  const ids = new Set()
  for (const c of entries) {
    if (!c || typeof c.id !== 'string' || c.id.length > 160 || ids.has(c.id) || typeof c.title !== 'string' || c.title.length > 400 || typeof c.subject !== 'string' || c.subject.length > 150 || !['premiere', 'terminale'].includes(c.level)) throw new Error('invalid_request')
    ids.add(c.id)
    if (body.action === 'generate' && (typeof c.text !== 'string' || !c.text.trim() || c.text.length > 30000)) throw new Error('invalid_request')
  }
  if (body.action === 'grade') {
    const exam = checkExam(body.exam, body.courses, body.duration)
    if (JSON.stringify(exam).length > 300000) throw new Error('too_large')
    return { action: 'grade', prompt: body.prompt, duration: body.duration, courses: body.courses, exam, files: checkFiles(body.files) }
  }
  return body
}
export function checkPlan(plan, catalog) {
  const allowed = new Set(catalog.map(c => c.id))
  if (!plan || typeof plan.summary !== 'string' || plan.summary.length > 1800 || !Array.isArray(plan.chapterIds) || !plan.chapterIds.length || plan.chapterIds.length > 24 || new Set(plan.chapterIds).size !== plan.chapterIds.length || plan.chapterIds.some(id => !allowed.has(id))) throw new Error('invalid_response')
  return { summary: plan.summary, chapterIds: plan.chapterIds }
}
const text = (s, n) => typeof s === 'string' && s.trim().length > 0 && s.length <= n
export function checkExam(exam, courses, duration) {
  const ids = new Set(courses.map(c => c.id))
  const count = duration / 10
  if (!exam || !text(exam.title, 180) || !text(exam.instructions, 3000) || !Array.isArray(exam.documents) || exam.documents.length > 12 || !Array.isArray(exam.questions) || exam.questions.length < Math.max(4, count - 2) || exam.questions.length > count + 4) throw new Error('invalid_response')
  const docs = new Set()
  for (const d of exam.documents) {
    if (!text(d.id, 40) || docs.has(d.id) || !text(d.title, 200) || !text(d.text, 14000)) throw new Error('invalid_response')
    docs.add(d.id)
  }
  const questions = new Set()
  let total = 0
  for (const q of exam.questions) {
    if (!text(q.id, 40) || questions.has(q.id) || !ids.has(q.chapterId) || !text(q.enonce, 3000) || !text(q.correction, 6500) || !Array.isArray(q.criteria) || !q.criteria.length || q.criteria.length > 8 || q.criteria.some(c => !text(c, 700)) || !Number.isFinite(q.points) || q.points <= 0 || q.points > 10 || !Array.isArray(q.documentIds) || q.documentIds.some(id => !docs.has(id))) throw new Error('invalid_response')
    questions.add(q.id); total += q.points
  }
  if (Math.abs(total - 20) > 0.001) throw new Error('invalid_response')
  // Whitelist output: no HTML execution, URLs or model-controlled metadata.
  return { title: exam.title, instructions: exam.instructions, documents: exam.documents.map(({ id, title, text }) => ({ id, title, text })), questions: exam.questions.map(({ id, chapterId, enonce, points, documentIds, correction, criteria }) => ({ id, chapterId, enonce, points, documentIds, correction, criteria })) }
}

export const documentTarget = duration => ({ 60: 4, 120: 6, 180: 8, 240: 10 })[duration]
export function checkGeneratedExam(exam, courses, duration) {
  const checked = checkExam(exam, courses, duration)
  const personal = checked.questions.filter(q => !q.documentIds.length).length
  const used = new Set(checked.questions.flatMap(q => q.documentIds))
  if (checked.documents.length < documentTarget(duration) || used.size !== checked.documents.length || personal < Math.max(1, Math.ceil(checked.questions.length * 0.2)) || checked.questions.length - personal < Math.ceil(checked.questions.length * 0.5)) throw new Error('invalid_response')
  return checked
}
