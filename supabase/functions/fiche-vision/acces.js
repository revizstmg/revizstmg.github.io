// Accès aux fonctions d'IA, côté serveur : seul contrôle qu'un navigateur ne peut pas
// contourner. Le site affiche un écran « Réservé aux abonnés », mais c'est ici que
// l'abonnement est lu (table revizstmg_abonnements) et que l'utilisation est comptée
// (table revizstmg_ia_usage, fonctions revizstmg_ia_reserver / revizstmg_ia_rendre).
//
// - gratuit : aucune IA (402 « abonnement_requis »).
// - Premium : chaque fonction une fois par mois (403 « quota_mensuel » ensuite) ; les
//   étapes qui prolongent une utilisation (correction, discussion en cours) ont un petit
//   plafond mensuel à part, pour qu'on ne puisse pas les appeler sans l'étape initiale.
// - Ultimate : pas de quota mensuel.
// - Tous : garde-fou de 60 demandes par jour (429 « rate_limit »).
//
// Ce fichier est dupliqué dans fiche-vision (un déploiement ne contient que son dossier) :
// tests/acces-serveur.test.js vérifie que les deux copies sont identiques.
export const QUOTA_IA_MENSUEL = { gratuit: 0, premium: 1, ultimate: null }
export const LIMITE_IA_PAR_JOUR = 60
// Étapes de suite par mois et par fonction en Premium (message suivant du tuteur, correction…).
export const SUITES_PREMIUM = { tuteur: 20, controle: 3, examen: 6 }
const SUITES_PAR_DEFAUT = 5
const STATUTS_ACTIFS = ['active', 'trialing', 'past_due']

// Même règle que estActif (revizstmg-paiement/logique.js) : statut actif et période non échue.
export function niveauDe(ligne, maintenant = Date.now()) {
  const actif = !!ligne && STATUTS_ACTIFS.includes(ligne.statut) &&
    (!ligne.periode_fin || new Date(ligne.periode_fin).getTime() > maintenant - 86400000)
  return actif && (ligne.offre === 'premium' || ligne.offre === 'ultimate') ? ligne.offre : 'gratuit'
}

// Période de grâce : les comptes créés avant l'ouverture des abonnements gardent exactement l'accès
// qu'ils ont aujourd'hui (niveau Ultimate : tous les outils, IA comme avant) jusqu'à la date de fin.
// Décision du propriétaire (29/10/2026) : environ 30 jours.
export const COMPTES_ANTERIEURS_A = '2026-11-01T00:00:00Z'
export const GRACE_JUSQUA = '2026-11-30T00:00:00Z'
export function enGrace(creeLe, maintenant = Date.now()) {
  const c = Date.parse(creeLe)
  return Number.isFinite(c) && c < Date.parse(COMPTES_ANTERIEURS_A) && maintenant < Date.parse(GRACE_JUSQUA)
}
// Niveau d'un compte : son abonnement, sinon Ultimate pendant la période de grâce d'un ancien compte.
export function niveauCompte(ligne, creeLe, maintenant = Date.now()) {
  const niveau = niveauDe(ligne, maintenant)
  return niveau === 'gratuit' && enGrace(creeLe, maintenant) ? 'ultimate' : niveau
}

// Fonction d'IA (FONCTIONS_IA du site) et caractère « suite » d'une requête d'examen-blanc.
export function fonctionIA(corps) {
  switch (corps?.action) {
    case 'practice': return { id: 'serie', suite: false }
    case 'excellence': return { id: 'excellence', suite: false }
    case 'control': return { id: 'controle', suite: corps.step !== 'prepare' }
    case 'tutor': return { id: 'tuteur', suite: (corps.messages?.length || 0) > 1 }
    case 'study': return { id: 'etude', suite: false }
    case 'plan': case 'grade': return { id: 'examen', suite: true }
    default: return { id: 'examen', suite: false }
  }
}

const refus = (status, error) => ({ ok: false, status, error })

// Réserve l'accès avant tout appel au fournisseur d'IA. Renvoie { ok: true, rendre } (à appeler
// si l'appel échoue : l'utilisation n'est pas perdue) ou { ok: false, status, error }.
// Sans clé de service ou si la base ne répond pas, l'accès est refusé : jamais d'IA gratuite par défaut.
export async function reserverAccesIA({ env, fetcher = fetch, userId, creeLe, id, suite, maintenant = Date.now() }) {
  const base = env('SUPABASE_URL'), cle = env('SUPABASE_SERVICE_ROLE_KEY')
  if (!base || !cle) return refus(503, 'not_configured')
  const entetes = { apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' }
  const appeler = async (chemin, init) => {
    const r = await fetcher(`${base}/rest/v1/${chemin}`, { ...init, headers: entetes, signal: AbortSignal.timeout(10000) })
    if (!r.ok) throw new Error(`base_${r.status}`)
    const t = await r.text()
    return t ? JSON.parse(t) : null
  }
  const reserver = (fonction, periode, max) => appeler('rpc/revizstmg_ia_reserver', {
    method: 'POST', body: JSON.stringify({ p_user: userId, p_fonction: fonction, p_periode: periode, p_max: max }) })
  const rendreUne = (fonction, periode) => appeler('rpc/revizstmg_ia_rendre', {
    method: 'POST', body: JSON.stringify({ p_user: userId, p_fonction: fonction, p_periode: periode }) })
  const prises = []
  const rendre = async () => { for (const [f, p] of prises.splice(0)) { try { await rendreUne(f, p) } catch { /* meilleur effort */ } } }
  try {
    const lignes = await appeler(`revizstmg_abonnements?user_id=eq.${encodeURIComponent(userId)}&select=statut,offre,periode_fin`)
    const niveau = niveauCompte(Array.isArray(lignes) ? lignes[0] : null, creeLe, maintenant)
    const quota = QUOTA_IA_MENSUEL[niveau]
    if (quota === 0) return refus(402, 'abonnement_requis')
    const iso = new Date(maintenant).toISOString()
    const mois = iso.slice(0, 7), jour = iso.slice(0, 10)
    if (quota != null) {
      const fonction = suite ? `${id}:suite` : id
      const max = suite ? (SUITES_PREMIUM[id] ?? SUITES_PAR_DEFAUT) : quota
      if (!(await reserver(fonction, mois, max))) return refus(403, 'quota_mensuel')
      prises.push([fonction, mois])
    }
    if (!(await reserver('_jour', jour, LIMITE_IA_PAR_JOUR))) { await rendre(); return refus(429, 'rate_limit') }
    prises.push(['_jour', jour])
    return { ok: true, niveau, rendre }
  } catch {
    await rendre()
    return refus(502, 'server_error')
  }
}
