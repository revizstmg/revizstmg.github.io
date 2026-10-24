import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat } from './eleve.js'

for (const chemin of ['classe', 'classement']) {
  for (const cas of ['inconnu puis valide', 'recherche indisponible', 'exclu', 'exclusion indisponible', 'profil indisponible']) {
    test(`${chemin} : code de classe ${cas}`, async ({ page }) => {
      const erreurs = await preparer(page)
      await page.addInitScript(() => localStorage.setItem('stmg_session', JSON.stringify({
        token: 'jeton-de-test', refresh: 'r', expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: '00000000-0000-4000-8000-000000000001', email: 'lea@test.fr' },
      })))
      let recherches = 0
      const adhesions = []
      await page.route('https://*.supabase.co/**', async (route) => {
        const req = route.request()
        const url = new URL(req.url())
        const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
        if (url.pathname.endsWith('/rpc/revizstmg_classe')) {
          recherches++
          const { p_code } = req.postDataJSON()
          if (cas === 'recherche indisponible') return route.abort('failed')
          return json(p_code === 'stmg-abc23' ? [{ code: p_code, label: 'Classe test' }] : [])
        }
        if (url.pathname.endsWith('/class_ban')) {
          if (cas === 'exclusion indisponible') return route.abort('failed')
          return json(cas === 'exclu' ? [{ device_id: 'test' }] : [])
        }
        if (req.method() !== 'GET' && req.method() !== 'OPTIONS') {
          const body = req.postDataJSON()
          const rows = Array.isArray(body) ? body : [body]
          for (const row of rows) if (row?.class_code) adhesions.push({ table: url.pathname, code: row.class_code })
          if (cas === 'profil indisponible' && url.pathname.endsWith('/profiles') && rows.some((r) => r?.class_code)) return json({ message: 'indisponible' }, 503)
        }
        return json([])
      })
      await page.goto('./')
      await attendreAccueil(page)
      await page.goto(`./#/${chemin}`)
      const input = page.getByLabel('Code de classe', { exact: true })
      await expect(input).toBeVisible()
      await input.fill(cas === 'inconnu puis valide' ? 'code-inexistant' : 'STMG-ABC23')
      await input.press('Enter')
      const message = cas === 'inconnu puis valide' ? /aucune classe/ : cas === 'exclu' ? /exclu/ : /Impossible de vérifier/
      await expect(page.getByRole('alert')).toContainText(message)
      expect((await etat(page)).classCode || '').toBe('')
      await expect(page.getByRole('button', { name: 'Changer de classe', exact: true })).toHaveCount(0)
      expect(adhesions.filter((a) => !a.table.endsWith('/profiles'))).toEqual([])
      if (cas !== 'profil indisponible') expect(adhesions).toEqual([])
      if (cas === 'inconnu puis valide') {
        await input.fill(' STMG-ABC23 ')
        await page.getByRole('button', { name: 'Rejoindre', exact: true }).click()
        await expect(page.getByRole('button', { name: 'Changer de classe', exact: true })).toBeVisible()
        await expect.poll(async () => (await etat(page)).classCode).toBe('stmg-abc23')
        expect(adhesions.some((a) => a.table.endsWith('/profiles') && a.code === 'stmg-abc23')).toBe(true)
        await page.reload()
        await attendreAccueil(page)
        await expect(page.getByRole('button', { name: 'Changer de classe', exact: true })).toBeVisible()
      }
      // Le nom est aussi relu à l’entrée et après rechargement de l’espace classe.
      expect(recherches).toBe(cas === 'inconnu puis valide' ? (chemin === 'classe' ? 4 : 2) : 1)
      expect(erreurs).toEqual([])
    })
  }
}

test('inscription : corriger un code inconnu sans recréer le compte', async ({ page }) => {
  const erreurs = await preparer(page, null)
  let creations = 0
  const profils = []
  await page.route('https://*.supabase.co/**', async (route) => {
    const req = route.request()
    const path = new URL(req.url()).pathname
    const json = (body) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (path.endsWith('/signup')) {
      creations++
      return json({ access_token: 'jeton-de-test', refresh_token: 'r', expires_in: 3600, user: { id: '00000000-0000-4000-8000-000000000001', email: 'lea@test.fr' } })
    }
    if (path.endsWith('/rpc/revizstmg_classe')) {
      const { p_code } = req.postDataJSON()
      return json(p_code === 'stmg-abc23' ? [{ code: p_code }] : [])
    }
    if (path.endsWith('/profiles') && req.method() === 'POST') profils.push(...req.postDataJSON())
    return json([])
  })
  await page.goto('./')
  const accueil = page.getByRole('dialog')
  await accueil.getByRole('button', { name: /Pas encore de compte/ }).click()
  await accueil.locator('#w-email').fill('lea@test.fr')
  await accueil.locator('#w-pass').fill('Motdepasse123')
  await accueil.getByRole('button', { name: 'Suivant', exact: true }).click()
  await accueil.locator('#w-first').fill('Léa')
  await accueil.locator('#w-last').fill('Test')
  await accueil.getByRole('button', { name: 'Suivant', exact: true }).click()
  await accueil.getByRole('button', { name: /Première STMG/ }).click()
  await accueil.locator('#w-cc').fill('code-inexistant')
  await accueil.getByRole('checkbox').check()
  // Délai anti-robot du formulaire.
  await page.waitForTimeout(3100)
  await accueil.getByRole('button', { name: 'Créer mon compte', exact: true }).click()
  await expect(accueil.getByText(/Ce code ne correspond à aucune classe/)).toBeVisible()
  expect(profils.filter((p) => p.class_code)).toEqual([])
  expect((await etat(page)).classCode || '').toBe('')
  await accueil.locator('#w-cc').fill('STMG-ABC23')
  await accueil.getByRole('button', { name: /Terminer/ }).click()
  await expect.poll(async () => (await etat(page)).classCode).toBe('stmg-abc23')
  expect(creations).toBe(1)
  expect(profils.some((p) => p.class_code === 'stmg-abc23')).toBe(true)
  expect(erreurs).toEqual([])
})
