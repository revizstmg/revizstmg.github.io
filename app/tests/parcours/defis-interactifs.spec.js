import { test, expect } from '@playwright/test'
import { preparer, etatEleve, attendreAccueil } from './eleve.js'

// Les mini-défis QCM, intrus et vrai/faux des cours ludiques se répondent d'un toucher.
test('un mini-défi QCM donne un retour immédiat et un seul essai', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/subject/droit/theme/droit-t5/chapter/1')
  await attendreAccueil(page)
  const defi = page.locator('[data-defi]:visible').first()
  for (let i = 0; i < 8 && !(await defi.count()); i++) {
    const suivant = page.getByRole('button', { name: /Suivant/ }).first()
    if (!(await suivant.isVisible().catch(() => false))) break
    await suivant.click()
  }
  await expect(defi).toBeVisible()
  const avant = await page.evaluate(() => JSON.parse(localStorage.getItem('stmg_defis_faits') || '[]').length)
  await defi.locator('button[data-choix]').first().click()
  await expect(defi.getByRole('status')).toContainText(/Bien joué|Pas tout à fait/)
  await expect(defi.locator('button[data-choix]').first()).toBeDisabled()
  expect(avant).toBeGreaterThanOrEqual(0)
  expect(erreurs).toEqual([])
})
