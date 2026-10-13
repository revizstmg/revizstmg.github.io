import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil } from './eleve.js'

// Un chapitre propose une dizaine d'exercices tirés de son cours ; les nouvelles
// formes (memory, QCM du mot manquant, quiz du chapitre) s'ouvrent et se jouent.
test('chapitre : une dizaine d’exercices, dont memory, mot manquant et quiz mêlé', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/droit/theme/droit-t5/chapter/1')
  await page.getByRole('button', { name: /Exercices/ }).click()
  const liste = page.locator('main button', { hasText: /QCM|Vrai ou faux|Association|Memory|Écris|Texte à trous|Complète|Cas concrets|Quiz du chapitre|Flashcards/ })
  await expect.poll(() => liste.count()).toBeGreaterThanOrEqual(10)

  for (const [nom, attendu] of [[/Memory — notions du chapitre/, /paires/i], [/QCM — le mot manquant/, /Question 1 \//], [/Quiz du chapitre — questions mêlées/, /Question 1 \//]]) {
    await page.getByRole('button', { name: nom }).first().click()
    const entrainement = page.getByRole('button', { name: /Entraînement/ })
    await page.waitForTimeout(300)
    if (await entrainement.count()) await entrainement.click()
    // Le jeu s'affiche : les cartes du memory, ou la première question.
    await expect(page.locator('main')).toContainText(attendu)
    await page.getByRole('button', { name: /Quitter/ }).click()
  }
  expect(erreurs).toEqual([])
})
