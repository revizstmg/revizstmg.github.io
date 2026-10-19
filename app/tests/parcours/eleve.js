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

export async function preparer(page, etat = etatEleve()) {
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
  await page.addInitScript((e) => {
    if (sessionStorage.getItem('__seeded')) return
    sessionStorage.setItem('__seeded', '1')
    localStorage.setItem('stmg_reset_v2', '1')
    if (e) localStorage.setItem('stmg_progress_v2', JSON.stringify(e))
  }, etat)
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
