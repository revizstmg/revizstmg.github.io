import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, etatEleve } from './eleve.js'

const RESERVE = /Réservé aux abonnés/

test('compte gratuit : cours et exercices ouverts, le reste réservé aux abonnés', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/cours')
  await expect(page.getByRole('heading', { name: RESERVE })).toHaveCount(0)
  for (const chemin of ['bac-blanc', 'revision', 'coach-ia', 'grand-oral', 'mes-notes', 'atelier-formules', 'classement']) {
    await page.goto(`./#/${chemin}`)
    await expect(page.getByRole('heading', { name: RESERVE }), chemin).toBeVisible()
  }
  await page.goto('./#/subject/gestion')
  await expect(page.getByRole('heading', { name: RESERVE })).toHaveCount(0)
  await page.goto('./#/bac-blanc')
  await page.getByRole('link', { name: 'Voir les offres' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Les offres, simplement' })).toBeVisible()
  expect(erreurs).toEqual([])
})

test('page réservée : accessible et sans débord à 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/bac-blanc')
  await expect(page.getByRole('heading', { name: RESERVE })).toBeVisible()
  expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

for (const offre of ['premium', 'ultimate']) {
  test(`abonné ${offre} : les pages réservées s’ouvrent, même sans réseau`, async ({ page }) => {
    const erreurs = await preparer(page, etatEleve(), { abonnement: offre })
    for (const chemin of ['bac-blanc', 'revision', 'grand-oral', 'mes-notes']) {
      await page.goto(`./#/${chemin}`)
      await expect(page.getByRole('heading', { name: RESERVE }), chemin).toHaveCount(0)
    }
    expect(erreurs).toEqual([])
  })
}

test('abonnement résilié côté serveur : l’accès se referme', async ({ page }) => {
  await preparer(page, etatEleve(), { abonnement: 'premium' })
  await page.route('**/functions/v1/revizstmg-paiement', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ mode: 'test', abonnement: { statut: 'canceled', offre: 'premium' } }) }))
  await page.goto('./#/bac-blanc')
  await expect(page.getByRole('heading', { name: RESERVE })).toHaveCount(0)
  await page.goto('./#/offres')
  await expect(page.getByText('Mode test.')).toBeVisible()
  await page.goto('./#/bac-blanc')
  await expect(page.getByRole('heading', { name: RESERVE })).toBeVisible()
})

test('ancien compte sans abonnement : accès offert pendant la période de grâce, avec bandeau', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: null })
  // Date figée : la période de grâce (30/11/2026) ne doit pas faire échouer ce test plus tard.
  await page.clock.setFixedTime(new Date('2026-10-29T12:00:00Z'))
  await page.addInitScript(() => {
    const s = JSON.parse(localStorage.getItem('stmg_session'))
    s.user.created_at = '2026-10-01T10:00:00Z'
    localStorage.setItem('stmg_session', JSON.stringify(s))
  })
  await page.goto('./#/bac-blanc')
  await expect(page.getByRole('heading', { name: RESERVE })).toHaveCount(0)
  await expect(page.getByRole('status').filter({ hasText: 'Accès offert jusqu’au' })).toContainText('30 novembre 2026')
  await expect(page.getByRole('status').getByRole('link', { name: 'Voir les offres' })).toBeVisible()
  expect(erreurs).toEqual([])
})

test('adresse en majuscules ou encodée : le mur s’applique quand même', async ({ page }) => {
  await preparer(page, etatEleve(), { abonnement: null })
  for (const chemin of ['Bac-Blanc', 'BAC-BLANC/', '%62ac-blanc', 'Revision']) {
    await page.goto(`./#/${chemin}`)
    await expect(page.getByRole('heading', { name: RESERVE }), chemin).toBeVisible()
  }
})

test('le mur donne le prix, un retour vers les cours et un moyen de relire son abonnement', async ({ page }) => {
  const appels = []
  await preparer(page, etatEleve(), { abonnement: null })
  await page.route('**/functions/v1/revizstmg-paiement', (route) => { appels.push(1); return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ mode: 'test', abonnement: null }) }) })
  await page.goto('./#/bac-blanc')
  await expect(page.getByText(/à partir de 9,99\s*€\s*TTC par mois/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Retour aux cours' })).toBeVisible()
  const avant = appels.length
  await page.getByRole('button', { name: 'Vérifier à nouveau mon abonnement' }).click()
  await expect.poll(() => appels.length).toBeGreaterThan(avant)
  await page.getByRole('link', { name: 'Retour aux cours' }).click()
  await expect(page.getByRole('heading', { name: RESERVE })).toHaveCount(0)
})

test('paiement qui arrive en retard : l’accès s’ouvre à la relecture, sans recharger la page', async ({ page }) => {
  let abonne = false
  await preparer(page, etatEleve(), { abonnement: null })
  await page.route('**/functions/v1/revizstmg-paiement', (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ mode: 'test', abonnement: abonne ? { statut: 'active', offre: 'premium', periode: 'mensuel', periode_fin: '2999-01-01T00:00:00Z', mode_test: true } : null }) }))
  await page.goto('./#/bac-blanc')
  await expect(page.getByRole('heading', { name: RESERVE })).toBeVisible()
  abonne = true
  await page.getByRole('button', { name: 'Vérifier à nouveau mon abonnement' }).click()
  await expect(page.getByRole('heading', { name: RESERVE })).toHaveCount(0)
})

test('compte gratuit : un repère « Premium » signale les pages réservées dans le menu', async ({ page }) => {
  await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/accueil')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  const menu = page.getByRole('dialog')
  await expect(menu.getByRole('link', { name: /Bac blanc/ })).toContainText('Premium')
  await expect(menu.getByRole('link', { name: /Cours/ }).first()).not.toContainText('Premium')
  await expect(menu.getByRole('link', { name: 'Mon abonnement' })).toBeVisible()
})

test('abonné : aucun repère « Premium » dans le menu', async ({ page }) => {
  await preparer(page, etatEleve(), { abonnement: 'premium' })
  await page.goto('./#/accueil')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await expect(page.getByRole('dialog').getByRole('link', { name: /Bac blanc/ })).not.toContainText('Premium')
})

test('offres : les prix sont affichés à tous, sans être connecté ni abonné', async ({ page }) => {
  await preparer(page, etatEleve({ account: null }), { abonnement: null })
  await page.goto('./#/offres')
  await expect(page.getByText('0 €, sans carte bancaire')).toBeVisible()
  await expect(page.getByText('9,99 € TTC par mois ou 90 € TTC par an')).toBeVisible()
  await expect(page.getByText('14,99 € TTC par mois ou 130 € TTC par an')).toBeVisible()
})
