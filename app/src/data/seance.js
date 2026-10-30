// « Ma séance du jour » : trois étapes courtes, enchaînées sans menu.
// 1. Tes erreurs à revoir : les questions du carnet dues aujourd'hui ;
// 2. Révision : un thème déjà travaillé, dont la révision est due ou fragile ;
// 3. Avancer : le prochain exercice du cours, là où l'élève s'est arrêté.
// Une étape sans matière (carnet vide, rien à réviser) est simplement sautée.
// Les matières de la filière doivent être chargées (ContenuFiliere).
import { ALL_CHAPTERS, themeChapters, jeuxDuChapitre, EXERCICES_POUR_MAITRISER } from './index.js'
import { realThemes, reviewQueue, buildThemeExam, THEME_INDEX } from './study.js'
import { erreursDues, CROSS_GAMES } from '../store.jsx'

const ERREURS_MAX = 8
const REVISION_QUESTIONS = 8
const REUSSI = 80

function etapeErreurs(state, track, jour) {
  const allowed = new Set(realThemes(track).map(t=>t.themeId))
  const groupes = new Map()
  for (const e of erreursDues(state.erreurs, jour)) {
    if (!allowed.has(e.themeId) || !ALL_CHAPTERS[e.themeId]) continue
    const cle = `${e.themeId}|${e.type}`
    if (!groupes.has(cle)) groupes.set(cle, { themeId: e.themeId, type: e.type, questions: [] })
    groupes.get(cle).questions.push(e.q)
  }
  const g = [...groupes.values()].sort((a, b) => b.questions.length - a.questions.length)[0]
  if (!g) return null
  const info = THEME_INDEX[g.themeId] || {}
  return {
    id: 'erreurs', titre: 'Tes erreurs à revoir', detail: info.themeName, themeId: g.themeId, color: info.color,
    game: { id: `carnet-${g.type}`, type: g.type, title: 'Tes erreurs à revoir', questions: g.questions.slice(0, ERREURS_MAX) },
  }
}

function etapeRevision(state, track, jour, sauf) {
  // Un thème vu seulement dans un bac blanc ou un défi n'est pas « travaillé ».
  const travaille = (id) => {
    const rec = state.chapters?.[id]
    return !!(rec?.worked || Object.keys(rec?.games || {}).some((g) => !CROSS_GAMES.has(g)))
  }
  for (const t of reviewQueue(state, track, jour)) {
    if (t.themeId === sauf || !travaille(t.themeId) || (t.reason !== 'due' && t.reason !== 'weak')) continue
    const questions = buildThemeExam(t.themeId, REVISION_QUESTIONS)
    if (questions.length < 3) continue
    return {
      id: 'revision', titre: t.reason === 'due' ? 'Révision du jour' : 'Point faible à consolider', detail: t.themeName, themeId: t.themeId, color: t.color,
      game: { id: 'seance-revision', type: 'qcm', title: `Révision : ${t.themeName}`, questions },
    }
  }
  return null
}

// Le prochain exercice du cours : dans le thème où l'élève s'est arrêté (puis
// les suivants), le premier chapitre pas encore maîtrisé, et son premier
// exercice pas encore réussi (jamais fait d'abord, flashcards en dernier).
export function prochainExercice(state, track, themeDepart) {
  const themes = realThemes(track)
  if (!themes.length) return null
  const i0 = Math.max(0, themes.findIndex((t) => t.themeId === themeDepart))
  for (let k = 0; k < themes.length; k++) {
    const t = themes[(i0 + k) % themes.length]
    const theme = ALL_CHAPTERS[t.themeId]
    if (!theme?.cours) continue
    const scores = state.chapters?.[t.themeId]?.games || {}
    for (const ch of themeChapters(theme)) {
      const jeux = jeuxDuChapitre(ch, theme)
      if (!jeux.length) continue
      const reussis = jeux.filter((g) => (scores[g.id] || 0) >= REUSSI).length
      if (reussis >= Math.min(EXERCICES_POUR_MAITRISER, jeux.length)) continue
      const ordre = [...jeux].sort((a, b) => (a.type === 'flashcard') - (b.type === 'flashcard') || (scores[a.id] != null) - (scores[b.id] != null))
      const jeu = ordre.find((g) => (scores[g.id] || 0) < REUSSI)
      if (jeu) return { ...t, chapitre: ch, jeu }
    }
  }
  return null
}

export function composerSeance(state, track, jour, themeDepart = null) {
  const avancer = prochainExercice(state, track, themeDepart || state.lastChapter?.chapterId)
  const etapes = [
    etapeErreurs(state, track, jour),
    etapeRevision(state, track, jour, avancer?.themeId),
    avancer && {
      id: 'avancer', titre: 'Avancer dans le cours', detail: `${avancer.themeName} · ${avancer.chapitre.title}`, themeId: avancer.themeId, color: avancer.color,
      chapitre: avancer.chapitre.idx, game: avancer.jeu,
    },
  ]
  return etapes.filter(Boolean)
}
