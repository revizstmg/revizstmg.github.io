import { test, expect } from '@playwright/test'
import { preparer, etatEleve } from './eleve.js'

for (const nouveau of [false, true]) {
  test(`retour Google : accueil et session conservée (${nouveau ? 'nouveau compte' : 'compte existant'})`, async ({ page }) => {
    await preparer(page, nouveau ? null : etatEleve())
    const user = { id: '00000000-0000-4000-8000-000000000001', email: 'lea@test.fr', user_metadata: {} }
    await page.route('https://*.supabase.co/**', async (route) => {
      const url = new URL(route.request().url())
      if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user })
      if (url.pathname === '/auth/v1/settings') return route.fulfill({ json: { external: { google: true } } })
      if (url.pathname === '/rest/v1/profiles' && route.request().method() === 'GET') {
        return route.fulfill({ json: nouveau ? [] : [{ id: user.id, name: 'Léa Test', role: 'eleve', level: 'terminale-stmg', specialty: 'gestion-finance' }] })
      }
      return route.fulfill({ json: [] })
    })
    await page.goto('/#access_token=oauth-test-token&refresh_token=oauth-test-refresh&expires_in=3600&token_type=bearer')
    await expect(page).toHaveURL(/#\/accueil$/)
    await expect(page.getByText('Page introuvable', { exact: true })).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('stmg_session') || '{}').token)).toBe('oauth-test-token')
    if (nouveau) {
      await expect(page.locator('#w-first')).toBeVisible()
      await expect(page.getByText(`✓ ${user.email}`, { exact: true })).toBeVisible()
    } else {
      await expect(page.locator('main h1')).toContainText('Léa')
    }
    await page.reload()
    await expect(page).toHaveURL(nouveau ? /#\/$/ : /#\/accueil$/)
    await expect(page.getByText('Page introuvable', { exact: true })).toHaveCount(0)
  })
}

test('un vrai lien inexistant garde sa page 404', async ({ page }) => {
  await preparer(page)
  await page.goto('/#/page-vraiment-inexistante')
  await expect(page.getByText('Page introuvable', { exact: true })).toBeVisible()
})
