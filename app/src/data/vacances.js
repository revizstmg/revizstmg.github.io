import { ALL_CHAPTERS, themeChapters } from './index.js'
import { subjectsForTrack } from './tracks.js'
import { addDays } from './srs.js'
import { vacancesScore, vacancesSessionDone, vacancesTrackKey } from './vacancesState.js'
export { vacancesScore, vacancesSessionDone, vacancesTrackKey } from './vacancesState.js'
const SUBJECTS = new Set(['droit', 'economie', 'management', 'p1-droit', 'p1-economie', 'p1-management'])
const normalized = s => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
const hash = s => { let n = 2166136261; for (const c of s) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return (n >>> 0).toString(36) }
export const vacancesSubjects = track => subjectsForTrack(track).filter(s => SUBJECTS.has(s.id))
const chapterCache = new WeakMap()
export function vacancesChapters(subject) {
  if (!subject || !(subject.chapters || []).every(t => ALL_CHAPTERS[t.id]?.cours)) return []
  if (chapterCache.has(subject)) return chapterCache.get(subject)
  const result = (subject?.chapters || []).flatMap(t => themeChapters(ALL_CHAPTERS[t.id])).map(ch => {
    const seen = new Set(), questions = []
    for (const game of ch.games) {
      if (game.type !== 'qcm') continue
      for (const q of game.questions || []) {
        const key = normalized(q.q)
        if (q.gen || !key || seen.has(key) || !Array.isArray(q.choices) || q.choices.length < 2 || !Number.isInteger(q.answer) || !q.choices[q.answer]) continue
        if (new Set(q.choices.map(normalized)).size !== q.choices.length) continue
        seen.add(key)
        questions.push({ id: `${ch.id}:${hash(key)}`, chapterId: ch.id, themeId: ch.themeId, q: q.q, choices: q.choices, answer: q.answer, explain: q.explain || '', ...(q.fig ? { fig: q.fig } : {}) })
      }
    }
    return { id: ch.id, themeId: ch.themeId, idx: ch.idx, title: ch.title, section: ch.section, questions }
  }).filter(ch => ch.questions.length >= 7)
  chapterCache.set(subject, result)
  return result
}
function rotate(items, seed) {
  // Mélange stable par programme ; garder le même jeu après rechargement.
  return items.map(x => ({ x, order: hash(`${seed}:${x.id}`) })).sort((a, b) => a.order.localeCompare(b.order)).map(v => v.x)
}
export function createVacances({ subject, selection, track, startDate, goal = 'bases', minutes = 20, rhythm = 4, id, now = Date.now() }) {
  if (!vacancesSubjects(track).some(s => s.id === subject?.id) || !['bases', 'controle'].includes(goal) || ![15, 20, 30].includes(minutes) || ![3, 4].includes(rhythm)) throw Error('invalid_program')
  const parsed = new Date(`${startDate}T12:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== startDate) throw Error('invalid_date')
  const wanted = [...new Set(selection || [])]
  const chapters = vacancesChapters(subject).filter(ch => wanted.includes(ch.id))
  if (!wanted.length || wanted.length > 3 || chapters.length !== wanted.length || !id) throw Error('invalid_selection')
  const initialQuestions = [], finalQuestions = []
  const reserved = new Set(chapters.map(ch => normalized(ch.questions[0].q)))
  const practiceCandidates = []
  for (const ch of chapters) {
    const qs = rotate(ch.questions.slice(1).filter(q => !reserved.has(normalized(q.q))), id).map(q => {
      const choices = q.choices.map((text, i) => ({ id: String(i), text, correct: i === q.answer }))
      const ordered = rotate(choices, `${id}:${q.id}`)
      return { ...q, choices: ordered.map(x => x.text), answer: ordered.findIndex(x => x.correct) }
    })
    if (qs.length < 4) throw Error('insufficient_questions')
    initialQuestions.push(...qs.slice(0, 2)); finalQuestions.push(...qs.slice(2, 4)); practiceCandidates.push(...qs.slice(4))
    qs.slice(0, 4).forEach(q => reserved.add(normalized(q.q)))
  }
  const seenPractice = new Set()
  const practice = practiceCandidates.filter(q => { const key = normalized(q.q); if (reserved.has(key) || seenPractice.has(key)) return false; seenPractice.add(key); return true })
  // Au maximum deux passages d’une même question pendant les vacances.
  if (practice.length < rhythm * 3) throw Error('insufficient_questions')
  const days = rhythm === 4 ? [0, 2, 4, 6, 7, 9, 11, 13] : [0, 3, 6, 7, 10, 13]
  return { id, maj: now, trackKey: vacancesTrackKey(track), subjectId: subject.id, subjectName: subject.name, goal, minutes, startDate,
    chapters: chapters.map(({ id, title, themeId, idx }) => ({ id, title, themeId, idx })), initialQuestions, finalQuestions, practice,
    initialAnswers: {}, finalAnswers: {}, sessions: days.map((day, i) => ({ index: i, date: addDays(startDate, day), questions: [], answers: {} })) }
}
export function chapterMeasures(program) {
  return program.chapters.map(ch => {
    const evidence = [...program.initialQuestions.map(q => ({ q, a: program.initialAnswers[q.id] })), ...program.sessions.flatMap(s => s.questions.map(q => ({ q, a: s.answers[q.id] })))]
      .filter(x => x.q.chapterId === ch.id && x.a)
    // Les cinq dernières réponses du chapitre orientent la séance, pas une maîtrise certifiée.
    const last = evidence.slice(-5)
    return { ...ch, score: last.length ? Math.round(100 * last.filter(x => x.a.correct).length / last.length) : null }
  })
}
export function prepareVacancesSession(program, index, now = Date.now()) {
  if (vacancesScore(program.initialQuestions, program.initialAnswers) === null || index < 0 || index >= program.sessions.length || program.sessions.slice(0, index).some(s => !vacancesSessionDone(s))) return program
  if (program.sessions[index].questions.length) return program
  const measures = chapterMeasures(program), counts = new Map(), lastSeen = new Map()
  program.sessions.slice(0, index).forEach((s, i) => s.questions.forEach(q => { counts.set(q.id, (counts.get(q.id) || 0) + 1); lastSeen.set(q.id, i) }))
  const chapterCounts = ch => program.sessions.slice(0, index).reduce((n, s) => n + s.questions.filter(q => q.chapterId === ch.id).length, 0)
  const ranked = [...measures].sort((a, b) => ((a.score ?? 0) + chapterCounts(a) * 8) - ((b.score ?? 0) + chapterCounts(b) * 8))
  const questions = []
  // Priorité aux fragilités, mais chaque chapitre revient ; aucune question de bilan.
  const priorities = ranked.length > 1 && (ranked[0].score ?? 0) < 75 ? [ranked[0], ranked[0], ranked[1]] : ranked
  for (const ch of priorities) {
    const candidates = program.practice.filter(q => q.chapterId === ch.id && (counts.get(q.id) || 0) < 2).sort((a, b) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0) || (lastSeen.get(a.id) ?? -1) - (lastSeen.get(b.id) ?? -1))
    const q = candidates.find(q => !questions.some(x => x.id === q.id)); if (q) questions.push(q)
    if (questions.length >= 3) break
  }
  const extras = program.practice.filter(q => (counts.get(q.id) || 0) < 2 && !questions.some(x => x.id === q.id)).sort((a, b) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0) || (lastSeen.get(a.id) ?? -1) - (lastSeen.get(b.id) ?? -1))
  questions.push(...extras.slice(0, 3 - questions.length))
  const sessions = [...program.sessions]
  sessions[index] = { ...sessions[index], id: `${program.id}:${index}:${now}`, maj: now, questions, focus: questions[0]?.chapterId, answers: {} }
  return { ...program, sessions, maj: now }
}
export function answerVacances(program, phase, questionId, picked, now = Date.now()) {
  const initial = phase === 'initial', final = phase === 'final'
  const index = typeof phase === 'number' ? phase : -1
  if (final && program.sessions.some(s => !vacancesSessionDone(s))) return program
  const target = initial ? { questions: program.initialQuestions, answers: program.initialAnswers } : final ? { questions: program.finalQuestions, answers: program.finalAnswers } : program.sessions[index]
  const q = target?.questions.find(q => q.id === questionId)
  if (!q || target.answers[q.id] || !Number.isInteger(picked) || picked < 0 || picked >= q.choices.length) return program
  const answer = { picked, correct: picked === q.answer, at: now }
  if (initial || final) return { ...program, [initial ? 'initialAnswers' : 'finalAnswers']: { ...target.answers, [q.id]: answer }, maj: now }
  const sessions = [...program.sessions]; sessions[index] = { ...target, answers: { ...target.answers, [q.id]: answer }, maj: now }
  return { ...program, sessions, maj: now }
}
