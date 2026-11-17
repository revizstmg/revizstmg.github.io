import { test, expect } from '@playwright/test'
import { preparer, etatEleve } from './eleve.js'

// Un outil d'un autre niveau garde un titre de page (lecteurs d'écran), et les textes
// du Coach et du calendrier restent traduits hors ligne.
test('étude de gestion pour un élève de Terminale : un seul titre de page', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/etude-de-gestion')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  await expect(page.getByRole('link', { name: /Voir l’outil de mon niveau/ })).toBeVisible()
  expect(erreurs).toEqual([])
})

test('Grand Oral pour un élève de Première : un seul titre de page', async ({ page }) => {
  await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./#/grand-oral')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
})

test('Coach et calendrier en allemand : pas de français résiduel', async ({ page }) => {
  await preparer(page, etatEleve({ lang: 'de' }))
  await page.goto('./#/coach')
  await expect(page.getByText('Aktives Abrufen').first()).toBeVisible()
  await expect(page.getByText('Ferme ton cours')).toHaveCount(0)
  await page.goto('./#/programme')
  await expect(page.getByText('ton jour de passage')).toHaveCount(0)
  await expect(page.getByText('Grand Oral').first()).toBeVisible()
})
