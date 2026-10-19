import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Accueil, « Réviser & réussir » : un seul outil conseillé, les autres rangés
// dans la trousse, fermée tant que l'élève ne l'ouvre pas.
test('un outil conseillé, les autres dans la trousse', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ favorites: ['gf-t1'] }))
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  const section = page.locator('section', { has: page.getByRole('heading', { name: 'Réviser & réussir' }) })
  await expect(section.getByRole('link', { name: /Conseillé maintenant.*Favoris/ })).toHaveAttribute('href', '#/favoris')
  const trousse = section.getByRole('button', { name: /Ta trousse · 8 outils/ })
  await expect(trousse).toHaveAttribute('aria-expanded', 'false')
  await expect(section.getByRole('link')).toHaveCount(1)

  await trousse.click()
  await expect(section.getByRole('button', { name: 'Refermer ta trousse' })).toHaveAttribute('aria-expanded', 'true')
  await expect(section.getByRole('link')).toHaveCount(9)
  await expect(section.getByRole('link', { name: /Favoris/ })).toHaveCount(1)

  // L'appareil se souvient de la trousse ouverte.
  await page.reload()
  await attendreAccueil(page)
  await section.getByRole('link', { name: /Bac blanc/ }).click()
  await expect(page).toHaveURL(/#\/bac-blanc/)
  expect(erreurs).toEqual([])
})
