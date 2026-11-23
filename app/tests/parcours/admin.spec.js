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
