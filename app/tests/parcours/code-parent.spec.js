import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Code parent : 10 caractères, et « Renouveler le code » remplace l'ancien
// (la ligne est effacée puis republiée sous le nouveau code).
const ELEVE = '00000000-0000-4000-8000-000000000001'
const SESSION = { token: 'jeton', refresh: 'renouvellement', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: ELEVE, email: 'lea@test.fr' } }

test('renouveler le code parent : nouveau code de 10 caractères, ancien effacé', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ parentShare: true }))
  await page.addInitScript((s) => {
    localStorage.setItem('stmg_session', JSON.stringify(s))
    localStorage.setItem(`stmg_parent_code:${s.user.id}`, 'PABC23')
    delete window.Notification
  }, SESSION)
  const journal = []
  await page.route('https://*.supabase.co/**', (route) => {
    const req = route.request(), url = new URL(req.url())
    const json = (body) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname.endsWith('/child_stats')) {
      if (req.method() === 'DELETE') { journal.push('delete'); return route.fulfill({ status: 204 }) }
      if (req.method() === 'POST') { const [row] = req.postDataJSON(); journal.push(`post:${row.code}`); return json([{ code: row.code }]) }
    }
    if (url.pathname.endsWith('/profiles')) return json([{ id: ELEVE, name: 'Léa Test', role: 'eleve', level: 'terminale-stmg', specialty: 'gestion-finance', progress: {} }])
    return json([])
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('./#/moi?section=reglages')
  await attendreAccueil(page)
  await expect(page.getByText('PABC23', { exact: true })).toBeVisible()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Renouveler le code' }).click()
  await expect(page.getByText('Nouveau code créé. Donne-le à tes parents.')).toBeVisible()
  const code = await page.evaluate(id => localStorage.getItem(`stmg_parent_code:${id}`), ELEVE)
  expect(code).toMatch(/^P[A-Z2-9]{9}$/)
  await expect(page.getByText(code, { exact: true })).toBeVisible()
  expect(journal.indexOf('delete')).toBeGreaterThanOrEqual(0)
  expect(journal.indexOf(`post:${code}`)).toBeGreaterThan(journal.indexOf('delete'))
  expect(erreurs).toEqual([])
})
