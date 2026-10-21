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
   return reply({ exam: { title: 'Le management des organisations', instructions: 'Justifiez à partir des documents.', documents: [{ id: 'd1', title: 'Document fictif — Atelier Solidaire', text: 'Cette organisation produit des objets recyclés et emploie 12 salariés.' }], questions: Array.from({ length: body.duration / 10 }, (_, i) => ({ id: `q${i}`, chapterId: body.courses[i % 2].id, enonce: `Question de management ${i + 1} : justifiez la décision.`, points: i === body.duration / 10 - 1 ? 20 - (body.duration / 10 - 1) * 1.5 : 1.5, documentIds: ['d1'], correction: 'Réponse attendue avec justification.', criteria: ['Identifier la notion', 'Justifier avec le document'] })) } })
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
test('service désactivé : pas de faux bouton de génération, QCM conservés', async ({ page }) => {
 const { errors, requests } = await setup(page, false)
 await expect(page.getByText(/La génération IA n’est pas encore activée/)).toBeVisible()
 await expect(page.getByRole('button', { name: 'Analyser ma demande' })).toHaveCount(0)
 await expect(page.getByRole('heading', { name: '⏱ QCM chronométré' })).toBeVisible()
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
