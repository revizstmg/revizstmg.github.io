import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Duel entre amis : si l'envoi du score échoue, le score joué n'est pas perdu.
// Il reste à l'écran et sur l'appareil, et « Réessayer l'envoi » le renvoie.
const ELEVE = '00000000-0000-4000-8000-000000000001'
const AMI = '00000000-0000-4000-8000-000000000002'
const SESSION = { token: 'jeton', refresh: 'renouvellement', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: ELEVE, email: 'lea@test.fr' } }
const DUEL = {
  id: 'duel-1', a_device: AMI, b_device: ELEVE, a_name: 'Sam', b_name: 'Léa', status: 'live',
  chapter_label: 'Le contrat', a_done: true, a_score: 50, a_total: 1, b_done: false,
  questions: [{ q: 'Un contrat suppose…', choices: ['un accord de volontés', 'un vote'], answer: 0 }],
}

test('duel : score gardé si l’envoi échoue, puis renvoyé', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await page.addInitScript((s) => { localStorage.setItem('stmg_session', JSON.stringify(s)); delete window.Notification }, SESSION)
  let reseau = false
  const envois = []
  await page.route('https://*.supabase.co/**', (route) => {
    const req = route.request(), url = new URL(req.url())
    const json = (body) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname.endsWith('/friend_duel')) {
      if (req.method() === 'PATCH') {
        envois.push(req.postDataJSON())
        return reseau ? route.fulfill({ status: 204 }) : route.abort('internetdisconnected')
      }
      const filtre = url.search
      if (filtre.includes('status=eq.live')) return json([DUEL])
      if (filtre.includes('id=eq.duel-1')) return json([{ ...DUEL, b_done: true, b_score: 80, b_total: 1 }])
      return json([])
    }
    if (url.pathname.endsWith('/friend_user')) return json([{ code: 'ABC234' }])
    if (url.pathname.endsWith('/profiles')) return json([{ id: ELEVE, name: 'Léa Test', role: 'eleve', level: 'terminale-stmg', specialty: 'gestion-finance', progress: {} }])
    return json([])
  })
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('./#/amis')
  await attendreAccueil(page)
  await page.getByRole('button', { name: /Duels/ }).click()
  await page.getByRole('button', { name: /Sam/ }).click()
  await page.getByRole('button', { name: /un accord de volontés/ }).click()
  await page.getByRole('button', { name: 'Voir mon score' }).click()

  // L'envoi échoue : le score reste là, et sur l'appareil.
  await expect(page.getByRole('heading', { name: 'Ton score n’est pas encore envoyé' })).toBeVisible()
  const garde = await page.evaluate(() => JSON.parse(localStorage.getItem('stmg_duel_scores_attente') || '{}'))
  expect(garde['duel-1'].correct).toBe(1)
  const points = garde['duel-1'].points
  expect(points).toBeGreaterThan(0)

  // « Plus tard » puis retour au duel : pas de nouvelle partie, on renvoie le même score.
  await page.getByRole('button', { name: 'Plus tard' }).click()
  await page.getByRole('button', { name: /Duels/ }).click()
  await page.getByRole('button', { name: /Sam/ }).click()
  await expect(page.getByRole('heading', { name: 'Ton score n’est pas encore envoyé' })).toBeVisible()

  reseau = true
  await page.getByRole('button', { name: 'Réessayer l’envoi' }).click()
  await expect(page.getByRole('heading', { name: /Victoire|Défaite|Égalité/ })).toBeVisible()
  const dernier = envois.filter((e) => 'b_score' in e).pop()
  expect(dernier.b_score).toBe(points)
  expect(dernier.b_total).toBe(1)
  expect(await page.evaluate(() => localStorage.getItem('stmg_duel_scores_attente'))).toBe('{}')
  expect(erreurs).toEqual([])
})
