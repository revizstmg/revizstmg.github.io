// Niveau d'accès d'un compte : gratuit, Premium ou Ultimate.
//
// - Gratuit : les cours et les exercices de base (voir PAGES_PAYANTES pour ce qui ne l'est pas).
// - Premium : tout le reste du site, et chaque fonction d'IA une fois par mois.
// - Ultimate : comme Premium, avec l'IA presque illimitée (garde-fou journalier de ia.js).
//
// L'abonnement vient de la table revizstmg_abonnements (fonction revizstmg-paiement).
// Pour les pages, ce contrôle guide l'élève dans le navigateur (le contenu statique du site
// est public : rien ne peut le cacher). Pour l'IA, l'abonnement et le quota sont refaits côté
// serveur (supabase/functions/examen-blanc/acces.js), que le navigateur ne peut pas contourner.
import { QUOTA_IA_MENSUEL, niveauDe, niveauCompte, enGrace, GRACE_JUSQUA } from '../../../supabase/functions/examen-blanc/acces.js'
import { getSession, isSignedIn } from '../auth.js'
import { lireEtatPaiement } from './abonnement.js'

// Une seule liste : tout chemin qui commence par l'un de ces préfixes demande un abonnement.
// Restent gratuits : accueil, cours, matières et chapitres, missions (exercices), favoris,
// programme, profil, paramètres, offres, FAQ, guide, pages légales, la présentation des vacances
// et les espaces classe et parent (réservés aux professeurs et aux parents, sans abonnement d'élève).
export const PAGES_PAYANTES = [
  '/seance', '/parcours', '/mes-notes', '/badges', '/coach', '/coach-ia', '/revision',
  '/excellence-economique', '/bac-blanc', '/grand-oral', '/etude-de-gestion',
  '/fiches-photo', '/defi', '/atelier-formules', '/methodo', '/boutique', '/classement', '/amis',
]
// Pages payantes qui demandent d'abord un compte : un visiteur sans compte voit l'invitation
// à en créer un (rendue par la page) plutôt que l'écran d'abonnement.
export const PAGES_AVEC_COMPTE = ['/amis', '/classement']

// L'adresse est comparée sans tenir compte de la casse, des « % » ni des barres doublées :
// le routeur les accepte tous (/Bac-Blanc, /%62ac-blanc, /bac-blanc/ ouvrent la même page).
export function normaliserChemin(chemin) {
  let c = String(chemin || '')
  try { c = decodeURIComponent(c) } catch { /* adresse mal encodée : on la garde telle quelle */ }
  return c.toLowerCase().replace(/\/{2,}/g, '/')
}
const sous = (liste, chemin) => { const c = normaliserChemin(chemin); return liste.some((p) => c === p || c.startsWith(`${p}/`)) }
export const estPagePayante = (chemin) => sous(PAGES_PAYANTES, chemin)
export const estPageAvecCompte = (chemin) => sous(PAGES_AVEC_COMPTE, chemin)

// Quotas et niveau d'un abonnement : mêmes règles que le serveur (supabase/functions/examen-blanc/acces.js),
// qui seul fait foi pour l'IA ; ici elles servent à guider l'élève sans attendre le réseau.
export { QUOTA_IA_MENSUEL, niveauDe, GRACE_JUSQUA }

const CLE = 'stmg_acces'
const EVENEMENT = 'stmg-acces-change'
const FRAICHEUR_MS = 5 * 60 * 1000

function lireStock() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || 'null')
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}
function ecrireStock(v) {
  try { if (v) localStorage.setItem(CLE, JSON.stringify(v)); else localStorage.removeItem(CLE) } catch { /* stockage indisponible */ }
  window.dispatchEvent(new Event(EVENEMENT))
}

const compteCourant = () => getSession()?.user?.id || null

// Niveau du compte connecté, lu sur l'appareil (sans réseau) : sert aussi hors ligne.
export function niveauAcces() {
  const id = compteCourant()
  const s = lireStock()
  if (!id) return 'gratuit'
  // Hors ligne, un renouvellement a pu avoir lieu sans qu'on le sache : on tolère trois jours de plus.
  const maintenant = typeof navigator !== 'undefined' && navigator.onLine === false ? Date.now() - 3 * 86400000 : Date.now()
  return niveauCompte(s && s.uid === id ? s.ligne : null, getSession()?.user?.created_at, maintenant)
}

// Vrai quand l'abonnement de ce compte a déjà été lu sur le serveur (sinon « gratuit » n'est qu'une supposition).
export function accesConnu() {
  const s = lireStock()
  return !!s && s.uid === compteCourant() && (s.verifieLe || 0) > 0
}

// Date de fin de la période de grâce d'un ancien compte sans abonnement (sinon null) : sert au bandeau.
export function graceJusqua() {
  const id = compteCourant()
  if (!id) return null
  const s = lireStock()
  if (niveauDe(s && s.uid === id ? s.ligne : null) !== 'gratuit') return null
  return enGrace(getSession()?.user?.created_at) ? GRACE_JUSQUA : null
}

// Demande l'état au serveur. En cas d'échec (hors ligne, fonction absente, délai dépassé), on garde
// ce qui est déjà connu : un abonné ne perd pas son accès faute de réseau.
export const DELAI_ACCES_MS = 8000
let enCours = null, enCoursPour = null
export function rafraichirAcces({ force = false } = {}) {
  const id = compteCourant()
  if (!id || !isSignedIn()) { if (lireStock()) ecrireStock(null); return Promise.resolve('gratuit') }
  const s = lireStock()
  if (!force && s?.uid === id && Date.now() - (s.verifieLe || 0) < FRAICHEUR_MS) return Promise.resolve(niveauAcces())
  if (enCours && enCoursPour === id) return enCours
  enCoursPour = id
  const delai = new Promise((_, refus) => setTimeout(() => refus(new Error('timeout')), DELAI_ACCES_MS))
  const courant = Promise.race([lireEtatPaiement(), delai])
    // Un compte qui s'est déconnecté entre-temps n'écrit rien : jamais l'abonnement de A pour B.
    .then((etat) => { if (compteCourant() === id) ecrireStock({ uid: id, ligne: etat?.abonnement || null, verifieLe: Date.now() }) })
    .catch(() => { /* on garde l'état connu */ })
    .then(() => { if (enCours === courant) { enCours = null; enCoursPour = null } return niveauAcces() })
  enCours = courant
  return courant
}

// Enregistre l'abonnement que la page des offres vient de lire (même état que le serveur).
export function memoriserAbonnement(ligne) {
  const id = compteCourant()
  if (id) ecrireStock({ uid: id, ligne: ligne || null, verifieLe: Date.now() })
}

export function abonnerAcces(listener) {
  window.addEventListener(EVENEMENT, listener)
  window.addEventListener('stmg-session-change', listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(EVENEMENT, listener)
    window.removeEventListener('stmg-session-change', listener)
    window.removeEventListener('storage', listener)
  }
}

// Utilisation mensuelle de chaque fonction d'IA, gardée sur l'appareil.
const CLE_MOIS = 'stmg_ia_mois'
const moisCourant = () => new Date().toISOString().slice(0, 7)
// Le compteur appartient à un compte : un autre compte sur le même appareil repart de zéro.
function lireMois() {
  const vide = { mois: moisCourant(), uid: compteCourant(), n: {} }
  try {
    const v = JSON.parse(localStorage.getItem(CLE_MOIS) || 'null')
    return v && v.mois === moisCourant() && v.uid === compteCourant() && v.n && typeof v.n === 'object' ? v : vide
  } catch { return vide }
}
export const utilisationsMois = (id) => lireMois().n[id] || 0

// Vérifie l'accès (la suite d'une utilisation déjà comptée passe sans nouveau compte). Lève « abonnement_requis » ou « quota_mensuel ».
// Avec { suite: true } (correction d'un contrôle déjà demandé, message suivant d'une
// discussion…), l'accès est vérifié mais l'utilisation n'est pas comptée une seconde fois.
// Renvoie une fonction `valider` à appeler quand le serveur a répondu : l'utilisation du
// mois n'est comptée qu'en cas de succès (une panne ne coûte pas son seul essai à un abonné).
export function reserverAccesIA(id, { suite = false, niveau = niveauAcces() } = {}) {
  const quota = QUOTA_IA_MENSUEL[niveau]
  // « Gratuit » n'est qu'une supposition tant que l'abonnement n'a pas été lu : le serveur décidera (402).
  if (quota === 0) { if (accesConnu()) throw new Error('abonnement_requis'); return () => {} }
  if (quota == null || suite) return () => {}
  if (utilisationsMois(id) >= quota) throw new Error('quota_mensuel')
  let fait = false
  return () => {
    if (fait) return
    fait = true
    const m = lireMois()
    try { localStorage.setItem(CLE_MOIS, JSON.stringify({ mois: m.mois, uid: m.uid, n: { ...m.n, [id]: (m.n[id] || 0) + 1 } })) } catch { /* stockage indisponible */ }
  }
}
