import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

const sdgn = JSON.parse(readFileSync(new URL('../../content/p1-sgn/matiere.json', import.meta.url), 'utf8')).chapters[0]
const masteredSdgn = { quiz: 100, games: Object.fromEntries(sdgn.games.map((g) => [g.id, 100])) }

test('le programme bac de Première ne propose que français et maths, même après du SDGN', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' }, chapters: { 'p1-sgn-t1': masteredSdgn }, srs: { 'p1-sgn-t1': { due: '2020-01-01' } } }))
  await page.goto('./#/programme')
  await attendreAccueil(page)
  const goals = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Tes objectifs du jour', exact: true }) })
  const buttons = goals.getByRole('button')
  await expect(buttons).toHaveCount(4)
  for (const button of await buttons.all()) await expect(button).toContainText(/Français|Maths|Mathématiques/)
  await expect(goals).not.toContainText(/SDGN|Management|Économie|Droit|Histoire|Langues/)
  const progress = page.locator('section').filter({ hasText: 'Avancement global' })
  await expect(progress).toContainText(/0 \/ \d+ thèmes/)
  await buttons.first().click()
  await expect(page).toHaveURL(/subject\/p1-(francais|maths)\/theme\//)
  expect(erreurs).toEqual([])
})
