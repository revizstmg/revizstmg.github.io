import { test, expect } from '@playwright/test'
import { preparer, etatEleve } from './eleve.js'

// Premier affichage : aucun texte brut avant l’écran d’accueil, et « Bienvenue »
// reste sur une seule ligne, même pendant son animation.
test('le texte de secours reste caché pendant le chargement de l’app', async ({ page }) => {
  await page.route('**/assets/index-*.js', async (route) => { await new Promise((r) => setTimeout(r, 1500)); await route.continue() })
  await page.goto('./', { waitUntil: 'commit' })
  await page.waitForSelector('#root > .public-entry', { state: 'attached' })
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#root > .public-entry')).visibility)).toBe('hidden')
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
})

test('« Bienvenue » ne se coupe jamais, du premier au dernier instant', async ({ page }) => {
  await preparer(page, etatEleve(), { bienvenue: true })
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('./')
  const titre = page.locator('.welcome-title')
  await titre.waitFor({ state: 'attached' })
  for (let i = 0; i < 8; i++) {
    const ok = await page.evaluate(() => {
      const h = document.querySelector('.welcome-title')
      const r = document.createRange(); r.selectNodeContents(h)
      return r.getClientRects().length === 1 && r.getBoundingClientRect().width <= h.closest('button').getBoundingClientRect().width
    })
    expect(ok).toBe(true)
    await page.waitForTimeout(250)
  }
})
