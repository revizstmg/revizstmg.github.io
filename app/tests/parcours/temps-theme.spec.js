import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat } from './eleve.js'

test('une courte visite et une séance guidée sont attribuées au thème', async ({ page }) => {
 const errors = await preparer(page)
 await page.clock.install()
 await page.goto('./#/subject/gf/theme/gf-t1')
 await attendreAccueil(page)
 await page.clock.runFor(2500)
 await page.evaluate(() => { location.hash = '#/moi' })
 await expect.poll(async () => (await etat(page)).themeTime?.['gf-t1'] || 0).toBeGreaterThan(2)
 await expect(page.getByText('< 1 min', { exact: true })).toBeVisible()
 const before = (await etat(page)).themeTime['gf-t1']
 await page.evaluate(() => { location.hash = '#/seance' })
 await expect(page.getByText(/Étape 1\//).first()).toBeVisible()
 await page.clock.runFor(31000)
 const after = (await etat(page)).themeTime
 expect(Object.entries(after).some(([id, sec]) => id !== '__study' && sec > (id === 'gf-t1' ? before : 0))).toBe(true)
 expect(after.__study || 0).toBe(0)
 expect(errors).toEqual([])
})
