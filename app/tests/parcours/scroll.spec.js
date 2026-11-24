import { test, expect } from '@playwright/test'
import { preparer, etatEleve } from './eleve.js'

// Mode Scroll : un contenu par écran, ouvert à tous (aucun abonnement requis).
test('choisir un thème, faire défiler, retourner une flashcard et répondre à une question', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/scroll')
  await expect(page.getByRole('heading', { name: 'Révise en faisant défiler' })).toBeVisible()
  await page.locator('summary', { hasText: 'Gestion' }).first().click()
  await page.getByRole('link').filter({ hasText: /./ }).locator('visible=true').nth(0).waitFor()
  await page.locator('a[href^="#/scroll/gestion-finance/"]').first().click()
  const flux = page.getByRole('region', { name: 'Mode Scroll' })
  await expect(flux).toBeVisible()
  await expect(flux.getByText('📘 L’essentiel').first()).toBeVisible()
  const cartes = flux.locator('.scroll-carte')
  expect(await cartes.count()).toBeGreaterThan(5)
  // défiler jusqu'à la première flashcard et la retourner
  const flash = flux.locator('.scroll-flash').first()
  await flash.scrollIntoViewIfNeeded()
  await flash.click()
  await expect(flash).toHaveAttribute('aria-pressed', 'true')
  // défiler jusqu'à la première question, y répondre
  const choix = flux.locator('.scroll-choix button').first()
  await choix.scrollIntoViewIfNeeded()
  await choix.click()
  await expect(flux.getByRole('status').first()).toBeVisible()
  await page.screenshot({ path: '/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/scroll-qcm.png' })
  await flux.getByRole('button', { name: 'Fermer le mode scroll' }).click()
  await expect(page.getByRole('heading', { name: 'Révise en faisant défiler' })).toBeVisible()
  expect(erreurs).toEqual([])
})
