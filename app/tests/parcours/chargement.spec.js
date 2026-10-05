// Chargement à la demande et hors-ligne.
import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { preparer, attendreAccueil } from './eleve.js'

const lire = (chemin) => JSON.parse(readFileSync(new URL(`../../content/${chemin}`, import.meta.url), 'utf8'))
const PHILO = lire('philosophie/matiere.json').chapters[0]
const DROIT = lire('droit/matiere.json').chapters[0]

test('démarrage léger : le contenu d’une matière n’arrive qu’à son ouverture', async ({ page }) => {
  const fichiers = []
  page.on('request', (r) => {
    const u = r.url()
    if (u.includes('/assets/')) fichiers.push(u.split('/assets/')[1])
  })
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  expect(fichiers.filter((f) => f.startsWith('contenu-')), 'aucune matière chargée à l’accueil').toEqual([])

  await page.goto('./#/subject/droit')
  await expect(page.locator('main')).toContainText(DROIT.name.replace(/^Thème \d+ — /, ''))
  const matieres = fichiers.filter((f) => f.startsWith('contenu-'))
  expect(matieres.some((f) => f.startsWith('contenu-droit-'))).toBe(true)
  expect(matieres.filter((f) => !f.startsWith('contenu-droit-')), 'seulement le droit').toEqual([])
  expect(erreurs).toEqual([])
})

test('hors ligne : après une première visite, une matière jamais ouverte s’affiche', async ({ page, context }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  // Le service worker met en cache tous les fichiers de l'app à l'installation.
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker.ready
    if (!reg.active) return false
    const nom = (await caches.keys()).find((k) => k.startsWith('revizstmg-') && !k.includes('fonts'))
    if (!nom) return false
    const urls = (await (await caches.open(nom)).keys()).map((r) => r.url)
    return urls.some((u) => u.includes('/assets/contenu-philosophie-'))
  }, null, { timeout: 30000 })

  await context.setOffline(true)
  await page.reload()
  await attendreAccueil(page)
  await page.goto(`./#/subject/philosophie/theme/${PHILO.id}/chapter/0`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect((await page.locator('main').innerText()).length).toBeGreaterThan(300)
  await context.setOffline(false)
  expect(erreurs).toEqual([])
})
