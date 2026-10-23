// Langues étudiées, distinctes de la langue d’affichage de l’interface.
export const STUDY_LANGUAGES = [
 { id: 'de', key: 'studyGerman' },
  { id: 'ar', key: 'studyArabic' },
  { id: 'en', key: 'studyEnglish' },
  { id: 'it', key: 'studyItalian' },
  { id: 'es', key: 'studySpanish' },
]
export function normalizeStudyLanguages(values) {
  const allowed = new Set(STUDY_LANGUAGES.map(l => l.id))
  return Array.isArray(values) ? [...new Set(values.filter(id => allowed.has(id)))] : []
}
export function chaptersForLanguages(chapters, values) {
  const languages = normalizeStudyLanguages(values)
  if (!languages.length) return chapters
  return chapters.filter(chapter => chapter.id === 'p1-lng-axes' || languages.some(id => chapter.id.startsWith(`lng-${id}-`) || chapter.id === `p1-lng-${id}`))
}
