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

export const NIVEAUX = ['gratuit', 'premium', 'ultimate']

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

export const estPagePayante = (chemin) =>
  PAGES_PAYANTES.some((p) => chemin === p || chemin.startsWith(`${p}/`))

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
  return niveauCompte(s && s.uid === id ? s.ligne : null, getSession()?.user?.created_at)
}

// Date de fin de la période de grâce d'un ancien compte sans abonnement (sinon null) : sert au bandeau.
export function graceJusqua() {
  const id = compteCourant()
  if (!id) return null
  const s = lireStock()
  if (niveauDe(s && s.uid === id ? s.ligne : null) !== 'gratuit') return null
  return enGrace(getSession()?.user?.created_at) ? GRACE_JUSQUA : null
}

// Demande l'état au serveur. En cas d'échec (hors ligne, fonction absente), on garde
// ce qui est déjà connu : un abonné ne perd pas son accès faute de réseau.
let enCours = null
export function rafraichirAcces({ force = false } = {}) {
  const id = compteCourant()
  if (!id || !isSignedIn()) { if (lireStock()) ecrireStock(null); return Promise.resolve('gratuit') }
  const s = lireStock()
  if (!force && s?.uid === id && Date.now() - (s.verifieLe || 0) < FRAICHEUR_MS) return Promise.resolve(niveauAcces())
  if (enCours) return enCours
  enCours = lireEtatPaiement()
    .then((etat) => { ecrireStock({ uid: id, ligne: etat?.abonnement || null, verifieLe: Date.now() }) })
    .catch(() => { /* on garde l'état connu */ })
    .then(() => { enCours = null; return niveauAcces() })
  return enCours
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
function lireMois() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE_MOIS) || 'null')
    return v && v.mois === moisCourant() && v.n && typeof v.n === 'object' ? v : { mois: moisCourant(), n: {} }
  } catch { return { mois: moisCourant(), n: {} } }
}
export const utilisationsMois = (id) => lireMois().n[id] || 0

// Vérifie l'accès (la suite d'une utilisation déjà comptée passe sans nouveau compte). Lève « abonnement_requis » ou « quota_mensuel ».
// Avec { suite: true } (correction d'un contrôle déjà demandé, message suivant d'une
// discussion…), l'accès est vérifié mais l'utilisation n'est pas comptée une seconde fois.
// Renvoie une fonction `valider` à appeler quand le serveur a répondu : l'utilisation du
// mois n'est comptée qu'en cas de succès (une panne ne coûte pas son seul essai à un abonné).
export function reserverAccesIA(id, { suite = false, niveau = niveauAcces() } = {}) {
  const quota = QUOTA_IA_MENSUEL[niveau]
  if (quota === 0) throw new Error('abonnement_requis')
  if (quota == null || suite) return () => {}
  if (utilisationsMois(id) >= quota) throw new Error('quota_mensuel')
  let fait = false
  return () => {
    if (fait) return
    fait = true
    const m = lireMois()
    try { localStorage.setItem(CLE_MOIS, JSON.stringify({ mois: m.mois, n: { ...m.n, [id]: (m.n[id] || 0) + 1 } })) } catch { /* stockage indisponible */ }
  }
}
