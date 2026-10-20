import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve, etat } from './eleve.js'

// Carnet d'erreurs : une question ratée apparaît dans « Réviser ». Réussie le
// jour où elle est due, elle passe dans la boîte suivante (revue 3 jours plus
// tard) ; elle ne sort qu'après trois réussites espacées.
const QUESTION = {
  q: 'TVA à décaisser = TVA collectée − … ?',
  choices: ['TVA déductible', 'Chiffre d’affaires', 'Marge commerciale', 'Résultat'],
  answer: 0,
  explain: 'TVA à décaisser = TVA collectée − TVA déductible.',
}

test('une question ratée se refait depuis le carnet, puis s’espace', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ erreurs: [{ id: `qcm|${QUESTION.q}`, themeId: 'gf-t1', type: 'qcm', q: QUESTION, le: '2026-10-01' }] }))
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/revision')
  await expect(page.getByRole('heading', { name: /Carnet d’erreurs/ })).toBeVisible()
  await expect(page.getByText('1 question à refaire')).toBeVisible()
  await expect(page.getByText(/· 1 à revoir aujourd’hui/)).toBeVisible()
  await page.getByRole('button', { name: 'Refaire' }).click()
  await page.getByRole('button', { name: /Entraînement/ }).click()
  await page.getByRole('button', { name: /TVA déductible/ }).click()
  // « Pourquoi ? » se déplie sous la correction, avec le chapitre à revoir.
  await page.getByText('Pourquoi ?').click()
  await expect(page.getByRole('link', { name: /Revoir/ })).toHaveAttribute('href', /#\/subject\/gestion-finance\/theme\/gf-t1/)
  await page.getByRole('button', { name: /Voir mon score/ }).click()
  await page.locator('[data-exercice]').getByRole('button', { name: 'Terminé' }).click()
  await expect(page.getByText('1 question à refaire')).toBeVisible()
  await expect(page.getByText(/· \d+ à revoir aujourd’hui/)).toHaveCount(0)
  const [entree] = (await etat(page)).erreurs
  expect(entree).toMatchObject({ boite: 1 })
  expect(erreurs).toEqual([])
})
