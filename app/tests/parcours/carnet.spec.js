import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve } from './eleve.js'

// Carnet d'erreurs : une question ratée apparaît dans « Réviser » ; une fois
// réussie, elle sort du carnet.
const QUESTION = {
  q: 'TVA à décaisser = TVA collectée − … ?',
  choices: ['TVA déductible', 'Chiffre d’affaires', 'Marge commerciale', 'Résultat'],
  answer: 0,
  explain: 'TVA à décaisser = TVA collectée − TVA déductible.',
}

test('une question ratée se refait depuis le carnet, puis en sort', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ erreurs: [{ id: `qcm|${QUESTION.q}`, themeId: 'gf-t1', type: 'qcm', q: QUESTION, le: '2026-10-01' }] }))
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/revision')
  await expect(page.getByRole('heading', { name: /Carnet d’erreurs/ })).toBeVisible()
  await expect(page.getByText('1 question à refaire')).toBeVisible()
  await page.getByRole('button', { name: 'Refaire' }).click()
  await page.getByRole('button', { name: /Entraînement/ }).click()
  await page.getByRole('button', { name: /TVA déductible/ }).click()
  await page.getByRole('button', { name: /Voir mon score/ }).click()
  await page.getByRole('button', { name: /Terminé|Fini|Retour/ }).first().click()
  await expect(page.getByRole('heading', { name: /Carnet d’erreurs/ })).toHaveCount(0)
  expect(erreurs).toEqual([])
})
