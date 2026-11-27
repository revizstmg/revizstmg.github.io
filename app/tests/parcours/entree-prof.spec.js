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

// Un professeur n'a pas de spécialité : toutes les matières de Terminale (dont Gestion et finance) sont dans « Cours » et la recherche.
test('un professeur retrouve les matières de spécialité dans Cours et dans la recherche', async ({ page }) => {
  const { etatEleve, attendreAccueil } = await import('./eleve.js')
  const erreurs = await preparer(page, etatEleve({ account: { id: '00000000-0000-4000-8000-000000000002', email: 'p@test.fr', role: 'prof' } }))
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/cours')
  await expect(page.getByRole('heading', { name: /Les matières de vos élèves/ })).toBeVisible()
  await expect(page.getByText('Gestion et finance').first()).toBeVisible()
  await expect(page.getByText('Mercatique').first()).toBeVisible()
  expect(erreurs).toEqual([])
})
