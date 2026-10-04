// Banque de « Définitions clés » par thème, et banque de secours par matière.
// Contenu : content/<matière>/definitions.json et content/commun/definitions-matieres.json.
import { couche, commun } from '../content/contenu.js'

export const THEME_TERMS = couche('definitions')
export const SUBJECT_FALLBACK = commun('definitions-matieres')

export function subjectFallbackFor(subjectId) {
  const id = String(subjectId || '')
  if (id.includes('gestion') || id.includes('sgn')) return SUBJECT_FALLBACK['gestion-finance']
  if (id.includes('mgmt') || id.includes('management')) return SUBJECT_FALLBACK.management
  if (id.includes('droit')) return SUBJECT_FALLBACK.droit
  if (id.includes('eco')) return SUBJECT_FALLBACK.economie
  if (id.includes('mkg') || id.includes('mercatique')) return SUBJECT_FALLBACK.mercatique
  if (id.includes('rh')) return SUBJECT_FALLBACK['rh-communication']
  if (id.includes('sig')) return SUBJECT_FALLBACK.sig
  if (id.includes('math')) return SUBJECT_FALLBACK.maths
  if (id.includes('philo')) return SUBJECT_FALLBACK.philosophie
  if (id.includes('hg') || id.includes('histoire')) return SUBJECT_FALLBACK['histoire-geo']
  if (id.includes('lng') || id.includes('lang') || id.includes('fr')) return SUBJECT_FALLBACK.langues
  return SUBJECT_FALLBACK.management
}
