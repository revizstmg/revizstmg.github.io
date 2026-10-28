import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'
const ID = '00000000-0000-4000-8000-000000000001'
async function setup(page, ready = true) {
 const errors = await preparer(page, etatEleve())
 page.on('dialog', dialog => dialog.accept())
 await page.addInitScript(id => { if (!localStorage.getItem('stmg_session')) localStorage.setItem('stmg_session', JSON.stringify({ token: 'test', refresh: 'r', expires_at: 9999999999, user: { id, email: 'test@test.fr' } })) }, ID)
 const requests = []
 await page.route('https://*.supabase.co/**', async route => {
  const req = route.request(), url = new URL(req.url())
  const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
  if (url.pathname.endsWith('/examen-blanc')) {
   if (req.method() === 'GET') return reply({ ready })
   const body = req.postDataJSON(); requests.push(body)
   if (body.action === 'plan') {
    const selected = ['premiere', 'terminale'].map(level => body.catalog.find(c => c.subject.startsWith('Management') && c.level === level))
    return reply({ plan: { summary: 'Management de Première et Terminale.', chapterIds: selected.map(c => c.id) } })
   }
   return reply({ exam: { title: 'Le management des organisations', instructions: 'Justifiez à partir des documents.', documents: [{ id: 'd1', title: 'Document fictif - Atelier Solidaire', text: 'Cette organisation produit des objets recyclés et emploie 12 salariés.' }], questions: Array.from({ length: body.duration / 10 }, (_, i) => ({ id: `q${i}`, chapterId: body.courses[i % body.courses.length].id, enonce: `Question de management ${i + 1} : justifiez la décision.`, points: i === body.duration / 10 - 1 ? 20 - (body.duration / 10 - 1) * 1.5 : 1.5, documentIds: ['d1'], correction: 'Réponse attendue avec justification.', criteria: ['Identifier la notion', 'Justifier avec le document'] })) } })
  }
  if (url.pathname.endsWith('/profiles')) return reply([{ id: ID, role: 'eleve', name: 'Léa Test', level: 'terminale-stmg', specialty: 'gestion-finance', progress: {} }])
  return reply([])
 })
 await page.goto('./#/bac-blanc'); await attendreAccueil(page)
 return { errors, requests }
}
test('création : deux PDF séparés et reprise sans questions à remplir', async ({ page }) => {
 const { errors, requests } = await setup(page)
 const form = page.getByRole('region', { name: 'Crée ton examen blanc' })
 await form.getByLabel('Quel examen veux-tu passer ?').fill('Tester mes connaissances en management de première et terminale')
 await form.getByLabel('120 min', { exact: true }).check()
 await form.getByRole('button', { name: 'Analyser ma demande' }).click()
 await expect(form.getByText('Vérifie le programme de ton examen')).toBeVisible({ timeout: 45000 })
 await expect(form.getByRole('list')).toContainText('Première'); await expect(form.getByRole('list')).toContainText('Terminale')
 await form.getByRole('button', { name: 'Créer mon examen', exact: true }).click()
 await expect(page.getByRole('heading', { name: 'Le management des organisations' })).toBeVisible()
 await expect(page.getByRole('textbox')).toHaveCount(0)
 for (const name of ['Télécharger le sujet PDF', 'Télécharger le corrigé PDF']) {
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name, exact: true }).click()
  const file = await download
  expect(file.suggestedFilename()).toMatch(/\.pdf$/)
  const stream = await file.createReadStream(); const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  expect(Buffer.concat(chunks).subarray(0, 5).toString()).toBe('%PDF-')
 }
 await page.reload(); await attendreAccueil(page)
 await expect(page.getByRole('button', { name: 'Télécharger le sujet PDF' })).toBeVisible()
 expect(requests.map(r => r.action)).toEqual(['plan', 'generate'])
 expect(errors).toEqual([])
})
test('service désactivé : créateur en carte PDF, annales disponibles et aucun QCM', async ({ page }) => {
 const { errors, requests } = await setup(page, false)
 await expect(page.getByText(/Cette aide par intelligence artificielle n’est pas disponible/)).toBeVisible()
 await expect(page.getByRole('button', { name: 'Analyser ma demande' })).toBeDisabled()
 await expect(page.getByRole('heading', { name: '⏱ QCM chronométré' })).toHaveCount(0)
 await expect(page.locator('.bac-creator .bac-paper')).toBeVisible()
 await expect(page.getByRole('link', { name: /Ouvrir le sujet PDF complet/ })).toHaveCount(2)
 expect(requests).toHaveLength(0); expect(errors).toEqual([])
})
test('quota IA : demande conservée et aucun sujet factice', async ({ page }) => {
 await setup(page)
 await page.route('**/functions/v1/examen-blanc', route => route.fulfill({ status: route.request().method() === 'POST' ? 429 : 200, contentType: 'application/json', body: JSON.stringify(route.request().method() === 'POST' ? { error: 'rate_limit' } : { ready: true }) }))
 const prompt = 'Tester mes connaissances de management en terminale'
 await page.getByLabel('Quel examen veux-tu passer ?').fill(prompt)
 await page.getByRole('button', { name: 'Analyser ma demande' }).click()
 await expect(page.getByRole('alert')).toContainText('Le service a atteint sa limite temporaire.', { timeout: 45000 })
 await expect(page.getByLabel('Quel examen veux-tu passer ?')).toHaveValue(prompt)
 await expect(page.locator('.exam-sheet')).toHaveCount(0)
})

async function readyCopy(page) {
 const data = await setup(page)
 await page.evaluate(id => {
  const course = { id: 'management::0', title: 'Stratégie', subject: 'Management', level: 'terminale' }
  const exam = { title: 'Copie de management', instructions: 'Justifiez.', documents: Array.from({ length: 4 }, (_, i) => ({ id: `d${i}`, title: `Document fictif ${i}`, text: 'Une organisation.' })), questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i}`, chapterId: course.id, enonce: `Question ${i + 1}`, documentIds: i < 4 ? [`d${i}`] : [], correction: 'Réponse attendue.', criteria: ['Justifier'], points: i === 5 ? 5 : 3 })) }
  localStorage.setItem(`revizstmg_exam_v1_${id}`, JSON.stringify({ owner: id, prompt: 'Tester le management de terminale.', duration: 60, courses: [course], exam, answers: {}, startedAt: null, submittedAt: null }))
 }, ID)
 await page.reload(); await attendreAccueil(page)
 return data
}
const pdfCopy = { name: 'copie.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nCopie de test') }
test('dépôt : consentement, correction détaillée, reprise et absence de stockage des fichiers', async ({ page }) => {
 const { errors, requests } = await readyCopy(page)
 let payload
 await page.route('**/functions/v1/examen-blanc', async route => {
  if (route.request().method() !== 'POST') return route.fulfill({ json: { ready: true } })
  payload = route.request().postDataJSON()
  return route.fulfill({ json: { grade: { status: 'graded', feedback: 'Bonne analyse ; approfondis les justifications.', advice: ['Réviser la stratégie.'], total: 20, questions: payload.exam.questions.map((q, i) => ({ id: q.id, status: 'readable', points: q.points - (i === 0 ? 0.5 : 0), transcription: 'Réponse de la copie.', feedback: 'Argumentation correcte.' })) } } })
 })
 const copy = page.getByRole('region', { name: 'Déposer ma copie' })
 await copy.getByLabel('Choisir un PDF ou des photos').setInputFiles(pdfCopy)
 await expect(copy.getByRole('button', { name: 'Faire corriger ma copie' })).toBeDisabled()
 expect(requests).toHaveLength(0)
 await copy.getByRole('checkbox').check()
 await copy.getByRole('button', { name: 'Faire corriger ma copie' }).click()
 await expect(copy.getByRole('heading', { name: 'Note indicative : 19,5 / 20' })).toBeVisible()
 await copy.getByText('1. 2,5 / 3', { exact: true }).click()
 await expect(copy.locator('details').first().getByText('Réponse de la copie.', { exact: true })).toBeVisible()
 expect(payload.action).toBe('grade'); expect(payload.files[0].mimeType).toBe('application/pdf')
 expect(JSON.stringify(payload)).not.toContain('copie.pdf')
 const stored = await page.evaluate(id => localStorage.getItem(`revizstmg_exam_v1_${id}`), ID)
 expect(stored).not.toContain(payload.files[0].data)
 expect(stored).not.toContain('copie.pdf')
 expect((await new AxeBuilder({ page }).include('.bac-creator').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
 await copy.screenshot({ path: 'test-results/correction-copie-mobile.png' })
 await page.reload(); await attendreAccueil(page)
 await expect(page.getByRole('heading', { name: 'Note indicative : 19,5 / 20' })).toBeVisible()
 expect(errors).toEqual([])
})
test('photos : ordre des pages, erreur conservant les fichiers et aucune note inventée', async ({ page }) => {
 const { errors } = await readyCopy(page)
 let payload
 await page.route('**/functions/v1/examen-blanc', async route => {
  if (route.request().method() !== 'POST') return route.fulfill({ json: { ready: true } })
  payload = route.request().postDataJSON()
  return route.fulfill({ status: 429, json: { error: 'rate_limit' } })
 })
 const copy = page.getByRole('region', { name: 'Déposer ma copie' })
 const photo = { name: 'page-2.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jV3sAAAAASUVORK5CYII=', 'base64') }
 await copy.getByLabel('Prendre une photo', { exact: true }).setInputFiles(photo)
 await copy.getByLabel('Choisir un PDF ou des photos').setInputFiles(pdfCopy)
 await copy.getByRole('button', { name: 'Monter copie.pdf', exact: true }).click()
 await copy.getByRole('checkbox').check()
 await copy.getByRole('button', { name: 'Faire corriger ma copie' }).click()
 await expect(copy.getByRole('alert')).toContainText('limite temporaire')
 expect(payload.files.map(f => f.mimeType)).toEqual(['application/pdf', 'image/png'])
 await expect(copy.getByText(/1\. copie.pdf/)).toBeVisible()
 await expect(copy.getByRole('heading', { name: /Note indicative/ })).toHaveCount(0)
 expect(errors).toEqual([])
})
test('copie illisible : bilan sans note et format non autorisé bloqué avant envoi', async ({ page }) => {
 const { requests } = await readyCopy(page)
 const copy = page.getByRole('region', { name: 'Déposer ma copie' })
 await copy.getByLabel('Choisir un PDF ou des photos').setInputFiles({ name: 'copie.html', mimeType: 'text/html', buffer: Buffer.from('<p>texte</p>') })
 await expect(copy.getByRole('alert')).toContainText('fichier n’est pas accepté')
 expect(requests).toHaveLength(0)
 await page.route('**/functions/v1/examen-blanc', route => route.fulfill({ json: route.request().method() === 'POST' ? { grade: { status: 'unreadable', feedback: 'Les pages sont floues.', total: 20 } } : { ready: true } }))
 await copy.getByLabel('Choisir un PDF ou des photos').setInputFiles(pdfCopy)
 await copy.getByRole('checkbox').check()
 await copy.getByRole('button', { name: 'Faire corriger ma copie' }).click()
 await expect(copy.getByRole('heading', { name: /Copie illisible/ })).toBeVisible()
 await expect(copy.getByText(/\/ 20/)).toHaveCount(0)
})


test('chapitres manuels : filtres, sélection entre niveaux et génération sans analyse IA', async ({ page }) => {
 const { errors, requests } = await setup(page)
 const form = page.getByRole('region', { name: 'Crée ton examen blanc' })
 await form.getByLabel('Quel examen veux-tu passer ?').fill('Travailler uniquement les chapitres de management que je sélectionne.')
 await form.getByLabel('Choisir mes chapitres', { exact: true }).check()
 await expect(form.getByRole('button', { name: 'Vérifier mes chapitres' })).toBeDisabled()
 await expect(form.getByLabel('Rechercher un chapitre', { exact: true })).toBeVisible({ timeout: 45000 })
 await form.getByRole('combobox', { name: 'Niveau', exact: true }).selectOption('terminale')
 await form.getByRole('combobox', { name: 'Matière', exact: true }).selectOption('management')
 await form.getByLabel('Rechercher un chapitre', { exact: true }).fill('inexistant-zzzzzz')
 await expect(form.getByText('Aucun chapitre ne correspond à ces filtres.')).toBeVisible()
 await form.getByLabel('Rechercher un chapitre', { exact: true }).fill('')
 await form.getByRole('checkbox').first().check()
 await form.getByRole('combobox', { name: 'Niveau', exact: true }).selectOption('premiere')
 await form.getByRole('combobox', { name: 'Matière', exact: true }).selectOption('p1-management')
 await form.getByRole('checkbox').first().check()
 await expect(form.getByText('2 chapitres sélectionnés sur 24', { exact: true })).toBeVisible()
 expect((await new AxeBuilder({ page }).include('.bac-creator').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
 await form.screenshot({ path: 'test-results/choix-chapitres-mobile.png' })
 await form.getByRole('button', { name: 'Vérifier mes chapitres' }).click()
 await expect(form.getByText('Vérifie le programme de ton examen')).toBeVisible()
 expect(requests).toHaveLength(0)
 await form.getByRole('button', { name: 'Créer mon examen', exact: true }).click()
 await expect(page.getByRole('heading', { name: 'Le management des organisations' })).toBeVisible()
 expect(requests.map(r => r.action)).toEqual(['generate'])
 expect(requests[0].courses).toHaveLength(2)
 expect(new Set(requests[0].courses.map(c => c.level))).toEqual(new Set(['premiere', 'terminale']))
 expect(requests[0].courses.every(c => c.subject.startsWith('Management'))).toBe(true)
 expect(errors).toEqual([])
})
test('retour au mode IA et effacement de la sélection manuelle', async ({ page }) => {
 const { requests } = await setup(page)
 const form = page.getByRole('region', { name: 'Crée ton examen blanc' })
 await form.getByLabel('Choisir mes chapitres', { exact: true }).check()
 await expect(form.getByLabel('Rechercher un chapitre')).toBeVisible({ timeout: 45000 })
 await form.getByRole('checkbox').first().check()
 for (let i = 1; i < 24; i++) await form.getByRole('checkbox', { checked: false }).first().check()
 await expect(form.getByText('24 chapitres sélectionnés sur 24', { exact: true })).toBeVisible()
 await expect(form.getByRole('checkbox', { checked: false }).first()).toBeDisabled()
 await form.getByRole('button', { name: 'Effacer la sélection' }).click()
 await expect(form.getByRole('button', { name: 'Vérifier mes chapitres' })).toBeDisabled()
 await form.getByLabel('Laisser l’IA choisir', { exact: true }).check()
 await expect(form.getByRole('button', { name: 'Analyser ma demande' })).toBeVisible()
 await expect(form.getByLabel('Rechercher un chapitre')).toHaveCount(0)
 expect(requests).toHaveLength(0)
})
