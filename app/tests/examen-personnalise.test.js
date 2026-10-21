import { describe, test, expect, vi } from 'vitest'
import { checkRequest, checkPlan, checkExam } from '../../supabase/functions/examen-blanc/contract.js'
import { createHandler } from '../../supabase/functions/examen-blanc/handler.js'
import { courseText, readDraft, secondsLeft, examCatalog } from '../src/data/examenPersonnalise.js'
import { examMessages } from '../src/i18n/examens.js'
const course = { id: 'management::0', title: 'Stratégie', subject: 'Management', level: 'terminale', text: 'Le cours de stratégie.' }
const exam = () => ({ title: 'Management', instructions: 'Justifiez vos réponses.', documents: [{ id: 'd1', title: 'Cas fictif', text: 'Une organisation.' }], questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i}`, chapterId: course.id, documentIds: ['d1'], enonce: 'Analysez le cas.', correction: 'Démarche attendue.', criteria: ['Justifier'], points: i === 5 ? 5 : 3 })) })
const request = body => new Request('https://test/examen-blanc', { method: 'POST', headers: { Authorization: 'Bearer test' }, body: JSON.stringify(body) })
const input = { action: 'generate', duration: 60, prompt: 'Tester le management de terminale.', courses: [course] }
const env = key => ({ SUPABASE_URL: 'https://auth.test', SUPABASE_ANON_KEY: 'public-test', GEMINI_API_KEY: 'test-key' })[key]
test('les quatre durées sont admises, les autres et les requêtes trop grandes sont refusées', () => {
 for (const duration of [60, 120, 180, 240]) expect(checkRequest({ ...input, duration }).duration).toBe(duration)
 for (const duration of [0, 30, 90, '60']) expect(() => checkRequest({ ...input, duration })).toThrow()
 expect(() => checkRequest({ ...input, courses: [course, course] })).toThrow()
 expect(() => checkRequest({ ...input, prompt: 'court' })).toThrow()
})
test('un plan ne peut inventer des chapitres ni les répéter', () => {
 expect(checkPlan({ summary: 'Stratégie', chapterIds: [course.id] }, [course]).chapterIds).toEqual([course.id])
 expect(() => checkPlan({ summary: 'autre', chapterIds: ['hors-cours'] }, [course])).toThrow()
 expect(() => checkPlan({ summary: 'autre', chapterIds: [course.id, course.id] }, [course])).toThrow()
})
test('un sujet invalide ne passe pas : barème, référence au cours, document, corrigé et volume', () => {
 expect(checkExam(exam(), [course], 60).questions).toHaveLength(6)
 for (const change of [q => { q.points = 8 }, q => { q.chapterId = 'autre' }, q => { q.documentIds = ['absent'] }, q => { q.correction = '' }]) {
  const e = exam(); change(e.questions[0]); expect(() => checkExam(e, [course], 60)).toThrow()
 }
 expect(() => checkExam(exam(), [course], 240)).toThrow()
})
test('le chronomètre repose sur une échéance absolue, même après fermeture ou veille', () => {
 const d = { duration: 60, startedAt: 100000 }
 expect(secondsLeft(d, 160000)).toBe(3540)
 expect(secondsLeft(d, 4000000)).toBe(0)
 expect(secondsLeft({ duration: 240, startedAt: null }, 4000000)).toBe(14400)
})
test('la copie est propre au compte et une sauvegarde corrompue est ignorée', () => {
 const d = { owner: 'a', exam: exam(), duration: 60, courses: [course], answers: {}, startedAt: null }
 const storage = { getItem: () => JSON.stringify(d) }
 expect(readDraft('a', storage).exam.title).toBe('Management')
 expect(readDraft('b', storage)).toBeNull()
 expect(readDraft('a', { getItem: () => '{bad' })).toBeNull()
})
test('le texte source conserve les calculs, listes et tableaux du chapitre', () => {
 expect(courseText({ blocks: [{ t: 'p', c: 'Calcul' }, { t: 'list', c: ['A', 'B'] }, { t: 'table', head: ['C'], rows: [['19 €']] }] })).toContain('19 €')
})
test('le catalogue couvre les deux niveaux de management avec le vrai texte des sections', async () => {
 const catalog = await examCatalog()
 expect(catalog.length).toBeLessThanOrEqual(1600)
 expect(catalog.some(c => c.subjectId === 'p1-management' && courseText(c.section).trim())).toBe(true)
 expect(catalog.some(c => c.subjectId === 'management' && courseText(c.section).trim())).toBe(true)
 expect(new Set(catalog.map(c => c.id)).size).toBe(catalog.length)
 const lean = catalog.filter(c => courseText(c.section).trim() && courseText(c.section).length <= 30000).map(({ id, title, subject, level }) => ({ id, title, subject, level }))
 const body = { action: 'plan', duration: 120, prompt: input.prompt, catalog: lean }
 expect(() => checkRequest(body)).not.toThrow()
 expect(JSON.stringify(body).length).toBeLessThan(350000)
}, 60000)
test('les cinq langues couvrent les mêmes libellés', () => {
 for (const dict of Object.values(examMessages)) { expect(Object.keys(dict)).toEqual(Object.keys(examMessages.fr)); expect(Object.values(dict).every(Boolean)).toBe(true) }
})
describe('fonction serveur sans appel réel', () => {
 test('annonce la vraie disponibilité sans exposer les clés', async () => {
  const handler = createHandler({ env: () => undefined })
  expect(await (await handler(new Request('https://test'))).json()).toEqual({ ready: false })
 })
 test('refuse un visiteur ou un utilisateur anonyme avant tout appel IA', async () => {
  const fetcher = vi.fn(async () => Response.json({ id: 'anon', is_anonymous: true }))
  const handler = createHandler({ env, fetcher })
  expect((await handler(new Request('https://test', { method: 'POST' }))).status).toBe(401)
  expect((await handler(request(input))).status).toBe(401)
  expect(fetcher).toHaveBeenCalledTimes(1)
 })
 test('génère et valide la réponse, sans envoyer le jeton utilisateur au fournisseur', async () => {
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(exam()) }] } }] }))
  const response = await createHandler({ env, fetcher })(request(input))
  expect(response.status).toBe(200)
  expect((await response.json()).exam.questions).toHaveLength(6)
  expect(fetcher.mock.calls[1][1].headers.Authorization).toBeUndefined()
  expect(JSON.stringify(fetcher.mock.calls[1][1].body)).not.toContain('Bearer test')
 })
 test('une erreur fournisseur ou une sortie hors chapitre ne devient pas un faux examen', async () => {
  for (const response of [new Response('', { status: 429 }), Response.json({ candidates: [{ content: { parts: [{ text: '{"title":"incomplet"}' }] } }] })]) {
   const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : response)
   const r = await createHandler({ env, fetcher })(request(input))
   expect(r.status).toBeGreaterThanOrEqual(400); expect((await r.json()).exam).toBeUndefined()
  }
 })
 test('limite les appels par utilisateur sur une instance', async () => {
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(exam()) }] } }] }))
  const handler = createHandler({ env, fetcher })
  for (let i = 0; i < 12; i++) expect((await handler(request(input))).status).toBe(200)
  expect((await handler(request(input))).status).toBe(429)
 })
})

test('diagnostic Gemini : lecture seule mutualisée, sans secret dans la réponse', async () => {
 const fetcher = vi.fn(async () => Response.json({ name: 'models/test' }))
 const handler = createHandler({ env, fetcher })
 const probe = () => handler(new Request('https://test?check=provider'))
 const responses = await Promise.all([probe(), probe()])
 for (const r of responses) expect(await r.json()).toEqual({ ready: true })
 expect(fetcher).toHaveBeenCalledTimes(1)
 expect(fetcher.mock.calls[0][1].method).toBeUndefined()
})
test('diagnostic Gemini : refus fournisseur catégorisé sans recopier son message', async () => {
 for (const [status, error] of [[403, 'provider_permission'], [404, 'provider_model_unavailable'], [429, 'rate_limit'], [400, 'provider_key_invalid']]) {
  const fetcher = vi.fn(async () => Response.json({ error: { message: 'private-provider-detail', details: status === 400 ? [{ reason: 'API_KEY_INVALID' }] : [] } }, { status }))
  const r = await createHandler({ env, fetcher })(new Request('https://test?check=provider'))
  expect(await r.json()).toEqual({ ready: false, error })
 }
})
test('diagnostic Gemini : erreur réseau contrôlée', async () => {
 const fetcher = vi.fn(async () => { throw Error('private-network-detail') })
 const r = await createHandler({ env, fetcher })(new Request('https://test?check=provider'))
 expect(await r.json()).toEqual({ ready: false, error: 'provider_unreachable' })
})
test('clé copiée avec des espaces : normalisation uniquement côté serveur', async () => {
 const fetcher = vi.fn(async () => Response.json({ name: 'models/test' }))
 const spacedEnv = key => key === 'GEMINI_API_KEY' ? '  test-key\n' : env(key)
 const r = await createHandler({ env: spacedEnv, fetcher })(new Request('https://test?check=provider'))
 expect(await r.json()).toEqual({ ready: true })
 expect(fetcher.mock.calls[0][1].headers['x-goog-api-key']).toBe('test-key')
})

test('diagnostic fournisseur : raisons contrôlées, aucun message brut journalisé', async () => {
 const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
 try {
  for (const [reason, error] of [['SERVICE_DISABLED','provider_service_disabled'], ['API_KEY_HTTP_REFERRER_BLOCKED','provider_key_restricted']]) {
   const fetcher = async () => Response.json({ error: { message: 'private-provider-detail', details: [{ reason }] } }, { status: 403 })
   const r = await createHandler({ env, fetcher })(new Request('https://test?check=provider'))
   expect(await r.json()).toEqual({ ready: false, error })
  }
  expect(JSON.stringify(warn.mock.calls)).not.toContain('private-provider-detail')
 } finally { warn.mockRestore() }
})
