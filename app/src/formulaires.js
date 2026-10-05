// Validation des formulaires et garde-fous contre le spam.
// Ces contrôles tournent dans le navigateur : ils guident l'élève (message clair
// à côté du champ) et arrêtent les robots simples et les envois en rafale. Ils ne
// remplacent pas les règles de la base (RLS), qui restent la vraie protection.

// ---- Champs du compte ----
export const MOT_DE_PASSE_MIN = 8

export function emailValide(email) {
  const e = (email || '').trim()
  return e.length <= 80 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(e)
}

// Nouveau mot de passe : 8 caractères au moins, avec une lettre et un chiffre.
// (À la connexion, on accepte les anciens mots de passe de 6 caractères.)
export function motDePasseValide(mdp) {
  const p = mdp || ''
  return p.length >= MOT_DE_PASSE_MIN && p.length <= 72 && /\p{L}/u.test(p) && /\d/.test(p)
}

// Prénom ou nom affiché aux autres élèves : des lettres (accents compris),
// espaces, tirets et apostrophes. Pas de chiffres ni de liens.
export function nomValide(nom, { obligatoire = true } = {}) {
  const n = (nom || '').trim()
  if (!n) return !obligatoire
  // Un point seulement après une initiale (« J.-B. »), pas dans une adresse web.
  return n.length <= 40 && /^\p{L}[\p{L}\p{M}' ’.-]*$/u.test(n) && !/\.\p{L}/u.test(n) && !/(.)\1{3,}/u.test(n)
}

// ---- Messages dans les espaces partagés (mur de la classe, réponses) ----
const DELAI_ENTRE_MESSAGES = 20000 // 20 s entre deux messages d'un même espace
const DELAI_DOUBLON = 10 * 60000 // le même texte deux fois en 10 min : doublon
const CLE = 'stmg_messages_recents'
let memoire = {}

function lire() {
  try { return JSON.parse(sessionStorage.getItem(CLE) || '{}') } catch { return memoire }
}
function ecrire(v) {
  memoire = v
  try { sessionStorage.setItem(CLE, JSON.stringify(v)) } catch { /* stockage indisponible */ }
}
const normaliser = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim()

// Renvoie la clé de traduction du problème (msgEmpty, msgTooLong…), ou null si
// le message peut partir. `espace` distingue les fils (mur d'une classe…).
export function problemeMessage(espace, texte, { max = 1000, maintenant = Date.now() } = {}) {
  const t = (texte || '').trim()
  if (!t) return 'msgEmpty'
  if (t.length > max) return 'msgTooLong'
  if ((t.match(/https?:\/\/|www\./gi) || []).length > 2) return 'msgTooManyLinks'
  if (/(.)\1{14,}/u.test(t)) return 'msgRepeated'
  const dernier = lire()[espace]
  if (dernier) {
    if (maintenant - dernier.quand < DELAI_ENTRE_MESSAGES) return 'msgTooFast'
    if (normaliser(t) === dernier.texte && maintenant - dernier.quand < DELAI_DOUBLON) return 'msgDuplicate'
  }
  return null
}

export function noterMessage(espace, texte, maintenant = Date.now()) {
  ecrire({ ...lire(), [espace]: { texte: normaliser(texte), quand: maintenant } })
}

// ---- Inscription : pièges à robots ----
// Un champ invisible que seul un robot remplit, et un temps minimal : un humain
// met bien plus de 3 s à remplir les trois étapes de l'inscription.
export const TEMPS_MIN_INSCRIPTION = 3000
export function inscriptionSuspecte({ piege, debut, maintenant = Date.now() }) {
  return Boolean((piege || '').trim()) || maintenant - debut < TEMPS_MIN_INSCRIPTION
}

// ---- Connexion : pause après plusieurs échecs ----
// Après 5 échecs, 30 s d'attente (Supabase limite aussi les tentatives).
export const ECHECS_AVANT_PAUSE = 5
export const DUREE_PAUSE = 30000
export function pauseConnexion(echecs, dernierEchec, maintenant = Date.now()) {
  if (echecs < ECHECS_AVANT_PAUSE) return 0
  return Math.max(0, DUREE_PAUSE - (maintenant - dernierEchec))
}
