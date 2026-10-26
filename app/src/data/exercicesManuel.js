// Exercices des manuels de langues (resources/langues/<langue>.json), jouables sur le site.
// La numérotation et les corrigés sont ceux du PDF (scripts/guides-langues.mjs) :
// les leçons dans l'ordre, puis les bilans par unité.
import { answerMatches } from '../games/common.jsx'

export function ordonnerExercices(manuel) {
  const parLecon = new Map(manuel.lessons.map((l) => [l.id, manuel.exercises.filter((e) => e.lessonId === l.id)]))
  const unites = [...new Set(manuel.exercises.filter((e) => !e.lessonId).map((e) => e.unit))]
  const ordre = [
    ...manuel.lessons.flatMap((l) => parLecon.get(l.id)),
    ...unites.flatMap((u) => manuel.exercises.filter((e) => !e.lessonId && e.unit === u)),
  ]
  const numeros = new Map(ordre.map((e, i) => [e.id, i + 1]))
  const groupes = [
    ...manuel.lessons.map((l, i) => ({ id: l.id, titre: `Leçon ${i + 1} · ${l.title}`, exercices: parLecon.get(l.id) })),
    ...unites.map((u) => ({ id: `bilan-${u}`, titre: `Bilan · ${u}`, exercices: manuel.exercises.filter((e) => !e.lessonId && e.unit === u) })),
  ].filter((g) => g.exercices.length)
  return { groupes, numeros, total: ordre.length }
}

// Une traduction ou une production admet plusieurs formulations justes (le PDF le dit) :
// l'élève compare alors avec le corrigé et s'évalue lui-même.
export const estLibre = (e) => e.type === 'production' || /^\s*Traduis/i.test(e.prompt)

export const libelleType = (e) => (e.type === 'production' ? 'Expression guidée' : e.type === 'qcm' ? 'Choisir et justifier' : estLibre(e) ? 'Traduction' : 'Mini-exercice')

export function verifier(e, saisie) {
  if (e.type === 'qcm') return saisie === e.answer
  return answerMatches(saisie, e.answer, e.alternatives || [])
}
