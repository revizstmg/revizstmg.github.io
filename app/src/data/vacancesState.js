// Résumés et fusion sans dépendance au contenu : utilisables pendant la synchronisation.
export const vacancesTrackKey = track => `${track?.level || ''}:${track?.specialty || ''}`
export function vacancesScore(questions = [], answers = {}) {
  if (!questions.length || questions.some(q => !answers[q.id])) return null
  return Math.round(100 * questions.filter(q => answers[q.id]?.correct === true).length / questions.length)
}
export const vacancesSessionDone = session => !!session?.questions?.length && vacancesScore(session.questions, session.answers) !== null
export function mergeVacances(a, b) {
  if (!a || !b || a.id !== b.id) return (b?.maj || 0) > (a?.maj || 0) ? b : a || b
  const recent = (b.maj || 0) > (a.maj || 0) ? b : a
  const answers = (x = {}, y = {}) => {
    const out = { ...x }
    for (const [id, v] of Object.entries(y)) if (!out[id] || (v.at || 0) > (out[id].at || 0)) out[id] = v
    return out
  }
  return { ...recent, initialAnswers: answers(a.initialAnswers, b.initialAnswers), finalAnswers: answers(a.finalAnswers, b.finalAnswers),
    sessions: (recent.sessions || []).map((s, i) => {
      const x = a.sessions?.[i], y = b.sessions?.[i]
      // Une séance déjà construite reste un ensemble cohérent de questions + réponses.
      // Ne pas mélanger deux tirages simultanés de la même séance.
      if (x?.id !== y?.id) return (y?.maj || 0) > (x?.maj || 0) ? y : x || y || s
      return { ...s, answers: answers(x?.answers, y?.answers) }
    }) }
}
export function vacancesSummary(program, track) {
  if (!program?.id || program.trackKey !== vacancesTrackKey(track)) return null
  return { done: (program.sessions || []).filter(vacancesSessionDone).length, total: program.sessions?.length || 0,
    initial: vacancesScore(program.initialQuestions, program.initialAnswers), final: vacancesScore(program.finalQuestions, program.finalAnswers), date: program.startDate }
}
export function cleanVacancesSummary(value) {
  if (!value || !Number.isInteger(value.total) || value.total < 1 || value.total > 8 || !Number.isInteger(value.done) || value.done < 0 || value.done > value.total) return undefined
  const score = x => Number.isInteger(x) && x >= 0 && x <= 100 ? x : null
  return { done: value.done, total: value.total, initial: score(value.initial), final: score(value.final), date: /^\d{4}-\d{2}-\d{2}$/.test(value.date) ? value.date : '' }
}
