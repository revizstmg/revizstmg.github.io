// Dates des épreuves du bac par session (content/commun/epreuves.json), à mettre
// à jour chaque année d'après le calendrier officiel publié au Bulletin officiel.
// Une épreuve sans date (oral de français) est fixée par chaque académie.
import { commun } from '../content/contenu.js'
import { daysUntil, todayKey } from './srs.js'

export const CALENDRIER = commun('epreuves')

const NIVEAU = { 'terminale-stmg': 'terminale', 'premiere-stmg': 'premiere' }

// Épreuves du niveau de l'élève qui ne sont pas encore passées, avec le nombre
// de jours avant leur début (null quand la date dépend de l'académie).
export function epreuvesAVenir(level, today = todayKey()) {
  const niveau = NIVEAU[level]
  if (!niveau) return []
  return CALENDRIER.epreuves
    .filter((e) => e.niveau === niveau && (!e.debut || (e.fin || e.debut) >= today))
    .map((e) => ({ ...e, jours: e.debut ? daysUntil(e.debut, today) : null }))
}

// Date de la première épreuve écrite à venir : c'est la date du compte à rebours
// tant que l'élève n'en a pas choisi une autre. Null une fois la session passée.
export function premiereEpreuve(level, today = todayKey()) {
  const dates = epreuvesAVenir(level, today).map((e) => e.debut).filter((d) => d && d >= today).sort()
  return dates[0] || null
}
