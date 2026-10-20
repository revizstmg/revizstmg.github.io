import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat, AUJOURDHUI } from './eleve.js'

// La progression gardée sur l'appareil ne disparaît plus sans prévenir :
// essai sans compte, copie abîmée, stockage plein.
const essai = { profile: { firstName: 'Inès', lastName: '' }, account: null, track: { level: 'terminale-stmg', specialty: 'gestion-finance' }, onboarded: true, xp: 40, streak: { count: 1, last: AUJOURDHUI } }

test('essai sans compte : la déconnexion demande avant d’effacer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const erreurs = await preparer(page, essai)
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  const seDeconnecter = async () => {
    await page.getByRole('button', { name: 'Mon menu', exact: true }).click()
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click()
  }
  await seDeconnecter()
  const alerte = page.getByRole('alertdialog')
  await expect(alerte).toContainText('Ta progression d’essai va être effacée')
  await alerte.getByRole('button', { name: 'Continuer l’essai' }).click()
  await expect(alerte).toHaveCount(0)
  expect((await etat(page)).xp).toBe(40)

  await seDeconnecter()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Tout effacer' }).click()
  await expect.poll(async () => (await etat(page)).xp || 0).toBe(0)
  expect(erreurs).toEqual([])
})

test('une copie abîmée est remplacée par la copie de secours', async ({ page }) => {
  const erreurs = await preparer(page, null)
  await page.addInitScript((secours) => {
    if (sessionStorage.getItem('__abime')) return
    sessionStorage.setItem('__abime', '1')
    localStorage.setItem('stmg_progress_v2', '{"xp": 12, "profile": {"firstName"')
    localStorage.setItem('stmg_progress_v2_secours', JSON.stringify(secours))
  }, { ...essai, xp: 1234 })
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  expect((await etat(page)).xp).toBe(1234)
  expect(await page.evaluate(() => localStorage.getItem('stmg_progress_v2_abime'))).toContain('"xp": 12')
  expect(erreurs).toEqual([])
})

test('stockage plein : l’élève est prévenu', async ({ page }) => {
  const erreurs = await preparer(page, essai)
  await page.addInitScript(() => {
    const ecrire = Storage.prototype.setItem
    Storage.prototype.setItem = function (cle, valeur) {
      if (cle.startsWith('stmg_progress_v2') && sessionStorage.getItem('__plein')) throw new DOMException('Plus de place', 'QuotaExceededError')
      return ecrire.call(this, cle, valeur)
    }
    sessionStorage.setItem('__plein', '1')
  })
  await page.goto('./#/accueil')
  await attendreAccueil(page)
  await expect(page.getByRole('alert').filter({ hasText: 'Progression non enregistrée sur cet appareil' })).toBeVisible()
  expect(erreurs).toEqual([])
})
