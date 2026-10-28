import { test, expect } from '@playwright/test'
import { preparer, etatEleve, attendreAccueil } from './eleve.js'

// Aucun texte écrit dans le code ne doit partir vers un service de traduction :
// toutes les pages ci-dessous sont traduites hors ligne dans les cinq langues.
const ROUTES = ['accueil', 'atelier-formules', 'bac-blanc', 'boutique', 'cgu', 'confidentialite', 'etude-de-gestion', 'exemple-bilan', 'faq', 'fiches-photo', 'formules', 'grand-oral', 'guide', 'methodo', 'mes-notes', 'moi', 'offres', 'parametres', 'parcours', 'programme', 'revision', 'vacances', 'subject/droit/theme/droit-t5/chapter/1']
const PROFILS = {
  terminale: etatEleve({ lang: 'de' }),
  premiere: etatEleve({ lang: 'de', track: { level: 'premiere-stmg', specialty: null } }),
  professeur: etatEleve({ lang: 'de', account: { id: '00000000-0000-4000-8000-000000000002', email: 'p@test.fr', role: 'prof' } }),
}

for (const [nom, etat] of Object.entries(PROFILS)) {
  test(`${nom} : pages traduites hors ligne, sans service externe`, async ({ page }) => {
    test.setTimeout(240000)
    const externes = []
    page.on('request', (r) => { if (/mymemory|translate\.googleapis/.test(r.url())) externes.push(decodeURIComponent(new URL(r.url()).searchParams.get('q') || '').slice(0, 80)) })
    const erreurs = await preparer(page, etat)
    await page.goto('./')
    await attendreAccueil(page)
    for (const r of ROUTES) {
      await page.goto(`./#/${r}`)
      await page.locator('main').first().waitFor()
      await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true }))
      await page.waitForTimeout(300)
    }
    expect(externes).toEqual([])
    expect(erreurs).toEqual([])
  })
}
