import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { preparer, attendreAccueil, etat } from './eleve.js'

// Un élève de Terminale prépare son Grand Oral : règles 2027 repliées, ses deux
// questions, le chronomètre aux durées de l'épreuve, l'auto-évaluation, une
// source, l'analyse de son organisation et un argument rattaché à la question 2,
// évalué avec la grille ; tout est retrouvé après rechargement et se télécharge.
test('Grand Oral : règles 2027, questions, entraînement, sources, analyse, arguments par question', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/grand-oral')
  await expect(page.getByRole('heading', { level: 1, name: 'Grand Oral' })).toBeVisible()
  await expect(page.getByText('coef. 12')).toBeVisible()

  // Les règles sont repliées, et à jour : plus de projet d'orientation.
  await expect(page.getByText(/pourquoi tu as choisi cette question/)).toHaveCount(0)
  await page.getByRole('button', { name: /L'épreuve/ }).click()
  await page.getByRole('button', { name: 'Premier temps : la présentation (10 minutes)' }).click()
  await expect(page.getByText(/pourquoi tu as choisi cette question/)).toBeVisible()

  // Mes deux questions (bloc ouvert d'emblée).
  await page.getByLabel('Question 1').fill('Un résultat positif suffit-il à garantir la santé financière ?')
  await page.getByLabel('Question 2').fill('Fidéliser coûte-t-il moins cher que conquérir ?')
  await expect(page.getByRole('button', { name: /Mes deux questions/ })).toContainText('2 / 2 questions écrites')

  // Chronomètre : les durées de l'épreuve.
  await page.getByRole('button', { name: /M'entraîner à l'oral/ }).click()
  await page.getByRole('button', { name: /Préparation 20 min/ }).click()
  await expect(page.getByText('20:00')).toBeVisible()
  await page.getByRole('button', { name: /Échange 10 min/ }).click()
  await expect(page.getByText('10:00')).toBeVisible()

  // Auto-évaluation sur les 5 critères du jury.
  await page.getByRole('button', { name: /M'auto-évaluer comme le jury/ }).click()
  for (const critere of ['Qualité orale', 'Prise de parole en continu', 'Connaissances', 'Interaction avec le jury', 'Argumentation']) {
    await page.getByRole('button', { name: `${critere} : 4 sur 5` }).click()
  }
  await expect(page.getByText('16/20')).toBeVisible()

  // Une source.
  await page.getByRole('tab', { name: /Sources/ }).click()
  await page.getByLabel('Titre *').fill('Les délais de paiement')
  await page.getByLabel('Auteur ou organisme', { exact: true }).fill('Banque de France')
  await page.getByRole('button', { name: 'Ajouter la source' }).click()
  await expect(page.getByRole('tab', { name: /Sources \(1\)/ })).toBeVisible()

  // L'analyse de l'organisation.
  await page.getByRole('tab', { name: /Analyse/ }).click()
  await page.getByLabel('Organisation étudiée').fill('Boulangerie Martin')
  await page.getByRole('button', { name: /Tableau de caractérisation/ }).click()
  await page.getByLabel('Production', { exact: true }).fill('Marchande')
  await page.getByRole('button', { name: /Diagnostic interne et externe/ }).click()
  await page.getByLabel(/Opportunités/).fill('Essor de la vente en ligne')
  await page.getByRole('button', { name: /^PESTEL/ }).click()
  await page.getByLabel('Économique').fill('Inflation du prix de la farine')

  // Un argument rattaché à la question 2, évalué avec la grille du Grand Oral.
  await page.getByRole('tab', { name: /Arguments/ }).click()
  await expect(page.getByText(/^Question 2 · Fidéliser coûte-t-il moins cher que conquérir \?/)).toBeVisible()
  await page.getByRole('combobox', { name: 'Pour quelle question ?' }).selectOption('q2')
  await page.getByLabel('A - Affirmation *').fill('Un client fidèle achète plus souvent.')
  await page.getByLabel('Notion de ta spécialité utilisée').fill('fidélisation')
  await page.getByRole('button', { name: 'Ajouter l’argument' }).click()
  await expect(page.getByRole('heading', { name: /Question 2 : Fidéliser/ })).toContainText('1 argument')
  await expect(page.getByRole('heading', { name: /Question 1 : Un résultat/ })).toContainText('aucun argument')
  const argument = page.getByRole('button', { name: /1\. Un client fidèle achète plus souvent\./ })
  await expect(argument).toContainText('Note : 1/6')
  await argument.click()
  await page.getByLabel(/Je sais le présenter à voix haute/).check()
  await expect(argument).toContainText('Note : 2/6')

  // Tout est retrouvé après rechargement, sur l'appareil.
  await page.waitForTimeout(800)
  const go = (await etat(page)).grandOral
  expect(go.q2).toBe('Fidéliser coûte-t-il moins cher que conquérir ?')
  expect(go.analyse.pestel.economique).toBe('Inflation du prix de la farine')
  expect(go.maj).toBeGreaterThan(0)
  await page.reload()
  await page.goto('./#/grand-oral')
  await page.getByRole('tab', { name: /Arguments \(1\)/ }).click()
  await expect(page.getByRole('button', { name: /1\. Un client fidèle/ })).toContainText('Note : 2/6')

  // La préparation se télécharge.
  const fichier = page.waitForEvent('download')
  await page.getByRole('button', { name: /Télécharger ma préparation/ }).click()
  const contenu = readFileSync(await (await fichier).path(), 'utf8')
  expect(contenu).toContain('Question 1 : Un résultat positif suffit-il à garantir la santé financière ?')
  expect(contenu).toContain('ARGUMENTS — QUESTION 2 : Fidéliser coûte-t-il moins cher que conquérir ?')
  expect(contenu).toContain('Production : Marchande')
  expect(contenu).toContain('Opportunités :\n   - Essor de la vente en ligne')
  expect(contenu).toContain('E — Économique :\n   - Inflation du prix de la farine')
  expect(contenu).toContain('[1] Banque de France, « Les délais de paiement »')
  expect(erreurs).toEqual([])
})
