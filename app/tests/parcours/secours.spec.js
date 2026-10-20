import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil } from './eleve.js'

// Se déconnecter depuis une page réservée aux élèves inscrits doit ramener à
// l'accueil, pas laisser un écran blanc (hooks React appelés après une redirection).
const PAGES_ELEVE = ['/bac-blanc', '/programme', '/revision', '/coach', '/atelier-formules', '/coach-ia', '/amis', '/grand-oral', '/etude-de-gestion']
for (const route of PAGES_ELEVE) {
  test(`déconnexion depuis ${route}`, async ({ page }) => {
    const erreurs = await preparer(page)
    await page.goto('./')
    await attendreAccueil(page)
    await page.goto(`./#${route}`)
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: 'Menu' }).first().click()
    await page.getByRole('button', { name: /Se déconnecter/ }).first().click()
    // L'élève fictif n'a pas de session : sa progression ne peut pas partir, on
    // le prévient (EtatSauvegarde.jsx) et il choisit de se déconnecter quand même.
    await page.getByRole('alertdialog').getByRole('button', { name: 'Me déconnecter quand même' }).click()
    await page.waitForTimeout(1000)
    const texte = await page.locator('#root').innerText()
    expect(texte.length, 'la page n’est pas blanche').toBeGreaterThan(40)
    expect(erreurs).toEqual([])
  })
}

// Si une page plante quand même, seul son contenu est remplacé par l'écran de
// secours ; l'en-tête reste, et on peut repartir. Le service worker est bloqué
// pour que le faux fichier de page soit bien celui que le navigateur reçoit.
test.describe('écran de secours', () => {
  test.use({ serviceWorkers: 'block' })
  test('une page qui plante n’emporte pas tout le site', async ({ page }) => {
    await preparer(page)
    await page.route(/assets\/Badges-[^/]*\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: 'throw new Error("plantage simulé")' }))
    await page.goto('./')
    await attendreAccueil(page)
    await page.goto('./#/badges')
    await expect(page.getByRole('alert')).toContainText('Cette page a rencontré un problème')
    await expect(page.getByRole('button', { name: 'Menu' }).first()).toBeVisible()
    await page.getByRole('link', { name: /Retour à l’accueil/ }).click()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })
})
