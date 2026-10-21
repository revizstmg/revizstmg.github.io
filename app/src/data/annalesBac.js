export const ANNALES_SOURCE = 'https://www.education.gouv.fr/brevet-bac-et-cap-les-sujets-des-examens-2026-504911'
export const BAC_BO = 'https://www.education.gouv.fr/bo/2026/Special4/MENE2622652N'
const base = 'https://www.education.gouv.fr/sites/default/files/document/baccalaureat-technologique-2026-sciences-et-technologies-du-management-et-de-la-gestion-'
export const CENTRES_BAC = [
  { id: 'metropole', label: 'Métropole · La Réunion · Mayotte', suffix: '_1' },
  { id: 'antilles', label: 'Antilles · Guyane', suffix: '_2' },
  { id: 'etranger', label: 'Centres étrangers · Groupe 1', suffix: '' },
]
export const ANNALES_BAC = [
  { id: 'droit-eco', name: 'Droit & économie', officialName: 'Droit et économie', number: '01', tag: 'Analyser. Argumenter. Défendre.', desc: 'Deux parties indépendantes. Une situation juridique, une analyse économique et tous les documents pour construire ta réponse.', category: 'droit-et', pages: 8, code: '26-MGDEME1', color: 'law' },
  { id: 'msgn', name: 'Management', officialName: 'Management, sciences de gestion et numérique', number: '02', tag: 'Observer. Décider. Justifier.', desc: 'Une organisation réelle, plusieurs dossiers et leurs annexes. Le sujet complet pour mobiliser tes connaissances en situation.', category: 'management', pages: 15, code: '26-MGMSGNME1', color: 'management' },
]
export function annaleUrl(subject, centre = 'metropole') {
  const s = ANNALES_BAC.find(s => s.id === subject)
  const c = CENTRES_BAC.find(c => c.id === centre)
  if (!s || !c) return null
  return `${base}${s.category}${c.suffix}.pdf`
}
