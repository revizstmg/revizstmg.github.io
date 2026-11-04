import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, etatEleve } from './eleve.js'

test('sport au bac : champs, seuils, estimation de note et plan d’entraînement', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: 'premium' })
  await page.goto('./#/sport-bac')
  await page.getByRole('button', { name: 'Référentiel détaillé', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Sport au bac' })).toBeVisible()
  await expect(page.getByText('Trois épreuves en contrôle en cours de formation')).toBeVisible()
  // Cinq champs d'apprentissage, détail du champ 4
  await expect(page.getByRole('tab')).toHaveCount(5)
  await page.getByRole('tab', { name: /Champ 4/ }).click()
  await expect(page.getByText(/^Activités : Badminton, tennis de table/)).toBeVisible()
  // Champ 1 : seuils nationaux et position
  await page.getByRole('tab', { name: /Champ 1/ }).click()
  await expect(page.getByRole('cell', { name: '3’08' })).toBeVisible()
  await page.locator('label', { hasText: /^Épreuve/ }).first().locator('select').selectOption('d800')
  await page.getByLabel(/Ma performance/).fill('3:08')
  await expect(page.getByText(/proche du seuil national/)).toBeVisible()
  // Estimation de note
  await expect(page.getByText(/Note estimée ≈/)).toBeVisible()
  await page.getByLabel(/AFL2 : s’entraîner/).selectOption('4')
  await page.getByLabel(/AFL3 : rôles/).selectOption('4')
  await expect(page.getByText(/Note estimée ≈ \d+(\.\d+)?\/20/)).toBeVisible()
  // Plan d'entraînement de demi-fond avec allures calculées
  await page.getByLabel(/Ma dernière performance/).fill('3:30')
  await expect(page.getByText(/Ta vitesse d’épreuve/)).toBeVisible()
  await expect(page.getByText(/Semaine 1 · Construire/)).toBeVisible()
  await expect(page.getByText(/Semaine 6 · Affûter/)).toBeVisible()
  await expect(page.getByText(/ne remplacent ni le professeur d’EPS/)).toBeVisible()
  // Autre activité
  await page.getByLabel('Activité').selectOption('yoga')
  await expect(page.getByText('Yoga', { exact: false }).first()).toBeVisible()
  expect(erreurs).toEqual([])
})

test('sport au bac : accessible et sans débord à 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await preparer(page, etatEleve(), { abonnement: 'premium' })
  await page.goto('./#/sport-bac')
  await page.getByRole('button', { name: 'Référentiel détaillé', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Sport au bac' })).toBeVisible()
  expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('sport au bac : réservé aux abonnés', async ({ page }) => {
  await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/sport-bac')
  await expect(page.getByRole('heading', { name: /Réservé aux abonnés/ })).toBeVisible()
})
