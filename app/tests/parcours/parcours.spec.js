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
  await page.addInitScript(()=>{let seed=123456789;Math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296}})
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/0')

  // Le cours est lisible.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('main')).toContainText(/TVA/)

  // Onglet Exercices, puis un QCM en mode entraînement.
  await page.getByRole('button', { name: /Exercices/ }).click()
  if(await page.locator('.chapter-memorisation').count())await page.locator('.chapter-memorisation').evaluate(el=>el.open=true)
  await page.getByRole('button', { name: /QCM - (les )?notions/ }).first().click()
  await page.getByRole('button', { name: /Entraînement/ }).click()
  // L'exercice s'ouvre en plein écran, par-dessus la page.
  const exercice = page.locator('[data-exercice]')
  await expect(exercice).toContainText(/Question 1 \//)

  const xpAvant = (await etat(page)).xp || 0
  // Les positions varient entre les parties : choisir toujours A peut donner
  // zéro réussite même après plusieurs tirages. Les XP restent liés aux bonnes réponses.
  for (let partie = 0; partie < 5; partie++) {
    for (let i = 0; i < 40; i++) {
      const choix = page.getByRole('button', { name: /^[A-D] /, disabled: false })
      // Bouton pour avancer - jamais une proposition (« A … », « B … ») dont le
      // texte contiendrait par hasard « résultat » ou « score ».
      const suite = page.getByRole('button', { name: /^(?![A-D] ).*(suivant|suivante|résultat|score|terminer|continuer)/i, disabled: false })
      if (await suite.count()) await suite.first().click()
      else if (await choix.count()) await choix.nth(partie % await choix.count()).click()
      else break
    }
    // Fin de partie : score affiché.
    await expect(exercice).toContainText(/%|score|bravo|résultat/i)
    await page.waitForTimeout(300)
    const progress=await etat(page)
    if ((progress.xp || 0) > xpAvant && (progress.erreurs || []).length > 0) break
    await page.getByRole('button', { name: 'Rejouer' }).click()
    const entrainement = page.getByRole('button', { name: /Entraînement/ })
    if (await entrainement.count()) await entrainement.click()
  }
  // XP gagnée.
  await expect.poll(async () => (await etat(page)).xp || 0).toBeGreaterThan(xpAvant)
  const ch = (await etat(page)).chapters?.['gf-t1']
  expect(ch?.games && Object.keys(ch.games).length).toBeGreaterThan(0)
  // Les réponses variées comprennent aussi des erreurs, qui entrent
  // dans le carnet d'erreurs.
  await expect.poll(async () => ((await etat(page)).erreurs || []).length).toBeGreaterThan(0)
  expect(erreurs).toEqual([])
})

// Toutes les pages de l'app s'ouvrent sans erreur.
const PAGES = [
  ['/accueil', /Léa/],
  ['/subject/gestion-finance', /Appliquer les règles comptables/],
  ['/subject/gestion-finance/theme/gf-t1', /Thème 1/],
  ['/favoris', /./],
  ['/badges', /Badge|badge/],
  ['/moi', /Léa/],
  ['/coach', /./],
  ['/revision', /./],
  ['/bac-blanc', /bac blanc|Bac blanc/i],
  ['/programme', /./],
  ['/grand-oral', /Grand Oral/i],
  ['/etude-de-gestion', /Étude de gestion/],
  ['/coach-ia', /./],
  ['/fiches-photo', /./],
  ['/defi', /./],
  ['/express', /./],
  ['/formules', /Atelier de formules/],
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
