import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

test('studio : parcours guidé, erreurs par matière et raccourcis sans casser la navigation', async ({ page }) => {
 const errors = await preparer(page)
 await page.goto('./#/revision'); await attendreAccueil(page)
 await expect(page.getByRole('heading', { level: 1, name: 'Réviser' })).toBeVisible()
 await expect(page.locator('#revision-carnet')).toHaveCount(0)
 for(const label of ['à revoir aujourd’hui','à renforcer','bien acquis'])await expect(page.getByText(label,{exact:true})).toHaveCount(0)
 await expect(page.getByRole('link', { name: /Lancer ma séance/ })).toHaveAttribute('href', '#/seance')
 await page.getByRole('button', { name: /Retravailler mes erreurs/ }).click()
 await expect(page.getByRole('heading',{level:1,name:'Revoir mes erreurs'})).toBeVisible()
 await page.getByLabel('Matière',{exact:true}).selectOption('gestion-finance')
 await expect(page.getByRole('heading',{name:'Aucune erreur dans cette sélection'})).toBeVisible()
 await expect(page).toHaveURL(/#\/revision$/)
 await page.getByRole('button',{name:/Choisir une autre méthode/}).click()
 await page.getByRole('button',{name:'Réviser mes acquis',exact:true}).click()
 await expect(page.getByRole('heading',{level:1,name:'Ancrer mes connaissances'})).toBeVisible()
 await expect(page.getByRole('combobox')).toHaveCount(2)
 await page.getByRole('button',{name:/Choisir une autre méthode/}).click()
 await expect(page.getByRole('link', { name: /Explorer les examens blancs/ })).toHaveAttribute('href', '#/bac-blanc')
 expect(errors).toEqual([])
})
test('studio : clair, sombre et grandes largeurs restent lisibles et accessibles', async ({ page }) => {
 const errors = await preparer(page, etatEleve({ chapters: { 'gf-t1': { worked: true, quiz: 10, games: { 'studio-test': 20 } } }, srs: { 'gf-t1': { due: '2026-01-01' } } }))
 await page.goto('./#/revision'); await attendreAccueil(page)
 for (const width of [393, 1280]) {
  await page.setViewportSize({ width, height: 900 })
  for (const dark of [false, true]) {
   await page.evaluate(value => document.documentElement.classList.toggle('dark', value), dark)
   await page.waitForTimeout(400)
   expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
   await page.screenshot({ path: `test-results/revision-${width}-${dark ? 'dark' : 'light'}.png`, fullPage: true })
  }
 }
 expect(errors).toEqual([])
})
test('studio : paquet sauvegardé et import dans une bibliothèque limitée aux flashcards', async ({ page }) => {
 const errors = await preparer(page, etatEleve({ savedDecks: [{ id: 'studio', title: 'Mes repères', color: '#41624f', cards: [{ front: 'Un', back: 'Une réponse.' }, { front: 'Deux', back: 'Une seconde réponse.' }, { front: 'Trois', back: 'Une troisième réponse.' }] }] }))
 await page.goto('./#/revision'); await attendreAccueil(page)
 await expect(page.getByRole('button', { name: /Mes repères/ })).toBeVisible()
 await expect(page.locator('.revision-library').getByRole('heading',{name:/Tes matières|Objectif de la semaine/})).toHaveCount(0)
 await expect(page.locator('.revision-library').getByRole('heading')).toHaveCount(2)
 await page.getByRole('button', { name: /Importer un paquet/ }).click()
 await page.getByRole('textbox', { name: 'Importer un paquet' }).fill('code-invalide')
 await page.getByRole('button', { name: 'Importer', exact: true }).click()
 await expect(page.getByText('Code invalide. Vérifie le code copié.')).toBeVisible()
 await page.getByRole('button', { name: /Mes repères/ }).click()
 await expect(page).toHaveURL(/#\/revision\/deck\/studio$/)
 expect(errors).toEqual([])
})
