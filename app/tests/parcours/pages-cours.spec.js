import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer } from './eleve.js'

// Pages de cours statiques (/cours/) : lisibles sans JavaScript ni compte, et
// reliées à l'app pour s'entraîner. Ce sont elles que Google indexe.
test('des cours en accès libre jusqu’aux exercices de l’app', async ({ page }) => {
  const erreurs = await preparer(page, null)
  await page.goto('./')
  // Nouveau visiteur : l'écran de bienvenue propose aussi les cours publics.
  await page.getByRole('dialog').getByRole('link', { name: 'Lire les cours sans inscription' }).click()
  await expect(page).toHaveURL(/\/cours\/$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Cours du bac STMG' })).toBeVisible()
  await expect(page).toHaveTitle(/Cours du bac STMG/)

  await page.getByRole('link', { name: /Gestion et Finance/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Révision Gestion et Finance — Terminale STMG' })).toBeVisible()
  await page.locator('main .chapitres a').first().click()
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('article.cours p').first()).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Fil d’Ariane' })).toContainText('Gestion et Finance')
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations.map((v) => v.id)).toEqual([])

  const titre = (await page.locator('h1').innerText()).trim()
  await page.getByRole('link', { name: 'Faire les exercices' }).click()
  await expect(page).toHaveURL(/#\/subject\/gestion-finance\/theme\/gf-t1\/chapter\/0$/)
  await expect(page.locator('main')).toContainText(titre.slice(0, 20))
  expect(erreurs).toEqual([])
})

test('une page de cours se lit sans JavaScript', async ({ browser }) => {
  const contexte = await browser.newContext({ javaScriptEnabled: false })
  const page = await contexte.newPage()
  await page.route('**/*', (r) => (['localhost', '127.0.0.1'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()))
  await page.goto('./cours/terminale/droit/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Révision Droit — Terminale STMG')
  expect(await page.locator('main .chapitres a').count()).toBeGreaterThan(20)
  await contexte.close()
})
