import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat, etatEleve, AUJOURDHUI } from './eleve.js'

const eleve = '00000000-0000-4000-8000-000000000001'
const prof = '00000000-0000-4000-8000-000000000002'
const profils = () => ({
  [eleve]: { id: eleve, name: 'Léa Élève', email: 'eleve@test.fr', role: 'eleve', level: 'premiere-stmg', class_code: null, progress: { xp: 20, streak: { count: 1, last: AUJOURDHUI } } },
  [prof]: { id: prof, name: 'Paul Professeur', email: 'prof@test.fr', role: 'prof', level: 'terminale-stmg', specialty: 'gestion-finance', class_code: 'stmg-prof', progress: { xp: 800, streak: { count: 1, last: AUJOURDHUI } } },
})
const session = (id, data) => ({ token: id, refresh: id, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id, email: data[id].email } })

async function reseau(page, data) {
  const ecritures = []
  await page.route('https://*.supabase.co/**', (route) => {
    const req = route.request(), url = new URL(req.url())
    const json = (body) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname.endsWith('/revizstmg-paiement')) return json({ mode: 'test', abonnement: { statut: 'active', offre: 'premium', periode_fin: '2999-01-01T00:00:00Z' } })
    if (url.pathname.endsWith('/token')) {
      const body = req.postDataJSON()
      const id = body.refresh_token || Object.keys(data).find((k) => data[k].email === body.email)
      return json({ access_token: id, refresh_token: id, expires_in: 3600, user: session(id, data).user })
    }
    if (url.pathname.endsWith('/profiles')) {
      const id = url.searchParams.get('id')?.replace('eq.', '')
      if (req.method() === 'GET') return json([data[id]])
      if (req.method() === 'PATCH') {
        const body = req.postDataJSON()
        ecritures.push({ id, ...body })
        if (data[id]) data[id] = { ...data[id], ...body }
      }
    }
    return json([])
  })
  return ecritures
}

for (const autreId of [false, true]) {
  test(`restaurer le compte élève avec un ancien état professeur (${autreId ? 'autre identité' : 'rôle périmé'})`, async ({ page }) => {
    const data = profils()
    const erreurs = await preparer(page, etatEleve({
      account: { id: autreId ? prof : eleve, email: 'prof@test.fr', role: 'prof' },
      profile: { firstName: 'Paul', lastName: 'Professeur' },
      teacherClasses: [{ code: 'stmg-prof' }], classCode: 'stmg-prof', xp: autreId ? 800 : 20,
    }))
    await page.addInitScript((s) => localStorage.setItem('stmg_session', JSON.stringify(s)), session(eleve, data))
    const writes = await reseau(page, data)
    await page.goto('./')
    await attendreAccueil(page)
    await expect.poll(async () => (await etat(page)).account?.role).toBe('eleve')
    const state = await etat(page)
    expect(state.account.id).toBe(eleve)
    expect(state.profile.firstName).toBe('Léa')
    expect(state.xp).toBe(20)
    expect(state.teacherClasses).toEqual([])
    expect(state.classCode).toBe('')
    await page.reload()
    await attendreAccueil(page)
    expect((await etat(page)).account.role).toBe('eleve')
    expect(writes.some((w) => w.id === eleve && w.progress?.xp >= 800)).toBe(false)
    expect(erreurs).toEqual([])
  })
}

test('élève → déconnexion → professeur → déconnexion → élève sur le même PC', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const data = profils()
  const erreurs = await preparer(page, etatEleve({ account: { id: eleve, email: data[eleve].email, role: 'eleve' }, xp: 20 }))
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('__session')) {
      sessionStorage.setItem('__session', '1')
      localStorage.setItem('stmg_session', JSON.stringify(s))
    }
    Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })
    // Pas de service de notifications dans ce navigateur de test.
    delete window.Notification
  }, session(eleve, data))
  const writes = await reseau(page, data)
  await page.goto('./')
  await attendreAccueil(page)
  const deconnecter = async (personnalisation = false) => {
    await page.getByRole('button', { name: 'Mon menu', exact: true }).click()
    if (personnalisation) await page.getByRole('button', { name: 'Personnaliser mon profil', exact: true }).click()
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click()
    await expect(page.getByRole('dialog').locator('#w-email')).toBeVisible()
    expect((await etat(page)).account).toBeNull()
    expect((await etat(page)).teacherClasses).toEqual([])
  }
  const connecter = async (id) => {
    const dialog = page.getByRole('dialog')
    await dialog.locator('#w-email').fill(data[id].email)
    await dialog.locator('#w-pass').fill('Motdepasse123')
    await dialog.getByRole('button', { name: 'Se connecter', exact: true }).click()
    await expect.poll(async () => (await etat(page)).account?.id).toBe(id)
    await attendreAccueil(page)
    expect((await etat(page)).account.role).toBe(data[id].role)
  }
  await page.goto('./#/coach')
  await page.getByRole('button', {name:/Démarrer/}).first().click()
  await page.waitForTimeout(1100)
  await page.getByRole('button', {name:/Pause/}).first().click()
  const minuteurEleve = await page.evaluate(id => JSON.parse(sessionStorage.getItem('stmg_focus_session_v1:'+id)), eleve)
  await deconnecter()
  await connecter(prof)
  await page.goto('./#/coach')
  await expect(page.getByRole('button', {name:/Démarrer/}).first()).toBeVisible()
  await deconnecter(true)
  await connecter(eleve)
  await page.goto('./#/coach')
  await expect(page.getByRole('button', {name:/Reprendre/}).first()).toBeVisible()
  expect(await page.evaluate(id => JSON.parse(sessionStorage.getItem('stmg_focus_session_v1:'+id)).remaining, eleve)).toBe(minuteurEleve.remaining)
  expect((await etat(page)).profile.firstName).toBe('Léa')
  expect((await etat(page)).xp).toBe(20)
  expect(writes.some((w) => w.id === eleve && w.progress?.xp >= 800)).toBe(false)
  await page.reload()
  await attendreAccueil(page)
  expect((await etat(page)).account).toMatchObject({ id: eleve, role: 'eleve' })
  expect(erreurs).toEqual([])
})

// Inscription avec confirmation de l'e-mail : à la première connexion, le
// compte n'a pas encore de fiche. L'élève termine son inscription au lieu de
// rester bloqué (ancien message sur un code de classe invisible).
test('première connexion après confirmation de l’e-mail : fin de l’inscription', async ({ page }) => {
  const data = { ...profils() }
  const nouveau = '00000000-0000-4000-8000-000000000003'
  const erreurs = await preparer(page, null)
  await page.route('https://*.supabase.co/**', (route) => {
    const req = route.request(), url = new URL(req.url())
    const json = (body) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname.endsWith('/token')) return json({ access_token: nouveau, refresh_token: nouveau, expires_in: 3600, user: { id: nouveau, email: 'nouveau@test.fr' } })
    if (url.pathname.endsWith('/settings')) return json({ external: {} })
    return json([])
  })
  await page.goto('./')
  const dialog = page.getByRole('dialog')
  await dialog.locator('#w-email').fill('nouveau@test.fr')
  await dialog.locator('#w-pass').fill('Motdepasse123')
  await dialog.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await expect(dialog.getByRole('heading', { name: 'Faisons connaissance' })).toBeVisible()
  await expect(dialog.getByText('✓ nouveau@test.fr')).toBeVisible()
  await expect(dialog.getByText(/aucune classe/)).toHaveCount(0)
  expect(data[nouveau]).toBeUndefined()
  expect(erreurs).toEqual([])
})
