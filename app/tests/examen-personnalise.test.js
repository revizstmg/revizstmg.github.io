import { accesLibre } from './outils.js'
import { describe, test, expect, vi } from 'vitest'
import { checkRequest, checkPlan, checkExam } from '../../supabase/functions/examen-blanc/contract.js'
import { createHandler } from '../../supabase/functions/examen-blanc/handler.js'
import { courseText, readDraft, secondsLeft, examCatalog } from '../src/data/examenPersonnalise.js'
import { examMessages } from '../src/i18n/examens.js'
const course = { id: 'management::0', title: 'Stratégie', subject: 'Management', level: 'terminale', text: 'Le cours de stratégie.' }
const exam = () => ({ title: 'Management', instructions: 'Justifiez vos réponses.', documents: Array.from({ length: 4 }, (_, i) => ({ id: `d${i + 1}`, title: `Cas fictif ${i + 1}`, text: 'Une organisation.' })), questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i}`, chapterId: course.id, documentIds: i < 4 ? [`d${i + 1}`] : [], enonce: 'Analysez le cas.', correction: 'Démarche attendue.', criteria: ['Justifier'], points: i === 5 ? 5 : 3 })) })
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
  const handler = createHandler({acces:accesLibre, env: () => undefined })
  expect(await (await handler(new Request('https://test'))).json()).toEqual({ ready: false })
 })
 test('refuse un visiteur ou un utilisateur anonyme avant tout appel IA', async () => {
  const fetcher = vi.fn(async () => Response.json({ id: 'anon', is_anonymous: true }))
  const handler = createHandler({acces:accesLibre, env, fetcher })
  expect((await handler(new Request('https://test', { method: 'POST' }))).status).toBe(401)
  expect((await handler(request(input))).status).toBe(401)
  expect(fetcher).toHaveBeenCalledTimes(1)
 })
 test('génère et valide la réponse, sans envoyer le jeton utilisateur au fournisseur', async () => {
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(exam()) }] } }] }))
  const response = await createHandler({acces:accesLibre, env, fetcher })(request(input))
  expect(response.status).toBe(200)
  expect((await response.json()).exam.questions).toHaveLength(6)
  expect(fetcher.mock.calls[1][1].headers.Authorization).toBeUndefined()
  expect(JSON.stringify(fetcher.mock.calls[1][1].body)).not.toContain('Bearer test')
 })
 test('une erreur fournisseur ou une sortie hors chapitre ne devient pas un faux examen', async () => {
  for (const response of [new Response('', { status: 429 }), Response.json({ candidates: [{ content: { parts: [{ text: '{"title":"incomplet"}' }] } }] })]) {
   const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : response)
   const r = await createHandler({acces:accesLibre, env, fetcher })(request(input))
   expect(r.status).toBeGreaterThanOrEqual(400); expect((await r.json()).exam).toBeUndefined()
  }
 })
 test('limite les appels par utilisateur sur une instance', async () => {
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(exam()) }] } }] }))
  const handler = createHandler({acces:accesLibre, env, fetcher })
  for (let i = 0; i < 12; i++) expect((await handler(request(input))).status).toBe(200)
  expect((await handler(request(input))).status).toBe(429)
 })
})

test('diagnostic Gemini : lecture seule mutualisée, sans secret dans la réponse', async () => {
 const fetcher = vi.fn(async () => Response.json({ name: 'models/test' }))
 const handler = createHandler({acces:accesLibre, env, fetcher })
 const probe = () => handler(new Request('https://test?check=provider'))
 const responses = await Promise.all([probe(), probe()])
 for (const r of responses) expect(await r.json()).toEqual({ ready: true })
 expect(fetcher).toHaveBeenCalledTimes(1)
 expect(fetcher.mock.calls[0][1].method).toBeUndefined()
})
test('diagnostic Gemini : refus fournisseur catégorisé sans recopier son message', async () => {
 for (const [status, error] of [[403, 'provider_permission'], [404, 'provider_model_unavailable'], [429, 'rate_limit'], [400, 'provider_key_invalid']]) {
  const fetcher = vi.fn(async () => Response.json({ error: { message: 'private-provider-detail', details: status === 400 ? [{ reason: 'API_KEY_INVALID' }] : [] } }, { status }))
  const r = await createHandler({acces:accesLibre, env, fetcher })(new Request('https://test?check=provider'))
  expect(await r.json()).toEqual({ ready: false, error })
 }
})
test('diagnostic Gemini : erreur réseau contrôlée', async () => {
 const fetcher = vi.fn(async () => { throw Error('private-network-detail') })
 const r = await createHandler({acces:accesLibre, env, fetcher })(new Request('https://test?check=provider'))
 expect(await r.json()).toEqual({ ready: false, error: 'provider_unreachable' })
})
test('clé copiée avec des espaces : normalisation uniquement côté serveur', async () => {
 const fetcher = vi.fn(async () => Response.json({ name: 'models/test' }))
 const spacedEnv = key => key === 'GEMINI_API_KEY' ? '  test-key\n' : env(key)
 const r = await createHandler({acces:accesLibre, env: spacedEnv, fetcher })(new Request('https://test?check=provider'))
 expect(await r.json()).toEqual({ ready: true })
 expect(fetcher.mock.calls[0][1].headers['x-goog-api-key']).toBe('test-key')
})

test('diagnostic fournisseur : raisons contrôlées, aucun message brut journalisé', async () => {
 const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
 try {
  for (const [reason, error] of [['SERVICE_DISABLED','provider_service_disabled'], ['API_KEY_HTTP_REFERRER_BLOCKED','provider_key_restricted']]) {
   const fetcher = async () => Response.json({ error: { message: 'private-provider-detail', details: [{ reason }] } }, { status: 403 })
   const r = await createHandler({acces:accesLibre, env, fetcher })(new Request('https://test?check=provider'))
   expect(await r.json()).toEqual({ ready: false, error })
  }
  expect(JSON.stringify(warn.mock.calls)).not.toContain('private-provider-detail')
 } finally { warn.mockRestore() }
})

test('Gemini : modèle actuel et repli borné si un ancien modèle renvoie 404', async () => {
 const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : url.includes('ancien') ? new Response('', { status: 404 }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(exam()) }] } }] }))
 const custom = k => k === 'EXAM_GEMINI_MODEL' ? ' models/ancien ' : env(k)
 const r = await createHandler({acces:accesLibre, env: custom, fetcher })(request(input))
 expect(r.status).toBe(200)
 expect(fetcher.mock.calls[1][0]).toContain('/models/ancien:generateContent')
 expect(fetcher.mock.calls[2][0]).toContain('/models/gemini-3.6-flash:generateContent')
 expect(fetcher).toHaveBeenCalledTimes(3)
})
test('Gemini : aucun repli en cas de quota ou de permissions', async () => {
 for (const status of [403, 429]) {
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : new Response('', { status }))
  const custom = k => k === 'EXAM_GEMINI_MODEL' ? 'ancien' : env(k)
  await createHandler({acces:accesLibre, env: custom, fetcher })(request(input))
  expect(fetcher).toHaveBeenCalledTimes(2)
 }
})

test('Gemini indisponible : une reprise différée puis une alternative Flash, délai borné', async () => {
 const pause = vi.fn(async () => {})
 const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : url.includes('3.6') ? new Response('', { status: 503 }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(exam()) }] } }] }))
 const r = await createHandler({acces:accesLibre, env, fetcher, pause })(request(input))
 expect(r.status).toBe(200)
 expect(fetcher).toHaveBeenCalledTimes(4)
 expect(pause).toHaveBeenCalledTimes(1)
 expect(pause).toHaveBeenCalledWith(2500)
 expect(fetcher.mock.calls[3][0]).toContain('gemini-3.8-flash')
 expect(fetcher.mock.calls[1][1].signal).toBe(fetcher.mock.calls[3][1].signal)
})
test('Gemini indisponible partout : appels bornés, aucune réponse factice', async () => {
 const pause = vi.fn(async () => {})
 const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : new Response('', { status: 503 }))
 const r = await createHandler({acces:accesLibre, env, fetcher, pause })(request(input))
 expect(r.status).toBe(502)
 expect(await r.json()).toEqual({ error: 'provider_unavailable' })
 expect(fetcher).toHaveBeenCalledTimes(4)
 expect(pause).toHaveBeenCalledTimes(1)
})

describe('Groq', () => {
 const groqEnv = key => key === 'GROQ_API_KEY' ? ' groq-test-key ' : key === 'GEMINI_API_KEY' ? undefined : env(key)
 test('analyse et génère via Groq sans transmettre le jeton élève', async () => {
  const plan = { summary: 'Management', chapterIds: [course.id] }
  for (const body of [input, { action: 'plan', duration: 60, prompt: input.prompt, catalog: [course] }]) {
   const expected = body.action === 'plan' ? plan : exam()
   const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ choices: [{ message: { content: JSON.stringify(expected) } }] }))
   const response = await createHandler({acces:accesLibre, env: groqEnv, fetcher })(request(body))
   expect(response.status).toBe(200)
   expect((await response.json())[body.action === 'plan' ? 'plan' : 'exam']).toEqual(expected)
   const [url, options] = fetcher.mock.calls[1]
   expect(url).toBe('https://api.groq.com/openai/v1/chat/completions')
   expect(options.headers.Authorization).toBe('Bearer groq-test-key')
   expect(options.body).not.toContain('Bearer test')
   expect(JSON.parse(options.body).response_format).toEqual({ type: 'json_object' })
  }
 })
 test('sonde le modèle sans générer de texte', async () => {
  const fetcher = vi.fn(async () => Response.json({ data: [{ id: 'openai/gpt-oss-120b' }] }))
  const handler = createHandler({acces:accesLibre, env: groqEnv, fetcher })
  expect(await (await handler(new Request('https://test?check=provider'))).json()).toEqual({ ready: true })
  expect(fetcher.mock.calls[0][0]).toBe('https://api.groq.com/openai/v1/models')
 })
 test('ne contourne pas les quotas et rejette un sujet incomplet', async () => {
  for (const [provider, code] of [[new Response('', { status: 429 }), 'rate_limit'], [Response.json({ choices: [{ message: { content: '{"title":"incomplet"}' } }] }), 'invalid_response']]) {
   const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : provider)
   const response = await createHandler({acces:accesLibre, env: groqEnv, fetcher })(request(input))
   expect((await response.json()).error).toBe(code)
   expect(fetcher).toHaveBeenCalledTimes(2)
  }
 })
})

 test('Gemini redevient prioritaire quand les deux clés sont présentes', async () => {
  const handler = createHandler({acces:accesLibre, env: key => key === 'GROQ_API_KEY' ? 'groq-test' : env(key) })
  expect(await (await handler(new Request('https://test?check=configuration'))).json()).toEqual({ provider: 'gemini' })
 })

describe('dossier et correction multimodale', () => {
 const file = { mimeType: 'application/pdf', data: btoa('%PDF-1.7\nCopie test') }
 const body = () => ({ ...input, action: 'grade', exam: exam(), files: [file] })
 const grade = () => ({ status: 'graded', feedback: 'Bon raisonnement.', advice: ['Réviser la stratégie.'], total: 20, questions: exam().questions.map(q => ({ id: q.id, status: 'readable', transcription: 'Réponse justifiée.', points: 1, feedback: 'Une justification manque.' })) })
 test('envoie les pièces au modèle dans les parts, hors instructions, et recalcule la note', async () => {
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(grade()) }] } }] }))
  const r = await createHandler({acces:accesLibre, env, fetcher })(request(body()))
  expect(r.status).toBe(200)
  const result = (await r.json()).grade
  expect(result.total).toBe(6)
  const payload = JSON.parse(fetcher.mock.calls[1][1].body)
  expect(payload.contents[0].parts[1]).toEqual({ inlineData: file })
  expect(payload.contents[0].parts[0].text).not.toContain(file.data)
  expect(payload.systemInstruction.parts[0].text).toContain('fichiers')
  expect(fetcher.mock.calls[1][1].headers.Authorization).toBeUndefined()
 })
 test('refuse format déguisé, excès de fichiers et copie hors barème avant génération', async () => {
  const fetcher = vi.fn(async () => Response.json({ id: 'user' }))
  for (const change of [b => { b.files = [{ ...file, mimeType: 'image/png' }] }, b => { b.files = Array(7).fill(file) }, b => { b.exam.questions[0].points = 30 }]) {
   const b = body(); change(b)
   const r = await createHandler({acces:accesLibre, env, fetcher })(request(b))
   expect(r.status).toBe(400)
  }
  expect(fetcher).toHaveBeenCalledTimes(3)
 })
 test('la correction nécessite Gemini et un compte authentifié', async () => {
  const fetcher = vi.fn(async () => Response.json({ id: 'user' }))
  const r = await createHandler({acces:accesLibre, env: key => key === 'GEMINI_API_KEY' ? undefined : key === 'GROQ_API_KEY' ? 'groq' : env(key), fetcher })(request(body()))
  expect((await r.json()).error).toBe('grading_unavailable')
  expect(fetcher).toHaveBeenCalledTimes(1)
  const handler = createHandler({acces:accesLibre, env, fetcher })
  expect((await handler(new Request('https://test', { method: 'POST', body: JSON.stringify(body()) }))).status).toBe(401)
 })
 test('aucune note globale si une réponse est illisible ; absence et illisibilité restent distinctes', async () => {
  const g = grade(); g.questions[0] = { ...g.questions[0], status: 'unreadable', points: null, transcription: '' }; g.questions[1] = { ...g.questions[1], status: 'unanswered', points: 0, transcription: '' }
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(g) }] } }] }))
  const r = await createHandler({acces:accesLibre, env, fetcher })(request(body()))
  expect((await r.json()).grade.total).toBeNull()
 })
 test('rejette un dépassement de points, une question répétée et une copie sans correspondance sans lui donner de note', async () => {
  for (const change of [g => { g.questions[0].points = 10 }, g => { g.questions[1].id = g.questions[0].id }, g => { g.questions[0].transcription = '' }]) {
   const g = grade(); change(g)
   const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(g) }] } }] }))
   expect((await (await createHandler({acces:accesLibre, env, fetcher })(request(body()))).json()).error).toBe('invalid_response')
  }
  const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ status: 'mismatch', feedback: 'Autre sujet.', total: 20 }) }] } }] }))
  expect((await (await createHandler({acces:accesLibre, env, fetcher })(request(body()))).json()).grade.total).toBeNull()
 })
 test('rejette les nouveaux sujets sans dossier ou sans questions de connaissances', async () => {
  for (const change of [e => { e.documents = e.documents.slice(0, 1); e.questions.forEach(q => { q.documentIds = ['d1'] }) }, e => { e.questions.forEach((q, i) => { q.documentIds = [`d${i % 4 + 1}`] }) }]) {
   const e = exam(); change(e)
   const fetcher = vi.fn(async url => url.includes('/auth/v1/user') ? Response.json({ id: 'user' }) : Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(e) }] } }] }))
   expect((await (await createHandler({acces:accesLibre, env, fetcher })(request(input))).json()).error).toBe('invalid_response')
  }
 })
})

test('les cinq langues couvrent les libellés du dépôt de copie', async () => {
 const { copyMessages } = await import('../src/i18n/copies.js')
 for (const dict of Object.values(copyMessages)) { expect(Object.keys(dict)).toEqual(Object.keys(copyMessages.fr)); expect(Object.values(dict).every(Boolean)).toBe(true) }
})
