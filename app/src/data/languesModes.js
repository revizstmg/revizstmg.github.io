// Modes de révision des langues : logique pure (tirage, score, mise, titres, codes de défi).
// L'interface est dans components/LanguesModes.jsx ; les scénarios sont dans data/languesScenarios/<langue>.json.

// Générateur pseudo-aléatoire à graine : deux élèves avec le même code ont les mêmes questions.
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function melanger(liste, r = Math.random) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Question normalisée : { id, intro, prompt, options[], ok, why }.
// Dans les scénarios écrits à la main, options[0] est la bonne réponse : on mélange à l'affichage.
export function normaliserItem(src, r = Math.random, id = '') {
  const bonne = src.options[0]
  const options = melanger(src.options, r)
  return { id: src.id || id, intro: src.intro || null, prompt: src.prompt, options, ok: options.indexOf(bonne), why: src.why || '' }
}

// QCM du manuel de la langue (exercices à choix, sans document à lire).
export function qcmDuManuel(manuel) {
  return (manuel?.exercises || []).filter((e) => e.type === 'qcm' && e.choices?.length >= 3 && e.choices.includes(e.answer) && !e.context)
}

export function itemsManuel(manuel, n, seed) {
  const r = rng(seed)
  return melanger(qcmDuManuel(manuel), r).slice(0, n).map((e) => {
    const options = melanger(e.choices, r)
    return { id: e.id, intro: null, prompt: e.prompt, options, ok: options.indexOf(e.answer), why: e.explanation || '' }
  })
}

export function itemsScenario(liste, n, seed) {
  const r = rng(seed)
  return melanger(liste || [], r).slice(0, n).map((s, i) => normaliserItem(s, r, `s${i}`))
}

// --- Défi entre potes : un code (langue + graine) donne les mêmes 5 questions ; le score s'ajoute après un point.
export const QUESTIONS_DEFI = 5
export function creerCode(langue, alea = Math.random) {
  return `${langue}-${Math.floor(alea() * 2 ** 30).toString(36)}`
}
export function lireCode(texte) {
  const m = /^([a-z]{2})-([0-9a-z]{1,8})(?:\.(\d{1,2}))?$/.exec(String(texte || '').trim().toLowerCase())
  if (!m) return null
  return { langue: m[1], seed: parseInt(m[2], 36), code: `${m[1]}-${m[2]}`, score: m[3] === undefined ? null : Number(m[3]) }
}
export function messageDefi(code, score) {
  return `J'ai fait ${score}/${QUESTIONS_DEFI} au test du pote. Fais mieux : code ${code}.${score}`
}

// --- Combien de temps ? Le site choisit le nombre de questions.
export const DUREES = [{ minutes: 1, questions: 3 }, { minutes: 3, questions: 8 }, { minutes: 5, questions: 14 }]
export const questionsPourMinutes = (m) => (DUREES.find((d) => d.minutes === m) || DUREES[1]).questions

// --- Mise : banque virtuelle, propre à l'appareil, qui ne touche ni aux points ni à la boutique.
export const BANQUE_DEPART = 100
export const MISES = [10, 20, 50]
export const SEUIL_MISE = 4 // bonnes réponses sur 5 pour gagner
export function resoudreMise(banque, mise, bonnes) {
  const gagne = bonnes >= SEUIL_MISE
  let apres = banque + (gagne ? mise : -mise)
  let refinance = false
  if (apres < MISES[0]) { apres = 50; refinance = true }
  return { gagne, banque: apres, refinance }
}

// --- Semaine et titre.
export function lundiDe(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const jour = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - jour)
  return d.toISOString().slice(0, 10)
}
export const TITRES = [
  { min: 0, titre: 'Touriste officiel', blague: 'Tu as déjà demandé où est la gare en criant.' },
  { min: 20, titre: 'Survivant de la cantine', blague: 'Tu comprends le menu, pas le serveur.' },
  { min: 60, titre: 'Celui qui comprend la moitié', blague: 'Et qui hoche la tête pour le reste.' },
  { min: 120, titre: 'Commande sans montrer le menu', blague: 'Le serveur te respecte.' },
  { min: 200, titre: 'Local infiltré', blague: 'On te demande ton chemin dans la rue.' },
]
export function titreDeLaSemaine(points) {
  return [...TITRES].reverse().find((t) => points >= t.min) || TITRES[0]
}
export const POINTS_PAR_BONNE_REPONSE = 5

// --- Survie à l'étranger : budget, on garde le plus possible.
export const BUDGET_SURVIE = 100
export function verdictSurvie(reste) {
  if (reste >= 40) return { titre: 'Pro du voyage', texte: 'Tu rentres avec de quoi t’offrir une glace.' }
  if (reste >= 15) return { titre: 'Touriste normal', texte: 'Un peu arnaqué, mais vivant.' }
  if (reste >= 0) return { titre: 'Pigeon professionnel', texte: 'Il te reste juste de quoi acheter un billet de retour d’occasion.' }
  return { titre: 'Tu rentres à pied', texte: 'Le portefeuille est vide et le taxi t’a dit merci.' }
}

// --- Entretien : points par réponse, total sur trois points par question.
export function verdictEntretien(total, max) {
  const part = max ? total / max : 0
  if (part >= 0.8) return { titre: 'Embauché', texte: 'Ton futur manager te propose un café, pas un deuxième entretien.' }
  if (part >= 0.5) return { titre: 'On te rappelle', texte: 'Enfin, ils disent ça à tout le monde.' }
  return { titre: 'Le recruteur regarde déjà son téléphone', texte: 'Relis les réponses, la bonne était en train de te faire des signes.' }
}

// --- Stockage local (par appareil). Tout est dans un seul objet, avec des valeurs par défaut sûres.
const CLE = 'stmg_langues_modes_v1'
export function lireStock(stock = typeof localStorage === 'undefined' ? null : localStorage) {
  try {
    const v = JSON.parse(stock?.getItem(CLE) || 'null')
    if (v && typeof v === 'object') return v
  } catch { /* stockage indisponible ou abîmé */ }
  return {}
}
export function ecrireStock(v, stock = typeof localStorage === 'undefined' ? null : localStorage) {
  try { stock?.setItem(CLE, JSON.stringify(v)) } catch { /* stockage indisponible */ }
}
export function etatSemaine(stock, maintenant = new Date()) {
  const semaine = lundiDe(maintenant)
  const s = lireStock(stock)
  return { semaine, points: s.semaine === semaine ? Number(s.points) || 0 : 0, banque: Number.isFinite(s.banque) ? s.banque : BANQUE_DEPART, records: s.records || {} }
}
export function enregistrer(patch, stock, maintenant = new Date()) {
  const cur = etatSemaine(stock, maintenant)
  const suivant = { semaine: cur.semaine, points: cur.points + (patch.points || 0), banque: patch.banque ?? cur.banque, records: { ...cur.records, ...(patch.records || {}) } }
  ecrireStock(suivant, stock)
  return suivant
}
