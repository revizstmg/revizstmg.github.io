// Sujets au format des deux épreuves écrites de spécialité du bac STMG (4 h
// chacune), composés avec le contenu existant, sans rien inventer :
// - « Droit et économie » : une étude de documents de droit, puis une d'économie ;
// - « Management, sciences de gestion et numérique » : un cas de management, puis
//   un cas de l'enseignement spécifique de l'élève (gestion-finance, mercatique…).
// Les études de documents et les cas pratiques sont des couches de contenu, qui
// ne sont remplies qu'une fois la matière chargée (page enveloppée par
// <ContenuFiliere>).
import { COUCHES } from '../content/contenu.js'
import { ALL_CHAPTERS } from './index.js'

export const DUREE_EPREUVE = 4 * 60 * 60 // secondes

const auHasard = (liste, aleatoire) => liste[Math.floor(aleatoire() * liste.length)]

// Thèmes d'une matière qui ont une couche donnée (études de documents ou cas).
function themesAvec(couche, subjectId) {
  return Object.entries(COUCHES[couche] || {})
    .filter(([tid, v]) => ALL_CHAPTERS[tid]?.subjectId === subjectId && v && (Array.isArray(v) ? v.length : v.questions?.length))
}

function partieEtude(subjectId, titre, aleatoire) {
  const choix = themesAvec('etudes-documents', subjectId)
  if (!choix.length) return null
  const [themeId, etude] = auHasard(choix, aleatoire)
  return { titre, themeId, game: { ...etude, id: `${etude.id}::sujet` } }
}

function partieCas(subjectId, titre, aleatoire) {
  const choix = themesAvec('cas-pratiques', subjectId)
  if (!choix.length) return null
  const [themeId, cas] = auHasard(choix, aleatoire)
  return { titre, themeId, game: { id: `${themeId}::sujet-cas`, type: 'caspratique', title: titre, cases: cas } }
}

// Les sujets proposés à un élève de Terminale STMG ; vide pour la Première (ses
// épreuves anticipées n'ont pas ce format).
export function sujetsDisponibles(track) {
  if (track?.level !== 'terminale-stmg') return []
  return [
    { id: 'droit-eco', icon: '⚖️', titre: 'Droit et économie' },
    { id: 'msgn', icon: '🏢', titre: 'Management, sciences de gestion et numérique' },
  ]
}

// Compose un sujet : deux parties, chacune tirée au hasard parmi le contenu.
export function composerSujet(id, track, aleatoire = Math.random) {
  let parties = []
  if (id === 'droit-eco') {
    parties = [partieEtude('droit', 'Partie 1 — Droit', aleatoire), partieEtude('economie', 'Partie 2 — Économie', aleatoire)]
  } else if (id === 'msgn') {
    parties = [partieCas('management', 'Partie 1 — Management', aleatoire), partieCas(track?.specialty, 'Partie 2 — Enseignement spécifique', aleatoire)]
  }
  parties = parties.filter(Boolean)
  const sujet = sujetsDisponibles(track).find((s) => s.id === id)
  return parties.length && sujet ? { ...sujet, parties, duree: DUREE_EPREUVE } : null
}

// Note sur 20 d'après les bonnes réponses de toutes les parties.
export function noteSur20(resultats) {
  const correct = resultats.reduce((n, r) => n + r.correct, 0)
  const total = resultats.reduce((n, r) => n + r.total, 0)
  return total ? Math.round((correct / total) * 200) / 10 : 0
}
