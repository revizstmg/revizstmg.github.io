import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, etatEleve } from './eleve.js'

const RESERVE = /Réservé aux abonnés/

test('compte gratuit : cours et exercices ouverts, le reste réservé aux abonnés', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/cours')
  await expect(page.getByRole('heading', { name: RESERVE })).toHaveCount(0)
  for (const chemin of ['bac-blanc', 'revision', 'coach-ia', 'grand-oral', 'mes-notes', 'atelier-formules', 'boutique', 'classement']) {
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
