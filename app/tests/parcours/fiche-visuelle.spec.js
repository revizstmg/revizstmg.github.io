import { test, expect } from '@playwright/test'
import { preparer, etatEleve } from './eleve.js'

// La fiche PDF d'un chapitre commence par une page visuelle (idées, carte mentale, mots à connaître) :
// invisible à l'écran, présente à l'impression, et absente hors français.
test('la fiche visuelle est cachée à l’écran et visible à l’impression', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/subject/droit/theme/droit-t5/chapter/1')
  await expect(page.locator('.terme-clic').first()).toBeVisible({ timeout: 15000 })
  const fiche = page.locator('.fiche-visuelle')
  await expect(fiche).toHaveCount(1)
  await expect(fiche).toBeHidden()
  await page.emulateMedia({ media: 'print' })
  await expect(fiche).toBeVisible()
  await expect(fiche.locator('.fiche-bandeau-titre')).not.toBeEmpty()
  await expect(fiche.locator('.fiche-idees li').first()).toBeVisible()
  await expect(fiche.locator('svg.fiche-carte')).toBeVisible()
  await expect(fiche.locator('.fiche-mots li').first()).toBeVisible()
  // Un seul en-tête : l'ancien est masqué quand la fiche visuelle est là.
  await expect(page.locator('.fiche-visuelle ~ .print-header').first()).toBeHidden()
  expect(erreurs).toEqual([])
})
