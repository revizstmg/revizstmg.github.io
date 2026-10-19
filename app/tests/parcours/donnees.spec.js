import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil } from './eleve.js'

// Données de l'élève : le suivi parent n'est publié que si l'élève l'active,
// l'export se télécharge, et « Supprimer mon compte » demande à la base
// d'effacer le compte et tout ce qu'il a publié (revizstmg_supprimer_compte).
// Les appels à Supabase sont interceptés : rien n'atteint la base.
test('suivi parent volontaire, export et suppression complète', async ({ page }) => {
  await preparer(page)
  // Une session (factice) : la suppression du compte passe par la base. Posée
  // une seule fois : window.name survit au rechargement qui suit la suppression,
  // contrairement au stockage du navigateur, que l'application vide.
  await page.addInitScript(() => {
    if (!window.name.includes('session-posee')) {
      window.name += 'session-posee'
      localStorage.setItem('stmg_session', JSON.stringify({ token: 'jeton-de-test', refresh: 'r', user: { id: '00000000-0000-4000-8000-000000000001', email: 'lea@test.fr' }, expires_at: Math.floor(Date.now() / 1000) + 3600 }))
    }
  })
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
  await expect.poll(() => appels.includes('POST rpc/revizstmg_supprimer_compte'), { timeout: 8000 }).toBe(true)
  // Puis tout ce que garde le navigateur est effacé (session, code parent…) et
  // l'application repart à neuf.
  // (Pendant le rechargement, la page ne répond pas : on réessaie.)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('stmg_session')).catch(() => 'rechargement'), { timeout: 8000 }).toBeNull()
  await page.waitForLoadState()
  expect(await page.evaluate(() => localStorage.getItem('stmg_parent_code'))).toBeNull()
  expect(await page.evaluate(() => location.hash)).not.toContain('/moi')
})
