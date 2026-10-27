import { test, expect } from '@playwright/test'
import { preparer, etatEleve, attendreAccueil } from './eleve.js'

test('FAQ et guide en allemand : phrases entières, sans reste de français, sans service externe', async ({ page }) => {
  const requetes = []
  page.on('request', (r) => { if (/mymemory|translate.googleapis/.test(r.url())) requetes.push(r.url()) })
  const erreurs = await preparer(page, etatEleve({ lang: 'de' }))
  for (const route of ['faq', 'guide']) {
    await page.goto(`./#/${route}`)
    await expect(page.locator('main h1, h1').first()).toBeVisible()
    const texte = await page.locator('main').innerText()
    expect(texte, route).not.toMatch(/\b(choisis|saisis|Sur l[’']écran|Va dans|ton compte|Ouvre)\b/)
  }
  await page.goto('./#/faq')
  await expect(page.getByText('Wie erstelle ich ein Konto?')).toBeVisible()
  expect(requetes).toEqual([])
  expect(erreurs).toEqual([])
})

test('chapitre : numérotation de la liste, jeux visibles dès l’ouverture et page remontée', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/droit/theme/droit-t5/chapter/1')
  const entete = await page.locator('main p').filter({ hasText: /\d+\/\d+/ }).first().innerText()
  expect(entete).not.toMatch(/\/14\b/)
  await page.getByRole('button', { name: /Exercices/ }).click()
  await expect(page.locator('.chapter-memorisation summary')).toContainText(/Les \d+ jeux du chapitre/)
  await page.locator('.chapter-memorisation summary').click()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.locator('[data-jeu]').first().scrollIntoViewIfNeeded()
  await page.locator('[data-jeu]').first().click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5)
  expect(erreurs).toEqual([])
})

test('accueil en arabe : date grégorienne en chiffres latins', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ lang: 'ar' }))
  await page.goto('./')
  await attendreAccueil(page)
  const date = await page.locator('.home-date').first().innerText().catch(() => '')
  expect(date).not.toMatch(/[٠-٩]/)
  expect(date).not.toMatch(/جمادى|رجب|شعبان|رمضان|شوال|محرم|صفر|ربيع|ذو/)
  expect(erreurs).toEqual([])
})

test('professeur : pas de notes de classe d’élève dans Mon espace, ses classes à la place', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ account: { role: 'prof', email: 'prof@example.org', id: 'p1' } }))
  await page.goto('./#/moi')
  await expect(page.getByText('Mes classes')).toBeVisible()
  await expect(page.getByText('Mes notes de classe')).toHaveCount(0)
  expect(erreurs).toEqual([])
})
