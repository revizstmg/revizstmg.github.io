import { test, expect } from '@playwright/test'
import { preparer, etatEleve, attendreAccueil } from './eleve.js'

// Le menu administrateur n'apparaît que pour les deux e-mails autorisés ; pour tout autre compte, /#/admin
// ressemble à une adresse inconnue. La vraie protection est dans la base (fonctions revizstmg_admin_*).
const session = (email) => ({ token: 'jeton-fictif', refresh: 'r', user: { id: '00000000-0000-4000-8000-000000000001', email, created_at: '2020-01-01T00:00:00Z' }, expires_at: 9999999999 })
const apercu = { genere: '2026-11-23T10:00:00Z', comptes: { total: 2, eleves: 2, profs: 0, terminale: 2, premiere: 0, nouveaux_7j: 2, actifs_7j: 2 }, specialites: [{ specialite: 'rh-communication', n: 2 }], inscriptions_par_jour: [{ jour: '2026-11-19', n: 2 }], visites_par_jour: [{ jour: '2026-11-19', vues: 61, visites: 12 }], pages_30j: [{ page: 'accueil', vues: 19, visites: 5 }] }

async function ouvrir(page, email, reponse) {
  await preparer(page, etatEleve())
  await page.addInitScript((s) => localStorage.setItem('stmg_session', JSON.stringify(s)), session(email))
  const appels = []
  await page.route('**/rest/v1/rpc/revizstmg_admin_*', (route) => {
    appels.push(route.request().url())
    return reponse ? route.fulfill(reponse) : route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ code: '42501', message: 'acces_refuse' }) })
  })
  await page.goto('./#/admin')
  return appels
}

test('un compte administrateur voit le tableau de bord et le lien du menu', async ({ page }) => {
  await ouvrir(page, 'gabriel.merlin2872@icloud.com', { status: 200, contentType: 'application/json', body: JSON.stringify(apercu) })
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()
  await expect(page.getByText('Visites par jour (30 jours)')).toBeVisible()
  await page.getByRole('button', { name: /menu/i }).first().click()
  await expect(page.getByRole('link', { name: /Administration/ })).toBeVisible()
})

test('un autre compte ne voit ni le lien ni la page, et ne déclenche aucun appel de données', async ({ page }) => {
  const appels = await ouvrir(page, 'eleve@exemple.fr')
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toHaveCount(0)
  await expect(page.getByText('Visites par jour (30 jours)')).toHaveCount(0)
  expect(appels).toEqual([])
  await page.getByRole('button', { name: /menu/i }).first().click()
  await expect(page.getByRole('link', { name: /Administration/ })).toHaveCount(0)
})

test('une adresse autorisée mais refusée par la base ne montre rien non plus', async ({ page }) => {
  await ouvrir(page, 'donatmatys972@gmail.com', null)
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toHaveCount(0)
  await expect(page.getByText('Visites par jour (30 jours)')).toHaveCount(0)
})

test('un administrateur change l’offre d’un compte depuis sa fiche', async ({ page }) => {
  await preparer(page, etatEleve())
  await page.addInitScript((x) => localStorage.setItem('stmg_session', JSON.stringify(x)), session('gabriel.merlin2872@icloud.com'))
  const corps = []
  const compte = { id: 'c1', role: 'eleve', nom: 'Élève Test', email: 'él***@x.fr', niveau: 'terminale-stmg', specialite: 'rh-communication', cree: '2026-11-19T10:00:00Z', maj: '2026-11-20T10:00:00Z', offre: 'gratuit', xp: 10, exercices: 1, chapitres: 1, jours_actifs: 1, temps_s: 60 }
  await page.route('**/rest/v1/rpc/revizstmg_admin_*', (route) => {
    const fn = route.request().url().split('/rpc/')[1]
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) })
    if (fn === 'revizstmg_admin_apercu') return json({ ...apercu, offres: { premium: 1, ultimate: 2, reels: 1, offerts: 2 }, signalements_ouverts: 3 })
    if (fn === 'revizstmg_admin_comptes') return json([compte])
    if (fn === 'revizstmg_admin_compte') return json({ ...compte, progression: {}, abonnement: null, ia: [] })
    if (fn === 'revizstmg_admin_abonnement') { corps.push(JSON.parse(route.request().postData())); return json({ offre: 'ultimate', periode: 'mensuel', statut: 'active', periode_fin: '2026-12-24T10:00:00Z', mode_test: false }) }
    return json({})
  })
  page.on('dialog', (d) => d.accept())
  await page.goto('./#/admin')
  await expect(page.getByText('Abonnés actifs')).toBeVisible()
  await page.getByRole('button', { name: 'Comptes', exact: true }).click()
  await page.getByRole('button', { name: /Élève Test/ }).click()
  await page.getByLabel('Passer à').selectOption('ultimate')
  await page.getByRole('button', { name: 'Appliquer' }).click()
  await expect(page.getByText('Offre Ultimate enregistrée.')).toBeVisible()
  expect(corps).toEqual([{ p_id: 'c1', p_offre: 'ultimate', p_jours: 30 }])
})

test('chaque chiffre de l’aperçu est cliquable et ouvre la liste filtrée', async ({ page }) => {
  await preparer(page, etatEleve())
  await page.addInitScript((x) => localStorage.setItem('stmg_session', JSON.stringify(x)), session('gabriel.merlin2872@icloud.com'))
  const il = (j) => new Date(Date.now() - j * 86400000).toISOString()
  const comptes = [
    { id: 'n1', role: 'eleve', nom: 'Nouvelle Inscrite', email: 'no***@x.fr', niveau: 'terminale-stmg', specialite: 'rh-communication', cree: il(2), maj: il(1), offre: 'gratuit', xp: 5, exercices: 0, chapitres: 0, jours_actifs: 1, temps_s: 10 },
    { id: 'v1', role: 'prof', nom: 'Vieux Prof', email: 'vi***@x.fr', niveau: 'premiere-stmg', specialite: null, cree: il(60), maj: il(40), offre: 'premium', xp: 50, exercices: 3, chapitres: 2, jours_actifs: 4, temps_s: 600 },
  ]
  await page.route('**/rest/v1/rpc/revizstmg_admin_*', (route) => {
    const fn = route.request().url().split('/rpc/')[1]
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) })
    if (fn === 'revizstmg_admin_apercu') return json({ ...apercu, offres: { premium: 1, ultimate: 0, reels: 0, offerts: 1 } })
    if (fn === 'revizstmg_admin_comptes') return json(comptes)
    return json({})
  })
  await page.goto('./#/admin')
  await page.getByRole('button', { name: /Nouveaux \(7 jours\)/ }).click()
  await expect(page.getByText('Nouvelle Inscrite')).toBeVisible()
  await expect(page.getByText('Vieux Prof')).toHaveCount(0)
  await expect(page.locator('.adm-puce', { hasText: 'Inscrits depuis 7 jours' })).toBeVisible()
  await page.getByRole('button', { name: 'Tout effacer' }).click()
  await expect(page.getByText('Vieux Prof')).toBeVisible()
})

test('un administrateur marque un signalement comme traité', async ({ page }) => {
  await preparer(page, etatEleve())
  await page.addInitScript((x) => localStorage.setItem('stmg_session', JSON.stringify(x)), session('gabriel.merlin2872@icloud.com'))
  const corps = []
  await page.route('**/rest/v1/rpc/revizstmg_admin_*', (route) => {
    const fn = route.request().url().split('/rpc/')[1]
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) })
    if (fn === 'revizstmg_admin_apercu') return json({ ...apercu, offres: { premium: 0, ultimate: 0, reels: 0, offerts: 0 }, signalements_ouverts: 1 })
    if (fn === 'revizstmg_admin_divers') return json({ ia: [], classes: [], social: { amis: 0, demandes: 0, classement: 0, membres_classe: 0 }, signalements: [{ id: 's1', traite: false, cree: '2026-11-20T10:00:00Z', auteur: 'Élève', page: 'cours', categorie: 'erreur', message: 'Faute dans le cours' }] })
    if (fn === 'revizstmg_admin_signalement_traite') { corps.push(JSON.parse(route.request().postData())); return json({ id: 's1', traite: true }) }
    return json({})
  })
  await page.goto('./#/admin')
  await page.getByRole('button', { name: 'Signalements', exact: true }).click()
  await page.getByRole('button', { name: /Marquer traité/ }).click()
  await expect(page.getByText('✅ Traité')).toBeVisible()
  expect(corps).toEqual([{ p_id: 's1', p_traite: true }])
})
