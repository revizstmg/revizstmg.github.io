import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat } from './eleve.js'

test('une courte visite et une séance guidée sont attribuées au thème', async ({ page }) => {
 const errors = await preparer(page)
 await page.clock.install()
 await page.goto('./#/subject/gestion-finance/theme/gf-t1')
 await attendreAccueil(page)
 await expect(page.getByRole('heading',{level:1})).toContainText(/comptables/i)
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

test('la capture aux durées énormes est réparée au chargement, sans perdre les durées normales', async ({ page }) => {
 const { etatEleve } = await import('./eleve.js')
 const broken = 28170042895242380 * 3600
 const errors = await preparer(page, etatEleve({ xp: 986, themeTime: { 'gf-t1': broken, 'histoire-t1': 6225 * 3600, 'gf-t2': 6480, 'gf-t3': '300' } }))
 await page.goto('./#/moi'); await attendreAccueil(page)
 await expect(page.getByText(/D’anciens temps incohérents/)).toBeVisible()
 await expect(page.getByText('1 h 48', { exact: true })).toBeVisible()
 await expect(page.getByText('5 min', { exact: true })).toBeVisible()
 await expect(page.getByText(/281700|6225 h/)).toHaveCount(0)
 await expect.poll(async () => (await etat(page)).themeTime?.['gf-t1']).toBe(0)
 const repaired = await etat(page)
 expect(repaired.themeTimeInvalid['gf-t1']).toBe(broken)
 expect(repaired.xp).toBe(986)
 await page.reload(); await attendreAccueil(page)
 await expect(page.getByText('1 h 48', { exact: true })).toBeVisible()
 await expect(page.getByText(/281700|6225 h/)).toHaveCount(0)
 expect(errors).toEqual([])
})
