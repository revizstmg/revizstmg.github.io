import { beforeEach, afterEach, test, expect, vi } from 'vitest'

const prof = { token: 'prof-token', refresh: 'prof-refresh', user: { id: 'prof' }, expires_at: 1 }
const eleve = { token: 'eleve-token', refresh: 'eleve-refresh', user: { id: 'eleve' }, expires_at: 9999999999 }
let api
beforeEach(async () => {
  vi.resetModules()
  const items = new Map()
  vi.stubGlobal('localStorage', { getItem: (k) => items.get(k) ?? null, setItem: (k, v) => items.set(k, v), removeItem: (k) => items.delete(k) })
  localStorage.setItem('stmg_session', JSON.stringify(prof))
  api = await import('../src/auth.js')
})
afterEach(() => vi.unstubAllGlobals())

for (const status of [200, 401]) {
  test(`une réponse tardive du professeur (${status}) ne remplace ni ne déconnecte l’élève`, async () => {
    let terminer
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { terminer = resolve })))
    const attente = api.refreshSession()
    localStorage.setItem('stmg_session', JSON.stringify(eleve))
    terminer(new Response(JSON.stringify({ access_token: 'prof-nouveau', refresh_token: 'prof-renouvele', user: prof.user }), { status }))
    expect(await attente).toBeNull()
    expect(api.getSession()).toEqual(eleve)
  })
}

test('une réponse tardive ne rouvre pas la session après déconnexion', async () => {
  let terminer
  vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { terminer = resolve })))
  const attente = api.refreshSession()
  api.signOut()
  terminer(new Response(JSON.stringify({ access_token: 'prof-nouveau', user: prof.user })))
  expect(await attente).toBeNull()
  expect(api.getSession()).toBeNull()
})

test('une requête commencée par le professeur ne repart pas avec le jeton élève', async () => {
  let terminer
  const fetch = vi.fn().mockImplementationOnce(() => new Promise((resolve) => { terminer = resolve })).mockResolvedValue(new Response('{}'))
  vi.stubGlobal('fetch', fetch)
  const attente = api.authFetch('https://test.invalid/profiles?id=eq.prof', { method: 'PATCH', body: '{}' })
  localStorage.setItem('stmg_session', JSON.stringify(eleve))
  terminer(new Response(JSON.stringify({ access_token: 'prof-nouveau', user: prof.user })))
  await expect(attente).rejects.toThrow(/session/i)
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(api.getSession()).toEqual(eleve)
})

test('le renouvellement normal conserve le compte et remplace son jeton', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ access_token: 'prof-nouveau', refresh_token: 'prof-renouvele', user: prof.user }))))
  const result = await api.refreshSession()
  expect(result.user.id).toBe('prof')
  expect(api.getSession().token).toBe('prof-nouveau')
})

test('le nouveau compte renouvelle sa propre session sans attendre celle de l’ancien', async () => {
  let terminer
  const fetch = vi.fn().mockImplementationOnce(() => new Promise((resolve) => { terminer = resolve }))
    .mockResolvedValue(new Response(JSON.stringify({ access_token: 'eleve-nouveau', refresh_token: 'eleve-renouvele', user: eleve.user })))
  vi.stubGlobal('fetch', fetch)
  const ancien = api.refreshSession()
  localStorage.setItem('stmg_session', JSON.stringify(eleve))
  const nouveau = await api.refreshSession()
  expect(nouveau.user.id).toBe('eleve')
  terminer(new Response(JSON.stringify({ access_token: 'prof-tardif', user: prof.user })))
  expect(await ancien).toBeNull()
  expect(api.getSession().token).toBe('eleve-nouveau')
})
