import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat, etatEleve } from './eleve.js'

const ID = '00000000-0000-4000-8000-000000000001'
async function ouvrir(page, role) {
  const errors = await preparer(page, etatEleve({ account: { id: ID, role }, classCode: role === 'prof' ? '' : 'stmg-abc23' }))
  await page.addInitScript((id) => localStorage.setItem('stmg_session', JSON.stringify({ token: 'test', refresh: 'r', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id, email: 'test@test.fr' } })), ID)
  const profile = { id: ID, role, name: 'Léa Test', level: 'terminale-stmg', specialty: 'gestion-finance', class_code: role === 'prof' ? null : 'stmg-abc23', progress: {} }
  const classes = [], members = new Set(role === 'prof' ? [] : ['stmg-abc23'])
  const server = { failCreate: false, failLeave: false }
  await page.route('https://*.supabase.co/**', async (route) => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname, method = req.method()
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (path.endsWith('/profiles')) {
      if (method === 'POST') Object.assign(profile, req.postDataJSON()[0])
      if (method === 'PATCH') Object.assign(profile, req.postDataJSON())
      return json([profile])
    }
    if (path.endsWith('/teacher_class')) {
      if (method === 'POST') {
        if (server.failCreate) return json({ message: 'indisponible' }, 503)
        classes.push(req.postDataJSON()[0]); return json([classes.at(-1)])
      }
      return json(classes)
    }
    if (path.endsWith('/rpc/revizstmg_classe')) {
      const code = req.postDataJSON().p_code
      return json(['stmg-abc23', 'stmg-def45'].includes(code) ? [{ code }] : [])
    }
    if (path.endsWith('/class_member')) {
      if (method === 'POST') { members.add(req.postDataJSON()[0].class_code); return json([]) }
      if (method === 'DELETE') {
        if (server.failLeave) return json({ message: 'indisponible' }, 503)
        members.delete(url.searchParams.get('class_code').slice(3)); return json([])
      }
      if (url.searchParams.get('select') === 'class_code') return json([...members].map((class_code) => ({ class_code })))
      return json([])
    }
    return json([])
  })
  await page.goto('./#/classe')
  await attendreAccueil(page)
  return { errors, classes, members, server }
}

test('professeur : créer deux classes, basculer et retrouver les deux après rechargement', async ({ page }) => {
  const { errors, classes, server } = await ouvrir(page, 'prof')
  await page.getByRole('button', { name: /Générer.*code/ }).click()
  await expect.poll(() => classes.length).toBe(1)
  await page.getByRole('button', { name: /Créer une nouvelle classe/ }).click()
  await expect(page.getByRole('button', { name: 'Classe 2', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Classe 1', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(classes[0].code)
  await page.reload(); await attendreAccueil(page)
  await expect(page.getByRole('button', { name: 'Classe 2', exact: true })).toBeVisible()
  server.failCreate = true
  await page.getByRole('button', { name: /Créer une nouvelle classe/ }).click()
  await expect(page.getByRole('alert')).toContainText('Impossible de mettre à jour')
  expect(classes).toHaveLength(2)
  expect(errors).toEqual([])
})

test('élève : rejoindre deux classes, changer, retrouver et quitter seulement la classe choisie', async ({ page }) => {
  const { errors, members, server } = await ouvrir(page, 'eleve')
  await page.getByRole('button', { name: 'Rejoindre une autre classe', exact: true }).click()
  await page.getByLabel('Code de classe', { exact: true }).fill('stmg-def45')
  await page.getByRole('button', { name: 'Rejoindre', exact: true }).click()
  await expect.poll(() => members.size).toBe(2)
  await expect(page.getByRole('button', { name: 'stmg-abc23', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'stmg-abc23', exact: true }).click()
  await expect.poll(async () => (await etat(page)).classCode).toBe('stmg-abc23')
  await page.reload(); await attendreAccueil(page)
  await expect(page.getByRole('button', { name: 'stmg-def45', exact: true })).toBeVisible()
  server.failLeave = true
  await page.getByRole('button', { name: 'Quitter cette classe', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Impossible de mettre à jour')
  expect(members.size).toBe(2)
  server.failLeave = false
  const removed = (await etat(page)).classCode
  await page.getByRole('button', { name: 'Quitter cette classe', exact: true }).click()
  await expect.poll(() => members.size).toBe(1)
  await expect.poll(async () => (await etat(page)).classCode).not.toBe(removed)
  await page.reload(); await attendreAccueil(page)
  await expect(page.getByRole('button', { name: removed, exact: true })).toHaveCount(0)
  expect(errors).toEqual([])
})
