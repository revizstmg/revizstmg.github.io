import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Le chapitre garde ses formats utiles sans ajouter un quiz qui recopie les QCM.
test('chapitre : formats distincts, memory et QCM, sans quiz doublon', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/droit/theme/droit-t5/chapter/1')
  await page.getByRole('button', { name: /Exercices/ }).click()
  const liste = page.locator('main button', { hasText: /QCM|Vrai ou faux|Association|Memory|Écris|Texte à trous|Complète|Cas concrets|Quiz du chapitre|Flashcards/ })
  await expect(liste).toHaveCount(9)
  await expect(page.getByRole('button',{name:/Quiz du chapitre — questions mêlées/})).toHaveCount(0)

  for (const [nom, attendu] of [[/Memory — notions du chapitre/, /paires/i], [/QCM — le mot manquant/, /Question 1 \//], [/QCM — les notions du chapitre/, /Question 1 \//]]) {
    await page.getByRole('button', { name: nom }).first().click()
    const entrainement = page.getByRole('button', { name: /Entraînement/ })
    await page.waitForTimeout(300)
    if (await entrainement.count()) await entrainement.click()
    // Le jeu s'affiche en plein écran : les cartes du memory, ou la première question.
    await expect(page.locator('[data-exercice]')).toContainText(attendu)
    await page.getByRole('button', { name: /Quitter/ }).click()
  }
  expect(erreurs).toEqual([])
})

// Le calcul explicitement lié au chapitre tire de nouveaux nombres.
test('maths : calculs du chapitre, de nouveaux nombres à chaque partie', async ({ page }) => {
  const erreurs = await preparer(page)
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/maths/theme/math-c1/chapter/0')
  await page.getByRole('button', { name: /Exercices/ }).click()
  const enonces = []
  for (let partie = 0; partie < 2; partie++) {
    await page.getByRole('button', { name: /Exercices — Taux d’évolution/ }).first().click()
    const entrainement = page.getByRole('button', { name: /Entraînement/ })
    await page.waitForTimeout(300)
    if (await entrainement.count()) await entrainement.click()
    const enonce = page.locator('[data-exercice] p.whitespace-pre-line').first()
    await expect(enonce).toBeVisible()
    enonces.push(await enonce.innerText())
    await page.getByRole('button', { name: /Quitter/ }).click()
  }
  expect(enonces[0]).not.toEqual(enonces[1])
  expect(erreurs).toEqual([])
})


test('SDGN Première : les exercices de personnalité restent sur son cours', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ track: { level: 'premiere-stmg' } }))
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/subject/p1-sgn/theme/p1-sgn-t1/chapter/1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La personnalité de l’individu')
  await page.getByRole('button', { name: /Exercices/ }).click()
  await page.getByRole('button', { name: /QCM — les notions du chapitre/ }).click()
  const entrainement = page.getByRole('button', { name: /Entraînement/ })
  await expect(entrainement).toBeVisible()
  await entrainement.click()
  await expect(page.locator('[data-exercice]')).toContainText(/Question 1 \//)
  await expect(page.locator('[data-exercice]')).not.toContainText(/Maslow|Herzberg|qualification|cotisations|capital humain/i)
  expect(erreurs).toEqual([])
})

for (const [subject, theme, title, expected] of [
  ['langues', 'lng-en-verbs', 'Verbes irréguliers — entraînement', /go|went|gone|see|saw|seen|take|took|taken|make|made|come|came|write|wrote|written/],
  ['langues', 'lng-es-verbs', 'Verbes irréguliers — entraînement', /ser|soy|fue|tener|tengo|tuvo|hacer|hago|hizo|ir|voy|poder|puedo|pudo|decir|digo|dijo/],
  ['langues', 'lng-en-grammar-ex', 'Grammaire — exercices variés', /Article|Présent simple|Comparatif|some|much|this/],
  ['langues', 'lng-es-grammar-ex', 'Grammaire — exercices variés', /ser|por|Article|gustar/],
  ['philosophie', 'philo-methode', 'Remise en ordre — La dissertation', /Analyser le sujet/],
]) {
  test(`exercice rétabli dans son cours : ${theme}`, async ({ page }) => {
    const erreurs = await preparer(page)
    await page.goto('./')
    await attendreAccueil(page)
    await page.goto(`./#/subject/${subject}/theme/${theme}/chapter/0`)
    await page.getByRole('button', { name: /Exercices/ }).click()
    await page.getByRole('button', { name: title }).click()
    await page.getByRole('button', { name: /Entraînement/ }).click()
    const exercice = page.locator('[data-exercice]')
    await expect(exercice).toContainText(expected)
    if (subject === 'langues') {
      await expect(exercice).toContainText(/Question 1 \/ 10/)
      await expect(exercice.locator('input')).toBeVisible()
    } else {
      await page.getByRole('button', { name: 'Analyser le sujet', exact: true }).click()
      await expect(exercice).toContainText(/Problématiser/)
    }
    expect(erreurs).toEqual([])
  })
}
