import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { preparer, etatEleve } from './eleve.js'

const FONCTION = '**/functions/v1/revizstmg-paiement'
const futur = new Date(Date.now() + 20 * 86400000).toISOString()

async function simuler(page, { etat, reponses = {} }) {
  const appels = []
  await page.route(FONCTION, async (route) => {
    const corps = JSON.parse(route.request().postData() || '{}')
    appels.push(corps)
    if (corps.action === 'etat') return etat === 'indisponible'
      ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'not_configured' }) })
      : route.fulfill({ contentType: 'application/json', body: JSON.stringify(etat) })
    const r = reponses[corps.action] || { url: 'https://checkout.stripe.test/c/pay' }
    return route.fulfill({ status: r.status || 200, contentType: 'application/json', body: JSON.stringify(r.body || r) })
  })
  await page.route('https://checkout.stripe.test/**', (route) => route.fulfill({ contentType: 'text/html', body: '<title>Stripe</title><p>page de paiement</p>' }))
  return appels
}

test('paiements pas encore ouverts : aucune offre à choisir', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await simuler(page, { etat: 'indisponible' })
  await page.goto('./#/offres')
  await expect(page.getByText('Les paiements ne sont pas encore ouverts')).toBeVisible()
  await expect(page.getByRole('button', { name: /Mensuel|Annuel/ })).toHaveCount(0)
  expect(erreurs).toEqual([])
})

test('mode test : case obligatoire, puis paiement Premium mensuel envoyé à Stripe', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  const appels = await simuler(page, { etat: { mode: 'test', abonnement: null } })
  await page.goto('./#/offres')
  await expect(page.getByText('Mode test.')).toBeVisible()
  const premium = page.getByRole('button', { name: /Mensuel : 9,99/ })
  await expect(premium).toBeDisabled()
  await expect(page.getByRole('button', { name: /Annuel : 130 €/ })).toBeVisible()
  await page.getByRole('checkbox', { name: /18 ans/ }).check()
  await expect(premium).toBeEnabled()
  await premium.click()
  await expect(page).toHaveURL(/checkout\.stripe\.test/)
  expect(appels.find((a) => a.action === 'checkout')).toEqual({ action: 'checkout', offre: 'premium', periode: 'mensuel', majeur: true })
  expect(erreurs).toEqual([])
})

test('abonnement actif : offre, date et portail de gestion', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  const appels = await simuler(page, { etat: { mode: 'test', abonnement: { offre: 'ultimate', periode: 'annuel', statut: 'active', periode_fin: futur, annulation_prevue: false } }, reponses: { portail: { url: 'https://checkout.stripe.test/p/portail' } } })
  await page.goto('./#/offres')
  await expect(page.getByText('Offre active')).toBeVisible()
  await expect(page.getByText(/Ultimate/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Mensuel|Annuel/ })).toHaveCount(0)
  await page.getByRole('button', { name: 'Gérer mon abonnement' }).click()
  await expect(page).toHaveURL(/portail/)
  expect(appels.map((a) => a.action)).toEqual(['etat', 'portail'])
  expect(erreurs).toEqual([])
})

test('retour de Stripe : message de remerciement quand l’abonnement est confirmé', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve())
  await simuler(page, { etat: { mode: 'test', abonnement: { offre: 'premium', periode: 'mensuel', statut: 'active', periode_fin: futur, annulation_prevue: false } } })
  await page.goto('./#/offres?paiement=ok')
  await expect(page.getByText('Merci ! Ton abonnement est actif.')).toBeVisible()
  expect(erreurs).toEqual([])
})

for (const theme of ['light', 'dark']) {
  test(`page des offres accessible et sans débord à 320 px : ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    const erreurs = await preparer(page, etatEleve({ theme }))
    await simuler(page, { etat: { mode: 'test', abonnement: null } })
    await page.goto('./#/offres')
    await expect(page.getByText('Mode test.')).toBeVisible()
    await page.getByRole('checkbox', { name: /18 ans/ }).check()
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))))
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa']).analyze()).violations.map((v) => `${v.id} ${v.nodes[0]?.html?.slice(0, 80)}`)).toEqual([])
    expect(erreurs).toEqual([])
  })
}
