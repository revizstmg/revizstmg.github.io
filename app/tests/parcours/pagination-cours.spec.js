import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

for (const [nom, chemin, pleinEcran] of [
  ['lecture normale', './#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1', false],
  ['plein écran et clavier', './#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1', true],
  ['dernier chapitre du thème', './#/subject/p1-sgn/theme/p1-sgn-t4/chapter/9', false],
]) {
  test(`dernière fiche vers fiche 1 : ${nom}`, async ({ page }) => {
    const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
    await page.goto('./')
    await attendreAccueil(page)
    await page.goto(chemin)
    await expect(page.locator('.reader')).toBeVisible()
    const url = page.url()
    const titre = await page.getByRole('heading', { level: 1 }).innerText()
    const debut = await page.locator('.reader-print-page:visible').innerText()
    if (pleinEcran) await page.getByRole('button', { name: /Appuyer pour lire en plein écran/ }).click()
    const lecteur = pleinEcran ? page.getByRole('dialog') : page.locator('.reader')
    const compteur = (await lecteur.innerText()).match(/Page 1 \/ (\d+)/)
    expect(compteur).toBeTruthy()
    const total = Number(compteur[1])
    for (let n = 1; n < total; n++) {
      if (pleinEcran) await page.keyboard.press('ArrowRight')
      else await lecteur.getByRole('button', { name: 'Suivant', exact: true }).click()
      await expect(lecteur).toContainText(`Page ${n + 1} / ${total}`)
    }
    await expect(lecteur.getByRole('button', { name: 'Revenir à la première fiche', exact: true })).toBeVisible()
    if (pleinEcran) await page.keyboard.press('ArrowRight')
    else await lecteur.getByRole('button', { name: 'Revenir à la première fiche', exact: true }).click()
    await expect(lecteur).toContainText(`Page 1 / ${total}`)
    await expect(page).toHaveURL(url)
    if (pleinEcran) {
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.keyboard.press('Escape')
    }
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titre)
    await expect(page.locator('.reader-print-page:visible')).toHaveText(debut, { useInnerText: true })
    expect(erreurs).toEqual([])
  })
}
