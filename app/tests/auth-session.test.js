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
  const reponses = []
  vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { reponses.push(resolve) })))
  const attente = api.refreshSession()
  api.signOut()
  // La première requête est le renouvellement ; la seconde, la fermeture de session.
  reponses[0](new Response(JSON.stringify({ access_token: 'prof-nouveau', user: prof.user })))
  expect(await attente).toBeNull()
  expect(api.getSession()).toBeNull()
})

test('la déconnexion efface la session tout de suite et la ferme sur le serveur', async () => {
  localStorage.setItem('stmg_session', JSON.stringify(eleve))
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetch)
  api.signOut()
  expect(api.getSession()).toBeNull()
  expect(fetch).toHaveBeenCalledTimes(1)
  const [url, options] = fetch.mock.calls[0]
  expect(url).toMatch(/\/auth\/v1\/logout/)
  expect(options.method).toBe('POST')
  expect(options.headers.Authorization).toBe('Bearer eleve-token')
})

test('hors ligne, la déconnexion efface quand même la session de l’appareil', () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
  api.signOut()
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

test('une session rejetée et non renouvelable est signalée sans conserver un faux état connecté',async()=>{
 localStorage.setItem('stmg_session',JSON.stringify(eleve))
 const dispatchEvent=vi.fn();vi.stubGlobal('window',{dispatchEvent})
 const request=vi.fn().mockResolvedValueOnce(new Response('{}',{status:401})).mockResolvedValueOnce(new Response('{}',{status:400}));vi.stubGlobal('fetch',request)
 await expect(api.authFetch('https://example.test/rest/v1/leaderboard')).rejects.toThrow(/session a changé/)
 expect(api.getSession()).toBeNull();expect(dispatchEvent).toHaveBeenCalled();expect(request).toHaveBeenCalledTimes(2)
 expect(request.mock.calls[0][1].headers.Authorization).toBe('Bearer eleve-token')
})

test('les espaces sociaux refusent un appel anonyme ; le suivi parent par code reste public',async()=>{
 api.clearSession();const fetch=vi.fn().mockResolvedValue(new Response('[]'));vi.stubGlobal('fetch',fetch)
 const network=await import('../src/reseau.js')
 await expect(network.getJSON('https://example.test/rest/v1/leaderboard')).rejects.toMatchObject({status:401})
 await expect(network.rpc('revizstmg_ligue')).rejects.toMatchObject({status:401});expect(fetch).not.toHaveBeenCalled()
 expect(await network.rpc('revizstmg_stats_enfant',{p_code:'CODE-TEST'})).toEqual([]);expect(fetch).toHaveBeenCalledTimes(1)
})
