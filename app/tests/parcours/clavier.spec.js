import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil } from './eleve.js'

// Menus et fenêtres au clavier : Échap ferme, Tab reste dans la fenêtre, le
// focus revient sur le bouton qui l'a ouverte. Et le bouton de l'atelier de
// formules reste visible pendant qu'on coche les formules.

const focusDans = (page, selecteur) => page.evaluate((sel) => !!document.querySelector(sel)?.contains(document.activeElement), selecteur)

test('menu du téléphone : Entrée ouvre, Tab tourne dedans, Échap ferme et rend le focus', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  await page.getByRole('button', { name: 'OK', exact: true }).click() // information cookies
  const bouton = page.getByRole('button', { name: 'Menu', exact: true })
  await bouton.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()
  expect(await focusDans(page, '[role="dialog"][aria-label="Menu"]')).toBe(true)
  for (let i = 0; i < 25; i++) await page.keyboard.press('Tab')
  expect(await focusDans(page, '[role="dialog"][aria-label="Menu"]')).toBe(true)
  await page.keyboard.press('Shift+Tab')
  expect(await focusDans(page, '[role="dialog"][aria-label="Menu"]')).toBe(true)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(bouton).toBeFocused()
  expect(erreurs).toEqual([])
})

test('langue sur ordinateur : Échap ferme la liste et rend le focus', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  const bouton = page.getByRole('button', { name: 'Langue', exact: true })
  await bouton.focus()
  await page.keyboard.press('Enter')
  const liste = page.getByRole('group', { name: 'Langue' })
  await expect(liste).toBeVisible()
  expect(await focusDans(page, '[role="group"][aria-label="Langue"]')).toBe(true)
  await page.keyboard.press('Escape')
  await expect(liste).toHaveCount(0)
  await expect(bouton).toBeFocused()
  expect(erreurs).toEqual([])
})

test('exercice en plein écran : le focus y entre, Tab y reste, Échap ne fait pas quitter', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/0')
  await attendreAccueil(page)
  await page.getByRole('button', { name: /Exercices/ }).click()
  await page.getByRole('button', { name: /QCM - (les )?notions/ }).first().click()
  await page.getByRole('button', { name: /Entraînement/ }).click()
  const exercice = page.locator('[data-exercice]')
  await expect(exercice).toContainText(/Question 1 \//)
  expect(await focusDans(page, '[data-exercice]')).toBe(true)
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
  expect(await focusDans(page, '[data-exercice]')).toBe(true)
  await page.keyboard.press('Escape')
  await expect(exercice).toBeVisible()
  await page.getByRole('button', { name: /Quitter/ }).click()
  await expect(exercice).toHaveCount(0)
  await expect(page.getByRole('button', { name: /QCM - (les )?notions/ }).first()).toBeFocused()
  expect(erreurs).toEqual([])
})

test('atelier de formules : « Générer mes exercices » reste visible en cochant', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.setViewportSize({ width: 390, height: 760 })
  await page.goto('./#/atelier-formules')
  await attendreAccueil(page)
  await page.getByRole('button', { name: 'OK', exact: true }).click() // information cookies
  const cases = page.getByRole('checkbox')
  const derniere = cases.last()
  await derniere.scrollIntoViewIfNeeded()
  await derniere.check()
  const generer = page.getByRole('button', { name: 'Générer mes exercices', exact: true })
  await expect(generer).toBeEnabled()
  await expect(generer).toBeInViewport()
  // Pas caché par la barre du bas.
  const [b, nav] = await Promise.all([generer.boundingBox(), page.locator('nav.fixed.bottom-0').boundingBox()])
  expect(b.y + b.height).toBeLessThanOrEqual(nav.y + 1)
  await generer.click()
  await expect(page.locator('main')).toContainText(/Exercice 1 \//)
  expect(erreurs).toEqual([])
})
