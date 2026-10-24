import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Contrôle automatique d'accessibilité (axe-core, règles WCAG 2.2 A et AA) sur
// les pages principales, en clair et en sombre, sur une fenêtre ouverte et
// pendant un exercice. Il ne remplace pas un essai avec un lecteur d'écran.
const REGLES = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const PAGES = ['accueil', 'cours', 'seance', 'revision', 'subject/gestion-finance', 'subject/gestion-finance/theme/gf-t1',
  'subject/droit/theme/droit-t5/chapter/1', 'moi', 'moi?section=reglages', 'classement', 'boutique', 'badges', 'programme',
  'confidentialite', 'cgu', 'atelier-formules', 'bac-blanc', 'grand-oral', 'mes-notes', 'coach', 'parent']

async function defauts(page) {
  // Attendre la fin des apparitions en fondu : axe mesurerait des couleurs à mi-chemin.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity))
  const r = await new AxeBuilder({ page }).withTags(REGLES).analyze()
  return r.violations.map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' ' + (n.failureSummary || '').split('\n')[1]).join(' | ')}`)
}

for (const theme of ['light', 'dark']) {
  test(`pages principales sans défaut d’accessibilité détecté : ${theme === 'dark' ? 'sombre' : 'clair'}`, async ({ page }) => {
    test.setTimeout(180000)
    await preparer(page, etatEleve({ theme }))
    const trouves = {}
    for (const p of PAGES) {
      await page.goto('./#/' + p)
      if (p === 'accueil') await attendreAccueil(page)
      await page.locator('main').waitFor()
      await page.waitForTimeout(400)
      const d = await defauts(page)
      if (d.length) trouves[p] = d
    }
    expect(trouves).toEqual({})
  })
}

test('fenêtre ouverte et exercice en cours sans défaut détecté', async ({ page }) => {
  test.setTimeout(120000)
  await preparer(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('./')
  await attendreAccueil(page)
  await page.getByRole('button', { name: 'Rechercher un chapitre', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await defauts(page)).toEqual([])
  await page.keyboard.press('Escape')
  await page.goto('./#/subject/droit/theme/droit-t5/chapter/1')
  await page.getByRole('button', { name: /Exercices/ }).click()
  await page.getByRole('button', { name: /QCM - le mot manquant/ }).first().click()
  const entrainement = page.getByRole('button', { name: /Entraînement/ })
  await page.waitForTimeout(300)
  if (await entrainement.count()) await entrainement.click()
  await expect(page.locator('[data-exercice]')).toContainText(/Question 1 \//)
  expect(await defauts(page)).toEqual([])
})
