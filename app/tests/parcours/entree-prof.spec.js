import { test, expect } from '@playwright/test'
import { preparer } from './eleve.js'

// Un enseignant doit trouver son entrée dès l'écran de connexion, sans chercher le choix « Professeur » à l'étape 1.
test('« Je suis professeur » ouvre l’inscription professeur', async ({ page }) => {
  const erreurs = await preparer(page, null, { bienvenue: true })
  await page.goto('./')
  await page.getByRole('button', { name: /Je suis professeur/ }).click()
  await expect(page.getByRole('button', { name: /Professeur/ }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /faire connaissance|Faisons connaissance|connaissance/i }).first()).toBeVisible()
  expect(erreurs).toEqual([])
})
