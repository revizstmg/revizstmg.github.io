// « Mes notes de classe » : les notes que l'élève reçoit en classe, reliées à une
// matière et à un chapitre (thème) de sa filière, choisis dans des menus.
// Elles sont privées : sauvegardées sur son compte avec sa progression (lisible
// par lui seul), jamais publiées pour la classe, le professeur ou les parents.
//
// Une note : { id, note, matiere, chapitre, date, ajouteLe }
// - note : nombre de 0 à 20, au centième ;
// - chapitre : id du thème, ou TOUTE_LA_MATIERE (bac blanc, devoir de synthèse) ;
// - date : jour du devoir (AAAA-MM-JJ) ; ajouteLe : moment de la saisie.

export const NOTES_MAX = 400
export const TOUTE_LA_MATIERE = '*'
export const SOUS_LA_MOYENNE = 10

// « 15,50 », « 15.5 », « 15 » → 15.5 ; null si ce n'est pas une note sur 20.
export function lireNote(texte) {
  const t = String(texte ?? '').trim().replace(',', '.')
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(t)) return null
  const n = Number(t)
  return n >= 0 && n <= 20 ? n : null
}

// 15.5 → « 15,50 », 15 → « 15 » (séparateur décimal de la langue).
export function formaterNote(n, lang = 'fr') {
  const entier = Number.isInteger(n)
  try {
    return new Intl.NumberFormat(lang, { minimumFractionDigits: entier ? 0 : 2, maximumFractionDigits: 2, numberingSystem: 'latn' }).format(n)
  } catch {
    return entier ? String(n) : n.toFixed(2)
  }
}

const arrondi = (n) => Math.round(n * 100) / 100
const moyenne = (liste) => arrondi(liste.reduce((t, x) => t + x.note, 0) / liste.length)
const nouvelId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function nouvelleNote({ note, matiere, chapitre, date }, maintenant = Date.now()) {
  return { id: nouvelId(), note, matiere, chapitre, date, ajouteLe: maintenant }
}

// La plus récente en tête ; au-delà de NOTES_MAX, les plus anciennes partent.
export function ajouterNote(liste, entree) {
  return [entree, ...(Array.isArray(liste) ? liste : [])].slice(0, NOTES_MAX)
}

const parDate = (x, y) => (y.date || '').localeCompare(x.date || '') || (y.ajouteLe || 0) - (x.ajouteLe || 0)

// Notes rangées par matière (dans l'ordre des matières de la filière), avec la
// moyenne de chacune. Les notes d'une matière qui n'est plus dans la filière
// viennent à la fin.
export function notesParMatiere(liste, matieres = []) {
  const groupes = new Map()
  for (const n of [...(liste || [])].sort(parDate)) {
    if (!groupes.has(n.matiere)) groupes.set(n.matiere, [])
    groupes.get(n.matiere).push(n)
  }
  const ordre = matieres.map((s) => s.id)
  const rang = (id) => (ordre.includes(id) ? ordre.indexOf(id) : ordre.length)
  return [...groupes.entries()]
    .sort(([a], [b]) => rang(a) - rang(b))
    .map(([matiere, notes]) => ({ matiere, notes, moyenne: moyenne(notes) }))
}

// Ce qu'il faut améliorer : les chapitres où les notes sont les plus basses.
// - tout chapitre dont la moyenne est sous 10/20 ;
// - dans chaque matière où au moins deux chapitres sont notés, le chapitre dont
//   la moyenne est la plus basse (s'ils n'ont pas tous la même).
// Les notes « toute la matière » n'indiquent pas de chapitre : elles n'entrent
// pas dans ce classement. Du plus faible au moins faible.
export function aAmeliorer(liste) {
  const chapitres = new Map()
  for (const n of liste || []) {
    if (!n?.chapitre || n.chapitre === TOUTE_LA_MATIERE) continue
    const cle = `${n.matiere}\u0000${n.chapitre}`
    if (!chapitres.has(cle)) chapitres.set(cle, { matiere: n.matiere, chapitre: n.chapitre, notes: [] })
    chapitres.get(cle).notes.push(n)
  }
  const lignes = [...chapitres.values()].map((c) => {
    const notes = c.notes.sort(parDate)
    return { matiere: c.matiere, chapitre: c.chapitre, moyenne: moyenne(notes), nombre: notes.length, derniere: notes[0].date || '' }
  })
  const plusFaibleDabord = (x, y) => x.moyenne - y.moyenne || y.derniere.localeCompare(x.derniere)
  const retenues = new Map()
  for (const l of lignes) if (l.moyenne < SOUS_LA_MOYENNE) retenues.set(l, 'sous-la-moyenne')
  const matieres = new Set(lignes.map((l) => l.matiere))
  for (const m of matieres) {
    const siennes = lignes.filter((l) => l.matiere === m).sort(plusFaibleDabord)
    if (siennes.length < 2 || siennes[0].moyenne === siennes[siennes.length - 1].moyenne) continue
    if (!retenues.has(siennes[0])) retenues.set(siennes[0], 'plus-basse')
  }
  return [...retenues.entries()].map(([l, raison]) => ({ ...l, raison })).sort(plusFaibleDabord)
}
