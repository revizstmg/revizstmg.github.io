import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, etatEleve, attendreAccueil } from './eleve.js'

// Les dix modes de révision des langues : on les ouvre, on joue, on vérifie le retour immédiat.
async function ouvrir(page, langue = 'Anglais') {
  await page.goto('./#/subject/langues')
  await attendreAccueil(page)
  await page.getByRole('button', { name: new RegExp(langue) }).click()
  await expect(page.getByRole('heading', { name: /Dix modes pour/ })).toBeVisible()
}
const jouerUneQuestion = async (page) => {
  await page.getByRole('group', { name: 'Réponses' }).getByRole('button').first().click()
  await expect(page.getByRole('button', { name: /Suivant|Voir mon résultat/ })).toBeFocused()
}

test('les dix modes sont proposés et le mode Snap se joue jusqu’au score', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'terminale-stmg', specialty: 'gestion-finance' } }))
  await ouvrir(page)
  await expect(page.locator('section[aria-labelledby="langues-modes"] ul > li')).toHaveCount(10)
  await page.getByRole('button', { name: /Réponds comme sur Snap/ }).click()
  for (let i = 0; i < 6; i++) {
    await jouerUneQuestion(page)
    await page.getByRole('button', { name: /Suivant|Voir mon résultat/ }).click()
  }
  await expect(page.getByText(/^\d sur 6$/)).toBeVisible()
  await page.getByRole('button', { name: 'Tous les modes' }).click()
  await page.getByRole('button', { name: /Le classement sans pitié/ }).click()
  await expect(page.getByText(/points cette semaine/)).toBeVisible()
  expect(erreurs).toEqual([])
})

test('le test du pote : un code, cinq questions, un message à envoyer, et le lien rouvre le défi', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'terminale-stmg', specialty: 'gestion-finance' } }))
  await ouvrir(page)
  await page.getByRole('button', { name: /Le test du pote/ }).click()
  await page.getByRole('button', { name: 'Lancer un défi' }).click()
  for (let i = 0; i < 5; i++) {
    await jouerUneQuestion(page)
    await page.getByRole('button', { name: /Suivant|Voir mon résultat/ }).click()
  }
  await expect(page.getByText('Envoie ça à ton pote :')).toBeVisible()
  const message = await page.locator('p.break-all').first().innerText()
  const code = /code (\w{2}-[0-9a-z]+)\.\d/.exec(message)[1]
  // Le pote ouvre le lien : le même défi s'ouvre, dans la bonne langue.
  await page.goto(`./#/subject/langues?defi=${code}.3`)
  await expect(page.getByRole('heading', { name: 'Le test du pote' })).toBeVisible()
  await expect(page.getByText('Question 1 sur 5')).toBeVisible()
  // Un code d'une autre langue est refusé avec un message clair.
  await page.goto('./#/subject/langues')
  await page.getByRole('button', { name: /Le test du pote/ }).click()
  await page.getByLabel(/Ton pote t’a envoyé un code/).fill('es-1abc2d.4')
  await page.getByRole('button', { name: 'Relever le défi' }).click()
  await expect(page.getByRole('alert')).toContainText('autre langue')
  expect(erreurs).toEqual([])
})

test('mise, survie et entretien : on joue, le résultat tombe, l’arabe garde les modes du manuel', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'terminale-stmg', specialty: 'gestion-finance' } }))
  await ouvrir(page)
  await page.getByRole('button', { name: /Mise en jeu/ }).click()
  await expect(page.getByText(/Ta banque : 100 points/)).toBeVisible()
  await page.getByRole('button', { name: 'Miser 10' }).click()
  for (let i = 0; i < 5; i++) {
    await jouerUneQuestion(page)
    await page.getByRole('button', { name: /Suivant|Voir mon résultat/ }).click()
  }
  await expect(page.getByText(/Ta banque passe à/)).toBeVisible()
  await page.getByRole('button', { name: 'Tous les modes' }).click()
  await page.getByRole('button', { name: /Survie à l’étranger/ }).click()
  for (let i = 0; i < 5; i++) {
    await page.getByRole('group', { name: 'Réponses' }).getByRole('button').first().click()
    await page.getByRole('button', { name: /Suivant|Voir mon résultat/ }).click()
  }
  await expect(page.getByText(/Il te reste \d+ €|Tu es à découvert de \d+ €/)).toBeVisible()
  await page.getByRole('button', { name: 'Tous les modes' }).click()
  await page.getByRole('button', { name: /Entretien vexant/ }).click()
  for (let i = 0; i < 6; i++) {
    await page.getByRole('group', { name: 'Réponses' }).getByRole('button').first().click()
    await page.getByRole('button', { name: /Suivant|Voir mon résultat/ }).click()
  }
  await expect(page.getByText(/^\d+ sur 18$/)).toBeVisible()
  // L'arabe a désormais ses scénarios (à faire relire par un arabophone) : tous les modes sont ouverts.
  await page.getByRole('button', { name: /Arabe/ }).click()
  await expect(page.getByRole('button', { name: /Entretien vexant/ })).toBeEnabled()
  await page.getByRole('button', { name: /J’ai 3 minutes/ }).click()
  await page.getByRole('button', { name: /3 minutes · 8 questions/ }).click()
  await expect(page.getByText('Question 1 sur 8')).toBeVisible()
  expect(erreurs).toEqual([])
})

test('les modes passent axe en clair et en sombre, sans débordement à 320 px', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'terminale-stmg', specialty: 'gestion-finance' } }))
  await page.setViewportSize({ width: 320, height: 700 })
  await ouvrir(page)
  await page.getByRole('button', { name: /Traduis ce texto/ }).click()
  await jouerUneQuestion(page)
  for (const dark of [false, true]) {
    await page.evaluate((d) => document.documentElement.classList.toggle('dark', d), dark)
    // Les cartes apparaissent en fondu : on mesure les contrastes une fois les animations finies.
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity))
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
    expect((await new AxeBuilder({ page }).include('section[aria-labelledby="langues-modes"]').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
  }
  expect(erreurs).toEqual([])
})
