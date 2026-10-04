// Parcours d'un élève dans la version compilée de l'app.
import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat, etatEleve } from './eleve.js'

test('première visite : l’écran de connexion s’affiche', async ({ page }) => {
  const erreurs = await preparer(page, null)
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Se connecter' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Créer un compte/ })).toBeVisible()
  expect(erreurs).toEqual([])
})

test('accueil d’un élève inscrit', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await expect(page).toHaveURL(/#\/accueil/)
  await expect(page.getByText('Léa').first()).toBeVisible()
  await expect(page.getByText(/Gestion et Finance/i).first()).toBeVisible()
  expect(erreurs).toEqual([])
})

test('suivre un cours puis faire un QCM jusqu’au bout', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/0')

  // Le cours est lisible.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('main')).toContainText(/TVA/)

  // Onglet Exercices, puis un QCM en mode entraînement.
  await page.getByRole('button', { name: /Exercices/ }).click()
  await page.getByRole('button', { name: /QCM — les notions du chapitre/ }).click()
  await page.getByRole('button', { name: /Entraînement/ }).click()
  await expect(page.locator('main')).toContainText(/Question 1 \//)

  const xpAvant = (await etat(page)).xp || 0
  for (let i = 0; i < 40; i++) {
    const choix = page.getByRole('button', { name: /^[A-D] /, disabled: false })
    const suite = page.getByRole('button', { name: /suivant|suivante|résultat|score|terminer|continuer/i })
    if (await suite.count()) await suite.first().click()
    else if (await choix.count()) await choix.first().click()
    else break
  }
  // Fin de partie : score affiché et XP gagnée.
  await expect(page.locator('main')).toContainText(/%|score|bravo|résultat/i)
  await expect.poll(async () => (await etat(page)).xp || 0).toBeGreaterThan(xpAvant)
  const ch = (await etat(page)).chapters?.['gf-t1']
  expect(ch?.games && Object.keys(ch.games).length).toBeGreaterThan(0)
  expect(erreurs).toEqual([])
})

// Toutes les pages de l'app s'ouvrent sans erreur.
const PAGES = [
  ['/accueil', /Léa/],
  ['/subject/gestion-finance', /Thème/],
  ['/subject/gestion-finance/theme/gf-t1', /Thème 1/],
  ['/favoris', /./],
  ['/badges', /Badge|badge/],
  ['/moi', /Léa/],
  ['/coach', /./],
  ['/revision', /./],
  ['/bac-blanc', /bac blanc|Bac blanc/i],
  ['/programme', /./],
  ['/grand-oral', /Grand Oral/i],
  ['/coach-ia', /./],
  ['/fiches-photo', /./],
  ['/defi', /./],
  ['/express', /./],
  ['/formules', /Formulaire/],
  ['/methodo', /./],
  ['/boutique', /./],
  ['/confidentialite', /confidentialité/i],
  ['/faq', /./],
  ['/guide', /./],
  ['/classement', /./],
  ['/amis', /./],
  ['/classe', /./],
  ['/changer', /Terminale|Première/],
]
for (const [route, attendu] of PAGES) {
  test(`page ${route}`, async ({ page }) => {
    const erreurs = await preparer(page)
    await page.goto('./')
    await attendreAccueil(page)
    await page.goto(`./#${route}`)
    await page.waitForTimeout(600)
    const texte = await page.locator('#root').innerText()
    expect(texte.length, 'la page n’est pas vide').toBeGreaterThan(80)
    expect(texte).toMatch(attendu)
    expect(texte).not.toMatch(/Something went wrong|Une erreur est survenue/i)
    expect(erreurs).toEqual([])
  })
}

test('élève de Première : accueil et matières de Première', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./')
  await attendreAccueil(page)
  await expect(page.getByText(/Première/).first()).toBeVisible()
  expect(erreurs).toEqual([])
})
