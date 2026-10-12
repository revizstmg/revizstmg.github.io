import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Un élève de Première ouvre l'étude de gestion depuis l'accueil, écrit sa
// problématique, ajoute une source, construit un argument A-E-I relié à cette
// source, retrouve tout après rechargement et télécharge son dossier.
test('étude de gestion : projet, source, argument A-E-I, dossier', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./')
  await attendreAccueil(page)
  await page.getByRole('link', { name: /Étude de gestion/ }).first().click()
  await expect(page.getByRole('heading', { level: 1, name: 'Étude de gestion' })).toBeVisible()
  await expect(page.getByText(/oral de 20 minutes/)).toBeVisible()

  // Le projet.
  await page.getByLabel('Organisation étudiée').fill('Boulangerie Martin')
  await page.getByLabel('Ma problématique').fill('Comment la boulangerie mesure-t-elle sa performance ?')
  await page.getByLabel('Les raisons du choix de la problématique').check()

  // Une source.
  await page.getByRole('tab', { name: /Sources/ }).click()
  await page.getByRole('button', { name: 'Ajouter la source' }).click()
  await expect(page.getByRole('alert')).toContainText('titre')
  await page.getByRole('combobox', { name: 'Type' }).selectOption('Entretien')
  await page.getByLabel('Titre *').fill('Entretien avec la gérante')
  await page.getByLabel('Auteur ou organisme', { exact: true }).fill('Mme Martin')
  await page.getByLabel('Date', { exact: true }).fill('mars 2026')
  await page.getByLabel('Auteur ou organisme identifié').check()
  await page.getByRole('button', { name: 'Ajouter la source' }).click()
  await expect(page.getByText('Mme Martin, « Entretien avec la gérante », mars 2026')).toBeVisible()
  await expect(page.getByText('Fiabilité 1/3')).toBeVisible()

  // Un argument A-E-I relié à la source.
  await page.getByRole('tab', { name: /Arguments/ }).click()
  await expect(page.getByText('Comment la boulangerie mesure-t-elle sa performance ?')).toBeVisible()
  await page.getByLabel('A — Affirmation *').fill('La boulangerie suit sa marge chaque mois.')
  await page.getByLabel('E — Explication').fill('La marge mesure la valeur créée par chaque vente.')
  await page.getByLabel('I — Illustration').fill('Marge de 40 % sur le pain en mars.')
  await page.getByRole('combobox', { name: "Source de l'illustration" }).selectOption({ label: '[1] Entretien avec la gérante' })
  await page.getByRole('button', { name: 'Ajouter l’argument' }).click()
  await expect(page.getByText('1. La boulangerie suit sa marge chaque mois.')).toBeVisible()
  await expect(page.getByText('📎 Mme Martin, « Entretien avec la gérante », mars 2026')).toBeVisible()

  // Tout est retrouvé après rechargement.
  await page.waitForTimeout(800)
  await page.reload()
  await page.goto('./#/etude-de-gestion')
  await page.getByRole('tab', { name: /Arguments \(1\)/ }).click()
  await expect(page.getByText('1. La boulangerie suit sa marge chaque mois.')).toBeVisible()

  // Le dossier se télécharge.
  const fichier = page.waitForEvent('download')
  await page.getByRole('button', { name: /Télécharger mon dossier/ }).click()
  const contenu = readFileSync(await (await fichier).path(), 'utf8')
  expect(contenu).toContain('Problématique : Comment la boulangerie mesure-t-elle sa performance ?')
  expect(contenu).toContain('Illustration : Marge de 40 % sur le pain en mars. [source 1]')
  expect(erreurs).toEqual([])
})

test('l’étude de gestion n’apparaît pas sur l’accueil de Terminale', async ({ page }) => {
  await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await expect(page.getByRole('link', { name: /Étude de gestion/ })).toHaveCount(0)
})
