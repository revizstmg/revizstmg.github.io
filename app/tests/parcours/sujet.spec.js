import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil } from './eleve.js'

// Bac blanc : un sujet au format de l'épreuve s'ouvre, avec ses documents et son
// chronomètre de 4 h.
test('sujet Droit et économie au format de l’épreuve', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/bac-blanc')
  await expect(page.getByRole('heading', { name: /Sujet au format de l’épreuve/ })).toBeVisible()
  await page.getByRole('button', { name: /Droit et économie/ }).click()
  await expect(page.locator('main')).toContainText('Partie 1 — Droit')
  await expect(page.locator('main')).toContainText(/partie 1 sur 2/)
  await expect(page.locator('main')).toContainText(/⏱ [34] h \d\d/)
  await expect(page.locator('main')).toContainText(/Document 1/)
  await page.screenshot({ path: '/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/sujet.png' })
  expect(erreurs).toEqual([])
})
