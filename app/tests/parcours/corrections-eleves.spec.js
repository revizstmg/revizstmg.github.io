import { test, expect } from '@playwright/test'
import { preparer, etatEleve, attendreAccueil } from './eleve.js'

// Retours des élèves testeurs : jeux visibles et rechargeables, défi et badges gratuits, accueil, langues.
test('un jeu ouvert survit au rechargement, le bouton Retour le ferme et « Jouer maintenant » le lance', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/0')
  await attendreAccueil(page)
  await page.getByRole('button', { name: /Exercices/ }).click()
  // Les jeux du chapitre sont visibles d'emblée, sans dérouler de menu.
  await expect(page.locator('.chapter-memorisation')).toHaveAttribute('open', '')
  await expect(page.locator('[data-jeu]').first()).toBeVisible()
  await page.locator('[data-jouer-maintenant]').click()
  // « Jouer maintenant » lance la première question sans passer par le choix du mode.
  await expect(page).toHaveURL(/\?jeu=.*mode=train|mode=train.*jeu=/)
  await expect(page.locator('[data-exercice]')).toBeVisible()
  await expect(page.getByRole('button', { name: /^Entraînement/ })).toHaveCount(0)
  await page.reload()
  await expect(page).toHaveURL(/\?jeu=/)
  await expect(page.locator('[data-exercice]')).toBeVisible()
  // Retour du navigateur : on revient au chapitre, onglet Exercices compris.
  await page.goBack()
  await expect(page).not.toHaveURL(/\?jeu=/)
  expect(erreurs).toEqual([])
})

test('le défi du jour et les badges s’ouvrent avec un compte gratuit, pas le bac blanc', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: null })
  for (const route of ['defi', 'badges']) {
    await page.goto(`./#/${route}`)
    await expect(page.getByRole('heading', { name: 'Réservé aux abonnés' })).toHaveCount(0)
  }
  await page.goto('./#/bac-blanc')
  await expect(page.getByRole('heading', { name: 'Réservé aux abonnés' })).toBeVisible()
  expect(erreurs).toEqual([])
})

test('un chapitre qui n’avait aucun exercice propose maintenant un QCM', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./#/subject/p1-droit/theme/p1-droit-t1/chapter/1')
  await attendreAccueil(page)
  await page.getByRole('button', { name: /Exercices/ }).click()
  await expect(page.getByRole('button', { name: /de quoi parle-t-on/i }).first()).toBeVisible()
  expect(erreurs).toEqual([])
})

test('les langues : les modes arrivent avant le guide et les exercices du manuel sont repliés', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/subject/langues')
  await attendreAccueil(page)
  const modes = await page.locator('section[aria-labelledby="langues-modes"]').boundingBox()
  const guide = await page.locator('.language-feature').boundingBox()
  expect(modes.y).toBeLessThan(guide.y)
  await expect(page.locator('.language-manual-exercises')).not.toHaveAttribute('open', '')
  expect(erreurs).toEqual([])
})
