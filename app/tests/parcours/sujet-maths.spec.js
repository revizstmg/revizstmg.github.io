import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Première : sujet d'entraînement à l'épreuve anticipée de mathématiques, au
// format du BO (2 h, automatismes sur 6, exercices sur 14), rendu puis corrigé.
test('Première : sujet de maths au format de l’épreuve, rendu et corrigé', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./#/bac-blanc')
  await attendreAccueil(page)
  await expect(page.locator('main')).toContainText('session 2028')
  await page.getByRole('button', { name: 'Faire un sujet d’entraînement (2 h)' }).click()

  await expect(page.getByRole('heading', { name: /Partie 1 - Automatismes/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /Partie 2 - Exercices/ })).toBeVisible()
  await expect(page.locator('main h3')).toHaveCount(3)
  const champs = page.getByRole('textbox')
  expect(await champs.count()).toBeGreaterThanOrEqual(25)
  await expect(page.locator('main')).toContainText('1 h 59')

  // Question 1 : la proportion se lit dans l'énoncé.
  const enonce = await page.locator('#enonce-a1').innerText()
  const [, n, k] = enonce.match(/de (\d+) salariés, (\d+) travaillent/)
  await page.getByLabel('Réponse à la question 1', { exact: true }).fill(String((Number(k) / Number(n)) * 100))
  await page.getByLabel('Réponse à la question 2', { exact: true }).fill('n’importe quoi')
  await expect(page.locator('main')).toContainText(/\d+ questions sans réponse/)
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations.map((v) => v.id)).toEqual([])

  await page.getByRole('button', { name: 'Rendre ma copie' }).click()
  await expect(page.getByRole('heading', { name: 'Ta copie est corrigée' })).toBeVisible()
  await expect(page.locator('main')).toContainText('0,5 / 20')
  await expect(page.locator('main')).toContainText('ce n’est pas une note d’examen')
  await expect(page.getByText('✓ Juste')).toHaveCount(1)
  await expect(page.getByText(/✗ Réponse attendue/).first()).toBeVisible()
  await expect(page.getByLabel('Réponse à la question 1', { exact: true })).toBeDisabled()

  await page.getByRole('button', { name: 'Nouveau sujet' }).click()
  await expect(page.getByRole('heading', { name: 'Ta copie est corrigée' })).toHaveCount(0)
  await expect(page.getByLabel('Réponse à la question 1', { exact: true })).toHaveValue('')
  await page.getByRole('button', { name: '← Quitter' }).click()
  await expect(page.getByRole('button', { name: 'Faire un sujet d’entraînement (2 h)' })).toBeVisible()
  expect(erreurs).toEqual([])
})

test('Terminale : pas de sujet de maths anticipé', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./#/bac-blanc')
  await attendreAccueil(page)
  await expect(page.getByRole('button', { name: 'Faire un sujet d’entraînement (2 h)' })).toHaveCount(0)
  expect(erreurs).toEqual([])
})
