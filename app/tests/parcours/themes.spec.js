// Chaque thème de chaque matière s'ouvre sans erreur : page du thème, puis
// son premier chapitre avec un vrai cours.
import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'
import { SUBJECTS } from '../../src/data/index.js'

for (const matiere of SUBJECTS) {
  const themes = (matiere.chapters || []).filter((t) => !t.comingSoon)
  if (!themes.length) continue
  test(`thèmes de ${matiere.id} (${themes.length})`, async ({ page }) => {
    const track = matiere.niveau === 'premiere'
      ? { level: 'premiere-stmg' }
      : { level: 'terminale-stmg', specialty: 'gestion-finance' }
    const erreurs = await preparer(page, etatEleve({ track }))
    await page.goto('./')
    await attendreAccueil(page)
    await page.goto(`./#/subject/${matiere.id}`)
    await expect(page.locator('main')).toContainText(themes[0].short || themes[0].name)
    for (const t of themes) {
      await page.goto(`./#/subject/${matiere.id}/theme/${t.id}`)
      await expect(page.locator('main'), `page du thème ${t.id}`).toContainText(t.short || t.name)
      await page.goto(`./#/subject/${matiere.id}/theme/${t.id}/chapter/0`)
      await expect(page.getByRole('heading', { level: 1 }), `chapitre 1 de ${t.id}`).toBeVisible()
      const texte = await page.locator('main').innerText()
      expect(texte.length, `cours de ${t.id}`).toBeGreaterThan(300)
    }
    expect(erreurs).toEqual([])
  })
}
