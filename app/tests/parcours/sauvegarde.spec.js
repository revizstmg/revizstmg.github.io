import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat, etatEleve } from './eleve.js'

// Sauvegarde de la progression sur le compte (C03 à C05). Le compte est simulé
// comme la vraie base : une écriture n'aboutit que si la copie du compte est
// toujours la version annoncée par l'appareil.
const ELEVE = '00000000-0000-4000-8000-000000000001'
const SESSION = { token: 'jeton', refresh: 'renouvellement', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: ELEVE, email: 'lea@test.fr' } }
const NOTE = 'TVA à payer = TVA collectée − TVA déductible'

async function compte(page, progress = {}) {
  const profil = { id: ELEVE, name: 'Léa Test', email: 'lea@test.fr', role: 'eleve', level: 'terminale-stmg', specialty: 'gestion-finance', class_code: null, progress }
  const journal = []
  await page.route('https://*.supabase.co/**', (route) => {
    const req = route.request(), url = new URL(req.url())
    const json = (body) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname.endsWith('/token')) return json({ access_token: 'jeton', refresh_token: 'renouvellement', expires_in: 3600, user: SESSION.user })
    if (url.pathname.endsWith('/logout')) { journal.push({ type: 'logout' }); return route.fulfill({ status: 204 }) }
    if (url.pathname.endsWith('/profiles') && req.method() === 'GET') return json([profil])
    if (url.pathname.endsWith('/profiles') && req.method() === 'PATCH') {
      const filtre = url.searchParams.get('progress->_sync->>rev')
      const rev = profil.progress?._sync?.rev
      const ok = filtre === 'is.null' ? rev == null : filtre === `eq.${rev}`
      const body = req.postDataJSON()
      journal.push({ type: 'patch', ok, progress: body.progress })
      if (!ok) return json([])
      profil.progress = body.progress
      return json([{ id: ELEVE }])
    }
    return json([])
  })
  return { profil, journal }
}

async function ouvrir(page, progress) {
  await page.setViewportSize({ width: 1280, height: 900 })
  const erreurs = await preparer(page, etatEleve())
  await page.addInitScript((s) => {
    localStorage.setItem('stmg_session', JSON.stringify(s))
    // Pas de service de notifications dans ce navigateur de test.
    delete window.Notification
  }, SESSION)
  const serveur = await compte(page, progress)
  await page.goto('./#/subject/gestion-finance/theme/gf-t1')
  await attendreAccueil(page)
  return { erreurs, ...serveur }
}

const ecrireNote = async (page, texte) => {
  const zone = page.getByPlaceholder('Écris ici tes remarques, astuces, points à revoir…')
  if (!(await zone.isVisible())) {
    await page.getByRole('button', { name: 'Outils', exact: true }).click()
    await page.getByRole('button', { name: 'Mes notes' }).click()
  }
  await zone.fill(texte)
}
const noteEnvoyee = (journal, texte) => journal.some((e) => e.type === 'patch' && e.ok && e.progress?.notes?.['gf-t1'] === texte)
const bandeau = (page) => page.getByRole('status').filter({ hasText: 'Non sauvegardé' })
// Indicateur de l'en-tête : enregistré, en attente ou non enregistré.
const indicateur = (page) => page.locator('[data-sauvegarde]')

test('une note écrite part sur le compte', async ({ page }) => {
  const { erreurs, journal, profil } = await ouvrir(page)
  await ecrireNote(page, NOTE)
  await expect(indicateur(page)).toHaveText(/En attente/)
  await expect.poll(() => noteEnvoyee(journal, NOTE)).toBe(true)
  await expect.poll(async () => (await etat(page))._sync?.vuServeur).toBe(profil.progress._sync.rev)
  await expect(bandeau(page)).toHaveCount(0)
  await expect(indicateur(page)).toHaveText(/Enregistré/)
  expect(erreurs).toEqual([])
})

test('hors ligne : « Non sauvegardé », puis envoi au retour du réseau', async ({ page }) => {
  const { erreurs, journal } = await ouvrir(page)
  await page.context().setOffline(true)
  await ecrireNote(page, NOTE)
  await expect(bandeau(page)).toBeVisible({ timeout: 15000 })
  await expect(indicateur(page)).toHaveText(/Non enregistré/)
  expect(noteEnvoyee(journal, NOTE)).toBe(false)
  expect((await etat(page)).notes['gf-t1']).toBe(NOTE)
  await page.context().setOffline(false)
  await expect.poll(() => noteEnvoyee(journal, NOTE)).toBe(true)
  await expect(bandeau(page)).toHaveCount(0)
  await expect(indicateur(page)).toHaveText(/Enregistré/)
  expect(erreurs).toEqual([])
})

test('un autre appareil a écrit entre-temps : les deux progressions sont gardées', async ({ page }) => {
  const { erreurs, journal, profil } = await ouvrir(page, { xp: 20, notes: { 'droit-t1': 'Note du téléphone' }, _sync: { v: 1, rev: 500 } })
  // L'ordinateur récupère la copie du compte, puis y renvoie la sienne.
  await expect.poll(async () => {
    const vu = (await etat(page))._sync?.vuServeur
    return vu > 500 && vu === profil.progress._sync.rev
  }).toBe(true)
  expect((await etat(page)).notes['droit-t1']).toBe('Note du téléphone')
  // Le téléphone écrit ensuite une nouvelle version sur le compte.
  const rev = profil.progress._sync.rev + 1000
  profil.progress = { ...profil.progress, notes: { ...profil.progress.notes, 'eco-t1': 'Autre note du téléphone' }, _sync: { ...profil.progress._sync, rev } }
  await ecrireNote(page, NOTE)
  await expect.poll(() => noteEnvoyee(journal, NOTE)).toBe(true)
  expect(journal.some((e) => e.type === 'patch' && !e.ok)).toBe(true)
  expect(profil.progress.notes).toMatchObject({ 'droit-t1': 'Note du téléphone', 'eco-t1': 'Autre note du téléphone', 'gf-t1': NOTE })
  expect((await etat(page)).notes['eco-t1']).toBe('Autre note du téléphone')
  expect(erreurs).toEqual([])
})

test('déconnexion : jamais sans sauvegarde, sauf si l’élève le choisit', async ({ page }) => {
  const { erreurs, journal } = await ouvrir(page)
  const seDeconnecter = async () => {
    await page.getByRole('button', { name: 'Mon menu', exact: true }).click()
    await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click()
  }
  // Hors ligne : la déconnexion est retenue, la progression reste.
  await page.context().setOffline(true)
  await ecrireNote(page, NOTE)
  await seDeconnecter()
  const alerte = page.getByRole('alertdialog')
  await expect(alerte).toContainText('Ta progression n’est pas sauvegardée')
  await alerte.getByRole('button', { name: 'Rester connecté' }).click()
  await expect(alerte).toHaveCount(0)
  expect((await etat(page)).account?.id).toBe(ELEVE)
  // De retour en ligne : la note part, puis la déconnexion ferme la session.
  await page.context().setOffline(false)
  await expect.poll(() => noteEnvoyee(journal, NOTE)).toBe(true)
  await seDeconnecter()
  await expect.poll(async () => (await etat(page)).account).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('stmg_session'))).toBeNull()
  const dernierEnvoi = journal.map((e) => e.type).lastIndexOf('patch')
  expect(journal.findIndex((e) => e.type === 'logout')).toBeGreaterThan(dernierEnvoi)
  expect(erreurs).toEqual([])
})

test('déconnexion forcée hors ligne : l’élève est prévenu, puis déconnecté', async ({ page }) => {
  const { erreurs } = await ouvrir(page)
  await page.context().setOffline(true)
  await ecrireNote(page, NOTE)
  await page.getByRole('button', { name: 'Mon menu', exact: true }).click()
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Me déconnecter quand même' }).click()
  await expect.poll(async () => (await etat(page)).account).toBeNull()
  expect(erreurs).toEqual([])
})
