import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat } from './eleve.js'

// « Mes notes de classe » : l'élève n'écrit que sa note ; la matière, puis le
// chapitre, se choisissent dans des menus. La page dit ce qu'il faut améliorer.
test('saisir ses notes et voir ce qu’il faut améliorer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const erreurs = await preparer(page)
  await page.goto('./#/moi')
  await attendreAccueil(page)
  await page.getByRole('link', { name: /Mes notes de classe/ }).click()
  await expect(page.getByRole('heading', { name: /Mes notes de classe/ })).toBeVisible()
  await expect(page.getByText('Ajoute ta première note')).toBeVisible()

  const note = page.getByLabel('Note sur 20', { exact: true })
  const matiere = page.getByLabel('Matière', { exact: true })
  const chapitre = page.getByLabel('Chapitre', { exact: true })
  const ajouter = page.getByRole('button', { name: 'Ajouter', exact: true })

  // Le chapitre ne se choisit qu'après la matière, parmi ses seuls chapitres.
  await expect(chapitre).toBeDisabled()
  await note.fill('21')
  await ajouter.click()
  await expect(page.getByRole('alert')).toContainText('Écris une note sur 20')
  await note.fill('15,50')
  await ajouter.click()
  await expect(page.getByRole('alert')).toContainText('Choisis la matière')
  await matiere.selectOption('maths')
  await expect(chapitre).toBeEnabled()
  const chapitres = await chapitre.locator('option').allTextContents()
  expect(chapitres).toContain('Chapitre 3 — Fonctions et dérivation')
  expect(chapitres.some((c) => c.includes('règles comptables'))).toBe(false)
  await ajouter.click()
  await expect(page.getByRole('alert')).toContainText('Choisis le chapitre')
  await chapitre.selectOption('math-c3')
  await ajouter.click()
  await expect(page.getByRole('status').filter({ hasText: 'Note ajoutée' })).toBeVisible()
  await expect(note).toHaveValue('')

  // Une note sous la moyenne dans un autre chapitre de maths.
  await note.fill('8,5')
  await matiere.selectOption('maths')
  await chapitre.selectOption('math-c2')
  await ajouter.click()

  const ameliorer = page.locator('section', { has: page.getByRole('heading', { name: /Ce qu’il faut améliorer/ }) })
  await expect(ameliorer.getByRole('listitem')).toHaveCount(1)
  await expect(ameliorer).toContainText('Chapitre 2 — Suites numériques')
  await expect(ameliorer).toContainText('Sous la moyenne')
  await expect(ameliorer).toContainText('8,50/20')
  await expect(page.getByText('Moyenne 12/20')).toBeVisible()

  const notes = (await etat(page)).notesClasse
  expect(notes.map((n) => [n.note, n.matiere, n.chapitre])).toEqual([[8.5, 'maths', 'math-c2'], [15.5, 'maths', 'math-c3']])

  // Les notes restent après un rechargement ; une note se supprime.
  await page.reload()
  await attendreAccueil(page)
  await expect(page.getByText('Moyenne 12/20')).toBeVisible()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Supprimer la note' }).first().click()
  await expect(page.getByRole('button', { name: 'Supprimer la note' })).toHaveCount(1)
  await expect(page.getByText('Moyenne 15,50/20')).toBeVisible()
  await expect(ameliorer).toContainText('Rien à retravailler en priorité')
  expect((await etat(page)).notesClasse.map((n) => n.chapitre)).toEqual(['math-c3'])
  expect(erreurs).toEqual([])
})
