import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// L’accueil garde trois destinations ; les autres outils restent dans le menu.
test('accueil allégé, outils accessibles dans le menu', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ favorites: ['gf-t1'] }))
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  await expect(page.locator('.home-destinations > a')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Réviser & réussir' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Menu', exact: true })
  await menu.getByText('Plus d’outils', { exact: true }).click()
  await expect(menu.getByRole('link', { name: /Favoris/ })).toHaveAttribute('href', '#/favoris')
  await expect(menu.getByRole('link', { name: /Atelier de formules/ })).toHaveAttribute('href', '#/atelier-formules')
  await menu.getByRole('link', { name: 'Bac blanc', exact: true }).click()
  await expect(page).toHaveURL(/#\/bac-blanc/)
  expect(erreurs).toEqual([])
})
