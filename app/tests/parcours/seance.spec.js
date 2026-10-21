import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve, etat, AUJOURDHUI } from './eleve.js'

// Moins de touchers : la séance du jour, la barre du bas, l'exercice en plein
// écran, « Refaire mes erreurs », une seule fenêtre à l'arrivée, et l'accueil
// du professeur.

test('« Ma séance du jour » : un toucher, et la première question est à l’écran', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  await page.getByRole('link', { name: /Ma séance du jour/ }).click()
  const exercice = page.locator('[data-exercice]')
  await expect(exercice).toContainText(/Étape 1\/1 · Avancer dans le cours/)
  // Plein écran : la barre du bas est recouverte.
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await page.getByRole('button', { name: /Quitter/ }).click()
  await expect(page.getByRole('button', { name: 'Reprendre la séance' })).toBeVisible()
  expect(erreurs).toEqual([])
})

test('fin de série : « Refaire mes erreurs » rejoue seulement les questions ratées', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/0')
  await page.getByRole('button', { name: /Exercices/ }).click()
  await page.getByRole('button', { name: /QCM — (les )?notions/ }).first().click()
  await page.getByRole('button', { name: /Entraînement/ }).click()
  const exercice = page.locator('[data-exercice]')
  // Toujours la dernière proposition : au moins une erreur, presque à coup sûr.
  for (let i = 0; i < 40; i++) {
    const suite = page.getByRole('button', { name: /^(?![A-D] ).*(suivante|score)/i, disabled: false })
    const choix = page.getByRole('button', { name: /^[A-D] /, disabled: false })
    if (await suite.count()) await suite.first().click()
    else if (await choix.count()) await choix.last().click()
    else break
  }
  const refaire = page.getByRole('button', { name: /Refaire mes erreurs \((\d+)\)/ })
  if (!(await refaire.count())) test.skip(true, 'série sans erreur (tirage)')
  const n = Number((await refaire.innerText()).match(/\((\d+)\)/)[1])
  const games = (await etat(page)).chapters['gf-t1'].games
  await refaire.click()
  await expect(exercice.getByText(`Question 1 / ${n}`, { exact: true })).toBeVisible()
  await expect(exercice).toContainText('↻ Mes erreurs')
  // La reprise ne compte pas dans la maîtrise.
  expect((await etat(page)).chapters['gf-t1'].games).toEqual(games)
  expect(erreurs).toEqual([])
})

test('barre du bas : Accueil, Cours, Réviser, Bac blanc, Moi', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  await page.getByRole('button', { name: 'OK', exact: true }).click() // information cookies
  const barre = page.locator('nav.fixed.bottom-0')
  await expect(barre.getByRole('link')).toHaveText([/Accueil/, /Cours/, /Réviser/, /Bac blanc/, /Moi/])
  await barre.getByRole('link', { name: /Cours/ }).click()
  await expect(page).toHaveURL(/#\/cours$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tes matières')
  await page.getByRole('link', { name: /Gestion & Finance/ }).first().click()
  await expect(barre.getByRole('link', { name: /Cours/ })).toHaveAttribute('aria-current', 'page')
  expect(erreurs).toEqual([])
})

test('une seule fenêtre à l’arrivée : la récompense du jour attend si les cookies s’affichent', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ streak: { count: 3, last: '2026-01-01' } }))
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  await expect(page.getByRole('region', { name: /cookies/i })).toBeVisible()
  await expect(page.getByRole('dialog').filter({ hasText: /XP/ })).toHaveCount(0)
  // La récompense est créditée quand même.
  await expect.poll(async () => (await etat(page)).streak?.last).toBe(AUJOURDHUI)
  expect(erreurs).toEqual([])
})

test('accueil du professeur : ses classes et les élèves à relancer', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({
    profile: { firstName: 'Paul', lastName: 'Prof' },
    account: { id: '00000000-0000-4000-8000-000000000002', email: 'paul@test.fr', role: 'prof' },
    teacherClasses: [{ code: 'STMG-ABC23', label: 'Terminale B' }],
    classCode: 'STMG-ABC23',
  }))
  await page.route('**/rest/v1/class_member**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { device_id: 'a', name: 'Inès', role: 'eleve', xp: 120, courses_week: 3, active_day: AUJOURDHUI, subjects: {} },
      { device_id: 'b', name: 'Tom', role: 'eleve', xp: 10, courses_week: 0, active_day: '2026-01-02', subjects: {} },
      { device_id: 'c', name: 'Paul', role: 'prof', xp: 0, courses_week: 0, active_day: AUJOURDHUI, subjects: {} },
    ]),
  }))
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bonjour, Paul')
  await expect(page.getByRole('heading', { name: 'Mes classes' })).toBeVisible()
  await expect(page.getByText(/2 élèves · 1 actif cette semaine/)).toBeVisible()
  await expect(page.getByText('Un élève à relancer')).toBeVisible()
  await expect(page.getByRole('link', { name: /Ma séance du jour/ })).toHaveCount(0)
  expect(erreurs).toEqual([])
})

test('bac blanc : sujet de maths en Première et aucun QCM chronométré', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./#/bac-blanc')
  await attendreAccueil(page)
  await expect(page.getByRole('heading', { name: /Épreuve anticipée de mathématiques/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Faire un sujet d’entraînement (2 h)' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '⏱ QCM chronométré' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Commencer l’examen/ })).toHaveCount(0)
  await expect(page.locator('.bac-creator')).toBeVisible()
  expect(erreurs).toEqual([])
})
