import { test, expect } from '@playwright/test'
import { preparer, etatEleve, attendreAccueil, etat } from './eleve.js'
const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'

test('flashcards : rectos identiques, reprises et XP distincts', async ({ page }) => {
  const errors = await preparer(page, etatEleve({ savedDecks: [{ id: 'audit', title: 'Audit doublons', cards: [{ front: 'TVA', back: 'Définition A' }, { front: 'TVA', back: 'Définition B' }] }] }))
  await page.goto('./#/revision/deck/audit'); await attendreAccueil(page)
  await page.getByRole('button', { name: '↩ À revoir', exact: true }).click()
  await expect(page.locator('.flashcard-study-header')).toContainText('2/2')
  await page.getByRole('button', { name: '✓ Je savais', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('1 acquise(s) sur 2')
  await page.getByRole('button', { name: /Revoir les cartes à revoir/ }).click()
  await page.getByRole('button', { name: '✓ Je savais', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('2 acquise(s) sur 2')
  const xp = (await etat(page)).xp || 0
  await page.getByRole('button', { name: /Terminer/ }).click()
  await expect.poll(async () => (await etat(page)).xp).toBe(xp + 2)
  expect(errors).toEqual([])
})

test('langues : erreur récupérable et brouillons/corrections conservés entre leçons et langues', async ({ page }) => {
  const errors = await preparer(page)
  let fail = true
  await page.route('**/assets/en-*.json', route => fail ? route.fulfill({ status: 503, body: 'unavailable' }) : route.continue())
  await page.goto('./#/subject/langues'); await attendreAccueil(page)
  await expect(page.getByRole('alert').filter({ hasText: 'Impossible de charger les exercices' })).toBeVisible()
  fail = false
  await page.locator('main').getByRole('button', { name: 'Réessayer', exact: true }).click()
  const first = page.locator('#manuel-en-ex-001-r')
  await expect(first).toBeVisible()
  await first.fill('audit réponse')
  await first.locator('xpath=ancestor::li[1]').getByRole('button', { name: 'Vérifier', exact: true }).click()
  await expect(first).toBeDisabled()
  await page.locator('#manuel-lecon').selectOption({ index: 2 })
  await expect(first).toHaveCount(0)
  await page.locator('#manuel-lecon').selectOption('')
  await expect(first).toHaveValue('audit réponse'); await expect(first).toBeDisabled()
  await page.getByRole('button', { name: /^Espagnol/ }).click()
  await expect(page.locator('#manuel-es-ex-001-r')).toBeVisible()
  await page.getByRole('button', { name: /^Anglais/ }).click()
  await expect(first).toHaveValue('audit réponse'); await expect(first).toBeDisabled()
  expect(errors).toEqual([])
})

test('maths : copie et temps repris après quitter et actualiser, correction sans XP répétés', async ({ page }) => {
  const errors = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./#/bac-blanc'); await attendreAccueil(page)
  const open = () => page.getByRole('button', { name: 'Faire un sujet d’entraînement (2 h)' }).click()
  await open()
  const input = page.getByLabel('Réponse à la question 1', { exact: true })
  const statement = await page.locator('#enonce-a1').innerText()
  const [, n, k] = statement.match(/de (\d+) salariés, (\d+) travaillent/)
  const value = String(Number(k) / Number(n) * 100)
  await input.fill(value)
  const start = await page.evaluate(() => JSON.parse(sessionStorage.getItem(`stmg_maths_draft:00000000-0000-4000-8000-000000000001:v1`)).debut)
  await page.getByRole('button', { name: '← Quitter' }).click(); await open()
  await expect(input).toHaveValue(value)
  await expect(page.locator('#enonce-a1')).toHaveText(statement)
  await page.reload(); await attendreAccueil(page); await open()
  await expect(input).toHaveValue(value)
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem(`stmg_maths_draft:00000000-0000-4000-8000-000000000001:v1`)).debut)).toBe(start)
  await page.getByRole('button', { name: 'Rendre ma copie' }).click()
  await expect(page.getByRole('heading', { name: 'Ta copie est corrigée' })).toBeVisible()
  const xp = (await etat(page)).xp
  await page.reload(); await attendreAccueil(page); await open()
  await expect(page.getByRole('heading', { name: 'Ta copie est corrigée' })).toBeVisible()
  expect((await etat(page)).xp).toBe(xp)
  await page.getByRole('button', { name: 'Nouveau sujet' }).click()
  await expect(input).toHaveValue('')
  expect(errors).toEqual([])
})

test('vacances : confirmation même si le programme précédent appartient à une autre filière', async ({ page }) => {
  const previous = { id: 'ancien', trackKey: 'autre-filiere', initialAnswers: { q: 1 } }
  const errors = await preparer(page, etatEleve({ parcours: { vacances: previous } }))
  await page.goto('./#/vacances'); await attendreAccueil(page)
  await page.getByRole('combobox', { name: 'Matière', exact: true }).selectOption('droit')
  for (let i = 1; i <= 3; i++) {
    if (i > 1) await page.getByRole('button', { name: 'Ajouter un chapitre' }).click()
    await page.getByRole('combobox', { name: `Chapitre ${i}`, exact: true }).selectOption({ index: 1 })
  }
  const begin = page.getByRole('button', { name: 'Commencer mon bilan', exact: true })
  page.once('dialog', d => d.dismiss()); await begin.click()
  expect((await etat(page)).parcours.vacances).toEqual(previous)
  page.once('dialog', d => d.accept()); await begin.click()
  await expect.poll(async () => (await etat(page)).parcours.vacances.id).not.toBe('ancien')
  expect(errors).toEqual([])
})

test('Mode Direct : panne visible, réponse conservée à la révélation et reprise sans double score', async ({ page }) => {
  const errors = await preparer(page, etatEleve({ classCode: 'stmg-audit' }))
  const live = { id: 'audit-live', class_code: 'stmg-audit', host_device: B, phase: 'question', current_index: 0, q_started_at: new Date().toISOString(), questions: [{ q: 'Question audit unique', choices: ['Bonne réponse audit', 'Erreur audit'], answer: 0, explain: 'Correction audit' }] }
  let player = { device_id: A, name: 'Léa', score: 0, answers: {} }, fail = true, writes = 0
  await page.route('https://*.supabase.co/**', async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname
    const json = body => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (path.endsWith('/live_session')) return json([live])
    if (path.endsWith('/live_player')) {
      if (req.method() === 'PATCH') {
        writes++
        if (fail) return route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"offline"}' })
        player = { ...player, ...req.postDataJSON() }; return json([player])
      }
      return json([player])
    }
    if (path.endsWith('/rpc/revizstmg_classe')) return json([{ code: 'stmg-audit', label: 'Classe audit' }])
    return json([])
  })
  await page.goto('./#/classe'); await attendreAccueil(page)
  await page.getByRole('button', { name: /Session en direct !/ }).click()
  await page.getByRole('button', { name: /Bonne réponse audit/ }).click()
  await expect(page.locator('main').getByRole('button', { name: 'Réessayer', exact: true })).toBeVisible()
  expect(player.score).toBe(0)
  live.phase = 'reveal'
  await expect(page.getByRole('heading', { name: 'Bonne réponse !', exact: true })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Pas de réponse', { exact: true })).toHaveCount(0)
  fail = false
  await page.locator('main').getByRole('button', { name: 'Réessayer', exact: true }).click()
  await expect.poll(() => player.score).toBeGreaterThan(0)
  const score = player.score
  await page.reload(); await attendreAccueil(page)
  await page.getByRole('button', { name: /Session en direct !/ }).click()
  await expect(page.getByRole('heading', { name: 'Bonne réponse !', exact: true })).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  expect(player.score).toBe(score); expect(writes).toBe(2)
  live.host_device = A; live.phase = 'lobby'
  await page.reload(); await attendreAccueil(page)
  await page.getByRole('button', { name: /Session en direct !/ }).click()
  await expect(page.getByRole('button', { name: /Démarrer/ })).toBeVisible()
  expect(errors).toEqual([])
})

test('amis : changer de compte sans recharger actualise le côté et le nom du duel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const errors = await preparer(page, etatEleve())
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })
    delete window.Notification
  })
  let current = A
  const profiles = {
    [A]: { id: A, name: 'Léa Test', email: 'lea@test.fr', role: 'eleve', level: 'terminale-stmg', specialty: 'gestion-finance', progress: {} },
    [B]: { id: B, name: 'Paul Test', email: 'paul@test.fr', role: 'eleve', level: 'terminale-stmg', specialty: 'gestion-finance', progress: {} },
  }
  const duel = { id: 'duel-b', a_device: B, a_name: 'Paul Test', b_device: 'opponent', b_name: 'Adversaire audit', status: 'live', a_done: false, b_done: false, chapter_label: 'Chapitre audit', questions: [{ q: 'Question duel', choices: ['A', 'B'], answer: 0 }] }
  await page.route('https://*.supabase.co/**', route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname
    const json = body => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (path.endsWith('/token')) {
      const body = req.postDataJSON()
      current = body.email === profiles[B].email ? B : current
      return json({ access_token: current, refresh_token: current, expires_in: 3600, user: { id: current, email: profiles[current].email } })
    }
    if (path.endsWith('/profiles')) {
      const id = url.searchParams.get('id')?.replace('eq.', '') || current
      if (req.method() === 'PATCH') profiles[id] = { ...profiles[id], ...req.postDataJSON() }
      return json([profiles[id]])
    }
    if (path.endsWith('/friend_duel') && url.searchParams.get('status') === 'eq.live') return json(current === B ? [duel] : [])
    return json([])
  })
  await page.goto('./#/amis'); await attendreAccueil(page)
  await expect(page.getByRole('heading', { name: /amis/i }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Mon menu', exact: true }).click()
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#w-email').fill('paul@test.fr')
  await dialog.locator('#w-pass').fill('Motdepasse123')
  await dialog.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await expect.poll(async () => (await etat(page)).account?.id).toBe(B)
  await attendreAccueil(page)
  await page.goto('./#/amis')
  await page.getByRole('button', { name: /Duels/ }).first().click()
  await expect(page.getByRole('button').filter({ hasText: 'Adversaire audit' })).toBeVisible()
  await expect(page.getByRole('button').filter({ hasText: 'Paul Test' })).toHaveCount(0)
  expect(errors).toEqual([])
})
