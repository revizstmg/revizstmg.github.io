import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil } from './eleve.js'

// Données de l'élève : le suivi parent n'est publié que si l'élève l'active,
// l'export se télécharge, et « Supprimer mon compte » efface aussi amis, duels et
// suivi parent. Les appels à Supabase sont interceptés : rien n'atteint la base.
test('suivi parent volontaire, export et suppression complète', async ({ page }) => {
  await preparer(page)
  const appels = []
  await page.route(/supabase\.co/, (r) => {
    const u = new URL(r.request().url())
    appels.push(`${r.request().method()} ${u.pathname.replace('/rest/v1/', '')}`)
    r.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/moi')
  await page.waitForTimeout(4000)
  expect(appels, 'rien n’est publié sans accord').not.toContain('POST child_stats')
  expect(appels, 'ce qui avait été publié est effacé').toContain('DELETE child_stats')

  const partage = page.getByRole('switch', { name: /Partager ma progression/ })
  await expect(partage).toHaveAttribute('aria-checked', 'false')
  await partage.click()
  await expect(partage).toHaveAttribute('aria-checked', 'true')
  await expect.poll(() => appels.includes('POST child_stats'), { timeout: 8000 }).toBe(true)

  const fichier = page.waitForEvent('download')
  await page.getByRole('button', { name: /Télécharger mes données/ }).click()
  expect((await fichier).suggestedFilename()).toMatch(/^revizstmg-mes-donnees-.*\.json$/)

  appels.length = 0
  page.on('dialog', (d) => d.accept())
  await page.getByRole('button', { name: /Supprimer mon compte/ }).click()
  for (const table of ['class_member', 'friend_user', 'friend_request', 'friend_duel', 'child_stats']) {
    await expect.poll(() => appels.includes(`DELETE ${table}`), { message: table, timeout: 8000 }).toBe(true)
  }
})
