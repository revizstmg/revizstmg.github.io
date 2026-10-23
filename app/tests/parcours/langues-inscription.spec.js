import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, attendreAccueil, etat } from './eleve.js'

test('inscription : cinq langues, choix multiple et sauvegarde sur le compte', async ({ page }) => {
 const errors = await preparer(page, null)
 const id = '00000000-0000-4000-8000-000000000001'
 const writes = []
 await page.route('https://*.supabase.co/**', route => {
  const req = route.request(), path = new URL(req.url()).pathname
  const json = body => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
  if (path.endsWith('/signup')) return json({ access_token: 'test-token', refresh_token: 'test-r', expires_in: 3600, user: { id, email: 'lea@test.fr' } })
  if (path.endsWith('/profiles') && req.method() === 'PATCH') { writes.push(req.postDataJSON()); return json([{ id }]) }
  if (path.endsWith('/profiles') && req.method() === 'POST') return json(req.postDataJSON())
  return json([])
 })
 await page.goto('./')
 const form = page.getByRole('dialog')
 await form.getByRole('button', { name: /Pas encore de compte/ }).click()
 await form.locator('#w-email').fill('lea@test.fr')
 await form.locator('#w-pass').fill('Motdepasse123')
 await form.getByRole('button', { name: 'Suivant', exact: true }).click()
 await form.locator('#w-first').fill('Léa')
 await form.getByRole('button', { name: 'Suivant', exact: true }).click()
 await form.getByRole('button', { name: /Terminale STMG/ }).click()
 await form.getByRole('button', { name: /Gestion et Finance/ }).click()
 const group = form.getByRole('group', { name: 'Tes langues étudiées' })
 for (const name of ['Arabe', 'Anglais', 'Italien', 'Espagnol', 'Allemand']) await expect(group.getByRole('button', { name, exact: true })).toBeVisible()
 await group.getByRole('button', { name: 'Allemand', exact: true }).click()
 await group.getByRole('button', { name: 'Italien', exact: true }).click()
 await expect(group.getByRole('button', { name: /Allemand/ })).toHaveAttribute('aria-pressed', 'true')
 await expect(group.getByText(/cours d’arabe et d’italien sont à venir/)).toHaveCount(0)
 await form.getByRole('checkbox').check()
 await page.waitForTimeout(3100)
 await form.getByRole('button', { name: 'Créer mon compte', exact: true }).click()
 await page.getByRole('button', { name: /Passer cette étape/ }).click()
 await attendreAccueil(page)
 await expect.poll(async () => (await etat(page)).studyLanguages).toEqual(['de', 'it'])
 await expect.poll(() => writes.some(w => w.progress?.studyLanguages?.join(',') === 'de,it')).toBe(true)
 await page.goto('./#/subject/langues')
 await expect(page.getByRole('button', { name: /Allemand/ })).toBeVisible()
 await expect(page.getByRole('button', { name: /Italien/ })).toBeVisible()
 await expect(page.getByRole('link', { name: /Toutes les conjugaisons/ })).toHaveCount(0)
 expect(errors).toEqual([])
})

test('réglages : modifier les langues, conserver le choix au rechargement et filtrer la bibliothèque', async ({ page }) => {
 const errors = await preparer(page)
 await page.goto('./#/moi?section=reglages'); await attendreAccueil(page)
 const group = page.getByRole('group', { name: 'Tes langues étudiées' })
 await group.getByRole('button', { name: 'Allemand', exact: true }).click()
 await expect.poll(async () => (await etat(page)).studyLanguages).toEqual(['de'])
 for (const dark of [false, true]) {
  await page.evaluate(value => document.documentElement.classList.toggle('dark', value), dark)
  expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa']).analyze()).violations).toEqual([])
  await group.screenshot({ path: `test-results/study-languages-${dark ? 'dark' : 'light'}.png` })
 }
 await page.reload(); await attendreAccueil(page)
 await expect(page.getByRole('group', { name: 'Tes langues étudiées' }).getByRole('button', { name: /Allemand/ })).toHaveAttribute('aria-pressed', 'true')
 await page.goto('./#/subject/langues')
 await expect(page.getByRole('button', { name: /Allemand/ })).toHaveAttribute('aria-pressed', 'true')
 await expect(page.getByRole('link', { name: /Ouvrir le guide PDF/ })).toHaveAttribute('href', /guide-de.*pdf/)
 await expect(page.getByRole('link', { name: /Anglais/ })).toHaveCount(0)
 expect(errors).toEqual([])
})
