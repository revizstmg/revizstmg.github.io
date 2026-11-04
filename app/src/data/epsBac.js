// Sport au bac : le référentiel national d'EPS (contrôle en cours de formation, BO n° 9 du 26 février 2026,
// content/commun/eps-bac.json) et des propositions d'entraînement (content/commun/eps-entrainements.json).
// Les barèmes locaux sont construits par chaque établissement : on n'invente aucun barème, on place l'élève
// par rapport aux repères nationaux et on estime sa note à partir des degrés d'acquisition.
import EPS from '../../content/commun/eps-bac.json'
import ENTRAINEMENTS from '../../content/commun/eps-entrainements.json'

export { EPS, ENTRAINEMENTS }

export const CHAMPS = EPS.champs
export const champ = (id) => CHAMPS.find((c) => c.id === id) || null
export const familleDe = (idFamille) => {
  for (const c of CHAMPS) { const f = c.familles.find((x) => x.id === idFamille); if (f) return { champ: c, famille: f } }
  return null
}
export const REPARTITIONS = EPS.epreuve.choixRepartition

// Milieu de la plage de points d'un degré (1 à 4), en fraction du maximum.
const FRACTIONS = EPS.degres.fractions
export const fractionDuDegre = (degre) => {
  const f = FRACTIONS.find((x) => x.degre === Number(degre))
  return f ? (f.min + f.max) / 2 : null
}
const arrondi = (n) => Math.round(n * 4) / 4 // au quart de point, comme le barème national (0,25)

// Estimation de la note d'une épreuve sur 20 d'après les degrés choisis.
// degresAfl1 : un degré par élément de l'AFL1 (deux éléments, 12 points en tout) ; degreAfl2, degreAfl3 : 1 à 4 ;
// repartition : [points AFL2, points AFL3] parmi 4-4, 6-2, 2-6.
export function estimerNote({ degresAfl1, degreAfl2, degreAfl3, repartition = [4, 4] }) {
  if (!Array.isArray(degresAfl1) || !degresAfl1.length || degresAfl1.some((d) => fractionDuDegre(d) == null)) throw new Error('degrés AFL1 invalides')
  if (fractionDuDegre(degreAfl2) == null || fractionDuDegre(degreAfl3) == null) throw new Error('degrés AFL2/AFL3 invalides')
  if (!REPARTITIONS.some(([a, b]) => a === repartition[0] && b === repartition[1])) throw new Error('répartition invalide')
  const par = (degres, max) => degres.reduce((n, d) => n + fractionDuDegre(d), 0) / degres.length * max
  const borne = (degres, max, cle) => degres.reduce((n, d) => n + FRACTIONS.find((x) => x.degre === Number(d))[cle], 0) / degres.length * max
  const afl1 = arrondi(par(degresAfl1, 12)), afl2 = arrondi(fractionDuDegre(degreAfl2) * repartition[0]), afl3 = arrondi(fractionDuDegre(degreAfl3) * repartition[1])
  const min = borne(degresAfl1, 12, 'min') + FRACTIONS.find((x) => x.degre === Number(degreAfl2)).min * repartition[0] + FRACTIONS.find((x) => x.degre === Number(degreAfl3)).min * repartition[1]
  const max = borne(degresAfl1, 12, 'max') + FRACTIONS.find((x) => x.degre === Number(degreAfl2)).max * repartition[0] + FRACTIONS.find((x) => x.degre === Number(degreAfl3)).max * repartition[1]
  return { afl1, afl2, afl3, total: arrondi(afl1 + afl2 + afl3), min: Math.floor(min * 4) / 4, max: Math.ceil(max * 4) / 4 }
}

// Moyenne des trois épreuves (note sur 20), l'ensemble certificatif comptant trois épreuves de trois champs distincts.
export function moyenneEpreuves(notes) {
  const valides = (notes || []).filter((n) => Number.isFinite(n))
  return valides.length ? Math.round(valides.reduce((a, b) => a + b, 0) / valides.length * 100) / 100 : null
}

// Les trois champs choisis sont-ils distincts ? (règle de l'ensemble certificatif)
export const champsDistincts = (ids) => new Set(ids).size === ids.length

// Temps « 3’08 », « 29’’2 », « 40’’ », « 57’’5 » -> secondes.
export function enSecondes(texte) {
  const t = String(texte || '').replace(/[’'′]/g, '’').replace(/’’|"/g, '"').trim()
  let m = /^(\d+)’(\d{1,2})$/.exec(t)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  m = /^(\d+)"(\d*)$/.exec(t)
  if (m) return Number(m[1]) + (m[2] ? Number(m[2]) / 10 ** m[2].length : 0)
  m = /^(\d+)’$/.exec(t)
  return m ? Number(m[1]) * 60 : null
}
export function formaterTemps(secondes) {
  if (!Number.isFinite(secondes)) return ''
  const arr = Math.round(secondes)
  const m = Math.floor(arr / 60), s = arr % 60
  return m ? `${m}’${String(s).padStart(2, '0')}` : `${s} s`
}
// Distance ou hauteur « 18,5 m », « 1,39 m », « 1 100 m » -> nombre.
export function enMetres(texte) {
  const t = String(texte || '').replace(/\s/g, ' ').replace(/ /g, '').replace(',', '.').replace(/m$/, '')
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

// Lit ce que tape l'élève : « 3’08 », « 3'08 », « 3:08 », « 31,5 » ou « 190 » (secondes) pour un temps ;
// « 18,5 » ou « 1 100 m » pour une distance. Renvoie des secondes ou des mètres, ou null.
export function lireValeur(ligne, texte) {
  const brut = String(texte || '').trim()
  if (!brut) return null
  if (ligne.type === 'temps') {
    const m = /^(\d+)\s*(?:[’'′:]|min)\s*(\d{1,2})(?:[,.](\d+))?\s*(?:s|"|’’)?$/.exec(brut)
    if (m) return Number(m[1]) * 60 + Number(m[2]) + (m[3] ? Number(`0.${m[3]}`) : 0)
    const n = Number(brut.replace(/\s/g, '').replace(',', '.').replace(/(?:s|"|’’)$/, ''))
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const v = enMetres(brut)
  return v != null && v > 0 ? v : null
}

export const lignesSeuil = (idFamille) => EPS.seuilsCA1.lignes.filter((l) => l.famille === idFamille)
export const ligneSeuil = (id) => EPS.seuilsCA1.lignes.find((l) => l.id === id) || null

// Position d'une performance par rapport au seuil national médian (3 points sur 6). sexe : 'g' ou 'f'.
// Pour un temps, moins c'est mieux ; pour une distance, une hauteur ou une distance en temps imparti, plus c'est mieux.
export function positionSeuil(ligne, sexe, valeur) {
  const reference = sexe === 'f' ? ligne.f : ligne.g
  const meilleurEstPetit = ligne.type === 'temps'
  const ref = meilleurEstPetit ? enSecondes(reference) : enMetres(reference)
  if (ref == null || !Number.isFinite(valeur)) return null
  const ecart = meilleurEstPetit ? ref - valeur : valeur - ref // positif = au-dessus du seuil
  const ecartRelatif = ecart / ref
  const niveau = ecartRelatif >= 0.03 ? 'au-dessus' : ecartRelatif <= -0.03 ? 'en-dessous' : 'au-seuil'
  return { reference, ref, ecart: Math.round(ecart * 100) / 100, ecartRelatif: Math.round(ecartRelatif * 1000) / 1000, niveau }
}

// Vitesse (km/h) d'une performance de demi-fond : temps sur une distance, ou distance en temps imparti.
export function vitesseDemiFond(ligne, valeur) {
  if (ligne.type === 'temps' && ligne.distance && valeur > 0) return Math.round(ligne.distance / valeur * 3.6 * 100) / 100
  if (ligne.type === 'distance' && ligne.duree && valeur > 0) return Math.round(valeur / ligne.duree * 3.6 * 100) / 100
  return null
}

// Remplace [200@100] par « 200 m en 46 s » : distance parcourue à 100 % de la vitesse de référence.
export function personnaliser(texte, vitesseKmh) {
  return String(texte).replace(/\[(\d+)@(\d+)\]/g, (_, d, p) => {
    if (!Number.isFinite(vitesseKmh) || vitesseKmh <= 0) return `${d} m`
    const secondes = Number(d) / (vitesseKmh * Number(p) / 100 / 3.6)
    return `${d} m en ${formaterTemps(secondes)}`
  })
}

const PHASES = ['construire', 'developper', 'affuter']
export const NOM_PHASE = { construire: 'Construire', developper: 'Développer', affuter: 'Affûter' }

// Répartition des semaines entre les trois phases (au moins une semaine chacune à partir de 3 semaines).
export function phasesDeSemaines(semaines) {
  const n = Math.max(1, Math.min(12, Math.round(semaines)))
  if (n === 1) return ['developper']
  if (n === 2) return ['construire', 'affuter']
  const affuter = n >= 6 ? 2 : 1
  const construire = Math.max(1, Math.round((n - affuter) / 3))
  const developper = n - affuter - construire
  return [...Array(construire).fill('construire'), ...Array(developper).fill('developper'), ...Array(affuter).fill('affuter')]
}

// Plan d'entraînement : semaines × séances. Les séances sont tirées de la bibliothèque de la famille d'activité,
// phase par phase, en alternant ; un test de référence clôt la dernière semaine.
export function planEntrainement({ famille, semaines = 6, seancesParSemaine = 2, vitesseKmh = null }) {
  const lib = ENTRAINEMENTS.familles[famille]
  if (!lib) throw new Error('famille inconnue')
  const parSemaine = Math.max(1, Math.min(4, Math.round(seancesParSemaine)))
  const phases = phasesDeSemaines(semaines)
  const compteur = { construire: 0, developper: 0, affuter: 0 }
  const plan = phases.map((phase, i) => {
    const bib = lib.phases[phase]
    const seances = []
    for (let k = 0; k < parSemaine; k++) {
      const modele = bib[compteur[phase] % bib.length]
      compteur[phase]++
      seances.push({ ...modele, contenu: modele.contenu.map((l) => personnaliser(l, vitesseKmh)) })
    }
    return { semaine: i + 1, phase, nomPhase: NOM_PHASE[phase], seances }
  })
  return { famille, nom: lib.nom, securite: lib.securite, carnet: lib.carnet, roles: lib.roles, avertissement: ENTRAINEMENTS.avertissement, plan }
}

export const FAMILLES_ENTRAINEMENT = Object.keys(ENTRAINEMENTS.familles)
