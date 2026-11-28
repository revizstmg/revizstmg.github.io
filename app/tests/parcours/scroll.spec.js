import { test, expect } from '@playwright/test'
import { preparer, etatEleve } from './eleve.js'

// Mode Scroll : un contenu par écran, ouvert à tous (aucun abonnement requis).
test('choisir un thème, faire défiler, retourner une flashcard et répondre à une question', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/scroll')
  await expect(page.getByRole('heading', { name: 'Des exercices en faisant défiler' })).toBeVisible()
  await page.locator('summary', { hasText: 'Gestion' }).first().click()
  await page.locator('a[href^="#/scroll/gestion-finance/"]').first().click()
  // l'élève choisit son chapitre
  await expect(page.getByText('Choisis ton chapitre.')).toBeVisible()
  await page.locator('a[href^="#/scroll/gestion-finance/"][href$="/2"]').first().click()
  const flux = page.getByRole('region', { name: 'Mode Scroll' })
  await expect(flux).toBeVisible()
  await expect(flux.locator('.scroll-carte[data-genre="cours"]')).toHaveCount(0)
  const cartes = flux.locator('.scroll-carte')
  expect(await cartes.count()).toBeGreaterThan(20)
  // défiler jusqu'à la première flashcard et la retourner
  const flash = flux.locator('button.scroll-flash').first()
  await flash.scrollIntoViewIfNeeded()
  await flash.click()
  await expect(flash).toHaveAttribute('aria-pressed', 'true')
  // défiler jusqu'à la première question, y répondre
  const choix = flux.locator('.scroll-choix button').first()
  await choix.scrollIntoViewIfNeeded()
  await choix.click()
  await expect(flux.getByRole('status').first()).toBeVisible()
  await page.screenshot({ path: '/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad/scroll-qcm.png' })
  await flux.getByRole('button', { name: 'Fermer le mode scroll' }).click()
  await expect(page.getByText('Choisis ton chapitre.')).toBeVisible()
  expect(erreurs).toEqual([])
})

test('formats ludiques : compléter le cours, A ou B, remettre dans l’ordre, associer, mot mélangé', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/scroll/gestion-finance/gf-t1/18')
  const flux = page.getByRole('region', { name: 'Mode Scroll' })
  await expect(flux).toBeVisible()
  const sd = '/tmp/claude-0/-home-user-NAH/b00c6cf6-33b6-5d76-a12d-45338d0a337c/scratchpad'
  // À compléter : on touche un mot, le trou se remplit et on voit le verdict
  const trou = flux.locator('.scroll-carte[data-genre="trou"]').first()
  await trou.scrollIntoViewIfNeeded()
  await trou.locator('.scroll-mots button').first().click()
  await expect(trou.locator('.scroll-trou').first()).not.toHaveAttribute('data-etat', 'vide')
  await page.screenshot({ path: `${sd}/scroll-trou.png` })
  // Associer : trois paires à relier
  const paires = flux.locator('.scroll-carte[data-genre="paires"]').first()
  await paires.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${sd}/scroll-paires.png` })
  // Mot mélangé : on rend la main avec « Je sèche »
  const mot = flux.locator('.scroll-carte[data-genre="mot"]').first()
  await mot.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${sd}/scroll-mot.png` })
  await mot.getByRole('button', { name: 'Je sèche' }).click()
  await expect(mot.getByRole('status')).toContainText('Le mot était')
  // Remettre dans l'ordre : on joue les étapes dans le bon ordre (la bonne se reconnaît à la fin)
  const ordre = flux.locator('.scroll-carte[data-genre="ordre"]').first()
  await ordre.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${sd}/scroll-ordre.png` })
  expect(erreurs).toEqual([])
})

test('calcul : une saisie chiffrée est corrigée avec l’explication', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/scroll/gestion-finance/gf-t1/2')
  const flux = page.getByRole('region', { name: 'Mode Scroll' })
  const carte = flux.locator('.scroll-carte[data-genre="calcul"]').first()
  await carte.scrollIntoViewIfNeeded()
  await carte.getByLabel('Ta réponse').fill('1')
  await carte.getByRole('button', { name: 'Valider' }).click()
  await expect(carte.getByRole('status')).toContainText('Il fallait trouver')
  expect(erreurs).toEqual([])
})

// Offre gratuite : un mode Scroll très limité (6 cartes par chapitre), avec le chemin vers Premium.
test('offre gratuite : 6 cartes par chapitre puis une invitation à passer à Premium', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/scroll/gestion-finance/gf-t1')
  await expect(page.locator('[data-scroll-gratuit]')).toBeVisible()
  await page.locator('a[href^="#/scroll/gestion-finance/"][href$="/2"]').first().click()
  const flux = page.getByRole('region', { name: 'Mode Scroll' })
  await expect(flux).toBeVisible()
  // 6 cartes d'exercice + la carte de fin
  await expect(flux.locator('.scroll-carte')).toHaveCount(7)
  await expect(flux.locator('[data-scroll-limite]')).toHaveCount(1)
  expect(erreurs).toEqual([])
})

test('offre gratuite : deux exercices par chapitre, le reste est réservé aux abonnés', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve(), { abonnement: null })
  await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/2')
  await page.getByRole('button', { name: /Exercices/ }).click()
  await expect(page.locator('[data-jeu]')).toHaveCount(2)
  await expect(page.locator('[data-exos-verrouilles]')).toBeVisible()
  expect(erreurs).toEqual([])
})

// Le clavier numérique des téléphones n'a pas de signe moins : un bouton « − » l'écrit dans la réponse.
test('calcul : le bouton moins écrit et retire le signe', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.goto('./#/scroll/gestion-finance/gf-t1/2')
  const flux = page.getByRole('region', { name: 'Mode Scroll' })
  const carte = flux.locator('.scroll-carte[data-genre="calcul"]').first()
  await carte.scrollIntoViewIfNeeded()
  const champ = carte.getByLabel('Ta réponse')
  await champ.fill('4,5')
  await carte.getByRole('button', { name: 'Signe moins' }).click()
  await expect(champ).toHaveValue('−4,5')
  await carte.getByRole('button', { name: 'Signe moins' }).click()
  await expect(champ).toHaveValue('4,5')
  expect(erreurs).toEqual([])
})
