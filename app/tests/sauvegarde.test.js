// Envoi de la progression sur le compte (audit F02) : la copie du compte n'est
// remplacée que si elle est toujours celle qu'on a lue. Réseau simulé : aucun
// test ne touche la vraie base.
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const eleve = { token: 'eleve-token', refresh: 'eleve-refresh', user: { id: 'eleve' }, expires_at: 9999999999 }
const progression = (rev, extra = {}) => ({ xp: 10, notes: { 'gf-t1': 'TVA' }, _sync: { v: 1, rev }, ...extra })
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
let api
beforeEach(async () => {
  vi.resetModules()
  const items = new Map()
  vi.stubGlobal('localStorage', { getItem: (k) => items.get(k) ?? null, setItem: (k, v) => items.set(k, v), removeItem: (k) => items.delete(k) })
  localStorage.setItem('stmg_session', JSON.stringify(eleve))
  api = await import('../src/auth.js')
})
afterEach(() => vi.unstubAllGlobals())

test('la progression complète part, à condition que la copie du compte n’ait pas changé', async () => {
  const fetch = vi.fn().mockResolvedValue(json([{ id: 'eleve' }]))
  vi.stubGlobal('fetch', fetch)
  expect(await api.envoyerProgression(progression(6), 5)).toEqual({ ok: true })
  const [url, options] = fetch.mock.calls[0]
  expect(decodeURIComponent(url)).toContain('id=eq.eleve&progress->_sync->>rev=eq.5')
  expect(options.method).toBe('PATCH')
  expect(options.headers.Prefer).toBe('return=representation')
  expect(JSON.parse(options.body).progress.notes['gf-t1']).toBe('TVA')
})

test('le premier envoi n’écrase qu’une copie jamais versionnée', async () => {
  const fetch = vi.fn().mockResolvedValue(json([{ id: 'eleve' }]))
  vi.stubGlobal('fetch', fetch)
  await api.envoyerProgression(progression(1), null)
  expect(decodeURIComponent(fetch.mock.calls[0][0])).toContain('progress->_sync->>rev=is.null')
})

test('si un autre appareil a écrit entre-temps, on récupère sa copie pour fusionner', async () => {
  const autre = progression(9, { xp: 50 })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json([])).mockResolvedValueOnce(json([{ id: 'eleve', progress: autre }])))
  expect(await api.envoyerProgression(progression(6), 5)).toEqual({ ok: false, conflit: autre })
})

test('une copie du compte déjà identique à l’envoi compte comme une réussite', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json([])).mockResolvedValueOnce(json([{ id: 'eleve', progress: progression(6) }])))
  expect(await api.envoyerProgression(progression(6), 5)).toEqual({ ok: true })
})

test('sans réseau, sans profil ou en erreur, l’échec est signalé', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
  expect(await api.envoyerProgression(progression(6), 5)).toMatchObject({ ok: false, raison: 'reseau' })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ message: 'indisponible' }, 503)))
  expect(await api.envoyerProgression(progression(6), 5)).toMatchObject({ ok: false, raison: 'serveur' })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([])))
  expect(await api.envoyerProgression(progression(6), 5)).toMatchObject({ ok: false, raison: 'profil' })
  localStorage.removeItem('stmg_session')
  expect(await api.envoyerProgression(progression(6), 5)).toMatchObject({ ok: false, raison: 'session' })
})

test('à la fermeture de la page, l’envoi survit si la progression tient dans la limite du navigateur', async () => {
  const fetch = vi.fn().mockResolvedValue(json([{ id: 'eleve' }]))
  vi.stubGlobal('fetch', fetch)
  await api.envoyerProgression(progression(6), 5, { keepalive: true })
  expect(fetch.mock.calls[0][1].keepalive).toBe(true)
  await api.envoyerProgression(progression(7, { notes: { gros: 'x'.repeat(70000) } }), 6, { keepalive: true })
  expect(fetch.mock.calls[1][1].keepalive).toBe(false)
})
