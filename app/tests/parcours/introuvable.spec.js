// Adresses qui n'existent pas : page « introuvable » dans l'app, et page 404 de
// GitHub Pages (pwa/404.html) pour une adresse hors de l'app.
import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { preparer, attendreAccueil } from './eleve.js'

const PAGE_404 = readFileSync(new URL('../../pwa/404.html', import.meta.url), 'utf8')

test('adresse inconnue : page introuvable et retour à l’accueil', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./'); await attendreAccueil(page)
  await page.goto('./#/nimporte-quoi')
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  await expect(page).toHaveTitle(/Page introuvable/)
  await page.getByRole('link', { name: 'Retour à l’accueil' }).click()
  await expect(page).toHaveURL(/#\/accueil$/)
  await expect(page).not.toHaveTitle(/Page introuvable/)
  expect(erreurs).toEqual([])
})

test('matière, thème ou chapitre disparus : on remonte au niveau qui existe', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./'); await attendreAccueil(page)

  await page.goto('./#/subject/matiere-inconnue')
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()

  await page.goto('./#/subject/gestion-finance/theme/theme-inconnu')
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  await expect(page.getByRole('link', { name: /^Revenir à/ })).toHaveAttribute('href', '#/subject/gestion-finance')

  await page.goto('./#/subject/gestion-finance/theme/gf-t1/chapter/999')
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  await page.getByRole('link', { name: /^Revenir à/ }).click()
  await expect(page).toHaveURL(/#\/subject\/gestion-finance\/theme\/gf-t1$/)
  expect(erreurs).toEqual([])
})

test('page 404 du site : adresse de l’app tapée sans « #/ » redirigée, sinon message', async ({ page }) => {
  await preparer(page)
  // GitHub Pages sert 404.html pour toute adresse inconnue : on l'imite.
  await page.route(/\/(cgu|existe-pas)$/, (route) => route.fulfill({ status: 404, contentType: 'text/html', body: PAGE_404 }))
  await page.goto('./existe-pas')
  await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toHaveAttribute('href', '/')

  await page.goto('./cgu')
  await expect(page).toHaveURL(/\/#\/cgu$/)
  await expect(page.getByRole('heading', { name: /Conditions d’utilisation/ })).toBeAttached()
})
