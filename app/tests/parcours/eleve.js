import { todayKey } from '../../src/data/srs.js'

// Prépare un navigateur « élève déjà inscrit », sans aucun accès réseau
// extérieur (Supabase, polices…) : les tests ne touchent jamais la vraie base.
// Jour du calendrier de l'appareil, comme l'application (src/data/srs.js).
export const AUJOURDHUI = todayKey()

export function etatEleve(extra = {}) {
  return {
    profile: { firstName: 'Léa', lastName: 'Test' },
    // Un compte (fictif) : sans lui, l'élève serait en « essai sans compte »
    // et les espaces partagés (classe, amis) l'inviteraient à s'inscrire.
    account: { id: '00000000-0000-4000-8000-000000000001', email: 'lea@test.fr', role: 'eleve' },
    track: { level: 'terminale-stmg', specialty: 'gestion-finance' },
    onboarded: true,
    streak: { count: 1, last: AUJOURDHUI },
    ...extra,
  }
}

// Abonnement de l'élève de test : Premium par défaut (le bac blanc, la révision, etc.
// en dépendent). `abonnement: null` simule un compte gratuit ; 'ultimate' l'offre complète.
const ligneAbonnement = (offre) => ({ statut: 'active', offre, periode: 'mensuel', periode_fin: '2999-01-01T00:00:00Z', mode_test: true })

export async function preparer(page, etat = etatEleve(), { bienvenue = false, abonnement = 'premium' } = {}) {
  // Les tests de Bienvenue optent explicitement pour une session neuve.
  if (!bienvenue && etat?.onboarded) await page.addInitScript(id => sessionStorage.setItem(`revizstmg-welcome:${id}`, "1"), etat.account?.id || "trial")
  const erreurs = []
  page.on('pageerror', (e) => erreurs.push(`exception : ${e.message}`))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    // Requêtes externes volontairement bloquées par le test.
    if (/ERR_FAILED|ERR_BLOCKED|ERR_INTERNET|Failed to fetch|Failed to load resource|net::/i.test(t)) return
    erreurs.push(`console : ${t}`)
  })
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.protocol === 'data:' || url.protocol === 'blob:') return route.continue()
    return route.abort('blockedbyclient')
  })
  // L'état d'abonnement renvoyé par le serveur (revient aussi après une déconnexion puis reconnexion).
  // Un test qui simule lui-même cette fonction l'emporte : il est enregistré après.
  await page.route('**/functions/v1/revizstmg-paiement', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ mode: 'test', abonnement: abonnement ? ligneAbonnement(abonnement) : null }) }))
  await page.addInitScript(([e, ligne]) => {
    if (sessionStorage.getItem('__seeded') || window.name.includes('__revizstmg_parcours_seeded__')) return
    window.name += '__revizstmg_parcours_seeded__'
    sessionStorage.setItem('__seeded', '1')
    localStorage.setItem('stmg_reset_v2', '1')
    if (e) localStorage.setItem('stmg_progress_v2', JSON.stringify(e))
    // Un profil local ne suffit pas à authentifier les espaces sociaux.
    if(e?.account?.id && ligne)localStorage.setItem('stmg_acces',JSON.stringify({uid:e.account.id,ligne,verifieLe:Date.now()}))
    if(e?.account?.id && !localStorage.getItem('stmg_session'))localStorage.setItem('stmg_session',JSON.stringify({token:'jeton-fictif-parcours',refresh:'renouvellement-fictif',user:{id:e.account.id,email:e.account.email},expires_at:9999999999}))
  }, [etat, abonnement ? ligneAbonnement(abonnement) : null])
  return erreurs
}

// L'écran « Bienvenue » s'affiche ~5 s à chaque ouverture pour un élève inscrit.
export async function attendreAccueil(page) {
  await page.waitForFunction(() => !document.querySelector('.welcome-cta, [class*="welcome"]') || document.body.style.overflow !== 'hidden', null, { timeout: 15000 })
  await page.waitForTimeout(300)
}

export async function etat(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('stmg_progress_v2') || '{}'))
}
