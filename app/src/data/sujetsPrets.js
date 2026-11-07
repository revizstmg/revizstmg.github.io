import sujets from './sujets/catalogue.json'
// Catalogue éditorial local : aucun appel à un fournisseur et aucune réservation
// de quota pour télécharger ces sujets. Les cas et chiffres sont fictifs.
export const SUJETS_PRETS = sujets
export function sujetsPourNiveau(level) {
  return sujets.filter(s => s.level === level || s.scope === 'premiere-terminale')
}
