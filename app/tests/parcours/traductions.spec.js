import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etat, etatEleve } from './eleve.js'
const LOCALES = [
  ['de', 'Lerne. Schalte frei. Profitiere.', 'Sammlungen', 'Meine Gegenstände', 'Artikel suchen', 'Fuchs', 'Erhalten', 'Ausrüsten', 'Belohnungen', 'Ein Monat Premium gratis'],
  ['fr', 'Révise. Débloque. Profite.', 'Collections', 'Mes objets', 'Rechercher un article', 'Renard', 'Obtenir', 'Équiper', 'Récompenses', 'Un mois Premium offert'],
  ['en', 'Study. Unlock. Enjoy.', 'Collections', 'My items', 'Search for an item', 'Fox', 'Get item', 'Equip', 'Rewards', 'One free month of Premium'],
  ['es', 'Repasa. Desbloquea. Disfruta.', 'Colecciones', 'Mis objetos', 'Buscar un artículo', 'Zorro', 'Obtener', 'Aplicar', 'Recompensas', 'Un mes de Premium gratis'],
  ['it', 'Ripassa. Sblocca. Divertiti.', 'Collezioni', 'I miei oggetti', 'Cerca un articolo', 'Volpe', 'Ottieni', 'Applica', 'Premi', 'Un mese di Premium gratuito'],
  ['ar', 'راجع وافتح المكافآت واستمتع.', 'المجموعات', 'عناصري', 'البحث عن عنصر', 'الثعلب', 'اقتناء', 'تفعيل', 'المكافآت', 'شهر Premium مجاني'],
]
for (const [lang, hero, collections, owned, search, fox, buy, equip, rewards, premium] of LOCALES) {
  test(`boutique complète et achats sans traduction externe : ${lang}`, async ({ page }) => {
    const erreurs = await preparer(page, etatEleve({ lang, coins: 5000, xp: 5000, profile: { firstName: 'Camille Privée', lastName: 'Secret' } }))
    const demandes = []
    page.on('request', (r) => { if (r.url().includes('mymemory')) demandes.push(r.url()) })
    await page.goto('./#/boutique')
    await attendreAccueil(page)
    await expect(page.getByRole('heading', { name: hero, exact: true })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    await page.getByRole('button', { name: collections, exact: true }).click()
    const input = page.getByRole('textbox', { name: search, exact: true })
    await input.fill(fox)
    const item = page.getByRole('article', { name: fox, exact: true })
    await expect(item.getByRole('heading')).toHaveText(fox)
    await item.getByRole('button', { name: buy, exact: true }).click()
    await item.getByRole('button', { name: equip, exact: true }).click()
    const state = await etat(page)
    expect(state.coins).toBe(4850)
    expect(state.owned).toContain('av-fox')
    expect(state.customTheme.avatar).toBe('🦊')
    expect(state.profile.firstName).toBe('Camille Privée')
    await page.getByRole('button', { name: owned, exact: true }).click()
    await expect(item).toBeVisible()
    await page.getByRole('button', { name: rewards, exact: true }).click()
    await expect(page.getByRole('article', { name: premium, exact: true })).toBeVisible()
    expect(demandes, 'les textes et objets de la boutique sont disponibles hors ligne').toEqual([])
    expect(erreurs).toEqual([])
  })
}

test('changer de langue sans recharger conserve la saisie et les achats', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ coins: 5000, xp: 5000 }))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('./#/boutique')
  await attendreAccueil(page)
  await page.getByRole('button', { name: 'Collections', exact: true }).click()
  await page.getByRole('textbox', { name: 'Rechercher un article', exact: true }).fill('texte privé à conserver')
  await page.getByRole('button', { name: 'Langue', exact: true }).click()
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Study. Unlock. Enjoy.', exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Search for an item', exact: true })).toHaveValue('texte privé à conserver')
  await page.getByRole('button', { name: 'Language', exact: true }).click()
  await page.getByRole('button', { name: 'العربية', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'راجع وافتح المكافآت واستمتع.', exact: true })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await page.getByRole('button', { name: 'اللغة', exact: true }).click()
  await page.getByRole('button', { name: 'Français', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Révise. Débloque. Profite.', exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Rechercher un article', exact: true })).toHaveValue('texte privé à conserver')
  expect(erreurs).toEqual([])
})

test('les textes publics des autres pages se traduisent sans transmettre le profil', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ lang: 'en', profile: { firstName: 'NomStrictementPrivé', lastName: 'NePasTransmettre' } }))
  const demandes = []
  await page.route('https://api.mymemory.translated.net/**', (route) => {
    const url = new URL(route.request().url())
    const text = url.searchParams.get('q')
    demandes.push(text)
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseStatus: 200, responseData: { translatedText: `[English] ${text}` } }) })
  })
  for (const [path, french] of [['faq', 'Foire aux questions'], ['cgu', 'Conditions d’utilisation & mentions légales'], ['confidentialite', 'Politique de confidentialité']]) {
    await page.goto(`./#/${path}`)
    await attendreAccueil(page)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).not.toHaveText(french)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText(/English|Terms|Privacy/)
  }
  expect(demandes.length).toBeGreaterThan(0)
  expect(demandes.join(' ')).not.toMatch(/NomStrictementPrivé|NePasTransmettre|lea@test.fr/)
  expect((await etat(page)).profile.firstName).toBe('NomStrictementPrivé')
  expect(erreurs).toEqual([])
})

test('une panne de traduction est visible et peut être relancée', async ({ page }) => {
  await preparer(page, etatEleve({ lang: 'en' }))
  let failed = true
  await page.route('https://api.mymemory.translated.net/**', (route) => {
    if (failed) return route.fulfill({ status: 503, body: 'unavailable' })
    const text = new URL(route.request().url()).searchParams.get('q')
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseStatus: 200, responseData: { translatedText: `[English] ${text}` } }) })
  })
  await page.goto('./#/faq')
  await attendreAccueil(page)
  await expect(page.getByText('Some text could not be translated. You can try again.', { exact: true })).toBeVisible()
  await page.waitForTimeout(300)
  failed = false
  await page.getByRole('status').filter({hasText:'Some text could not be translated. You can try again.'}).getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('[English] Foire aux questions')
})

test('les consignes du Grand Oral se traduisent et les brouillons restent privés', async ({ page }) => {
  const secret = 'Ma question strictement privée'
  const erreurs = await preparer(page, etatEleve({ lang: 'en', grandOral: { q1: secret } }))
  const demandes = []
  await page.route('https://api.mymemory.translated.net/**', (route) => {
    const text = new URL(route.request().url()).searchParams.get('q')
    demandes.push(text)
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseStatus: 200, responseData: { translatedText: `[English] ${text}` } }) })
  })
  await page.goto('./#/grand-oral')
  await attendreAccueil(page)
  await expect(page.locator('textarea').first()).toHaveValue(secret)
  await page.getByRole('button', { name: /\[English\] L'épreuve/ }).click()
  await expect.poll(() => demandes.some((text) => text.includes('Grand Oral') || text.includes('grand oral'))).toBe(true)
  expect(demandes.join(' ')).not.toContain(secret)
  expect((await etat(page)).grandOral.q1).toBe(secret)
  expect(erreurs).toEqual([])
})
