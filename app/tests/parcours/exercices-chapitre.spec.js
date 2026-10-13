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

// Maths : même un « exemple traité » propose un calcul, et chaque partie tire
// de nouveaux nombres.
test('maths : calculs du chapitre, de nouveaux nombres à chaque partie', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/maths/theme/math-c1/chapter/3')
  await page.getByRole('button', { name: /Exercices/ }).click()
  const enonces = []
  for (let partie = 0; partie < 2; partie++) {
    await page.getByRole('button', { name: /Calculs du chapitre/ }).first().click()
    const entrainement = page.getByRole('button', { name: /Entraînement/ })
    await page.waitForTimeout(300)
    if (await entrainement.count()) await entrainement.click()
    const enonce = page.locator('main p.whitespace-pre-line').first()
    await expect(enonce).toBeVisible()
    enonces.push(await enonce.innerText())
    await page.getByRole('button', { name: /Quitter/ }).click()
  }
  expect(enonces[0]).not.toEqual(enonces[1])
  expect(erreurs).toEqual([])
})
