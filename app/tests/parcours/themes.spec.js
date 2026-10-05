// Chaque thème de chaque matière s'ouvre sans erreur : page du thème, puis
// son premier chapitre avec un vrai cours.
import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

const lire = (chemin) => JSON.parse(readFileSync(new URL(`../../content/${chemin}`, import.meta.url), 'utf8'))
const SUBJECTS = lire('ordre.json').map((id) => lire(`${id}/matiere.json`))
// Sur la page matière, « Thème 5 — Le contrat » s'affiche « Le contrat » (le 5 est dans la pastille).
const titreSansNumero = (nom) => nom.replace(/^(?:Thème|Chapitre)\s+\d+\s*[—–-]\s*/, '')

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
    await expect(page.locator('main')).toContainText(titreSansNumero(themes[0].name))
    for (const t of themes) {
      await page.goto(`./#/subject/${matiere.id}/theme/${t.id}`)
      await expect(page.locator('main'), `page du thème ${t.id}`).toContainText(t.name)
      await page.goto(`./#/subject/${matiere.id}/theme/${t.id}/chapter/0`)
      await expect(page.getByRole('heading', { level: 1 }), `chapitre 1 de ${t.id}`).toBeVisible()
      const texte = await page.locator('main').innerText()
      expect(texte.length, `cours de ${t.id}`).toBeGreaterThan(300)
    }
    expect(erreurs).toEqual([])
  })
}
