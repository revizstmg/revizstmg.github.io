import { addDays } from '../../src/data/srs.js'
import { test, expect } from '@playwright/test'
import { preparer, attendreAccueil, etatEleve, etat } from './eleve.js'

// Revoir mes erreurs : une question ratée reste retravaillable par matière. Réussie le
// jour où elle est due, elle passe dans la boîte suivante (revue 3 jours plus
// tard) ; elle ne sort qu'après trois réussites espacées.
const QUESTION = {
  q: 'TVA à décaisser = TVA collectée − … ?',
  choices: ['TVA déductible', 'Chiffre d’affaires', 'Marge commerciale', 'Résultat'],
  answer: 0,
  explain: 'TVA à décaisser = TVA collectée − TVA déductible.',
}

test('une question ratée se refait par matière, puis s’espace', async ({ page }) => {
  const erreurs = await preparer(page, etatEleve({ erreurs: [{ id: `qcm|${QUESTION.q}`, themeId: 'gf-t1', type: 'qcm', q: QUESTION, le: '2026-10-01' }] }))
  await page.goto('./')
  await attendreAccueil(page)
  await page.goto('./#/revision')
  await expect(page.locator('#revision-carnet')).toHaveCount(0)
  await page.getByRole('button', { name:'Retravailler mes erreurs',exact:true }).click()
  await page.getByLabel('Matière',{exact:true}).selectOption('gestion-finance')
  await expect(page.getByText('Questions à retravailler : 1',{exact:true})).toBeVisible()
  await page.getByRole('button', { name:'Retravailler mes erreurs',exact:true }).click()
  await page.getByRole('button', { name: /TVA déductible/ }).click()
  // « Pourquoi ? » se déplie sous la correction, avec le chapitre à revoir.
  await page.getByText('Pourquoi ?').click()
  await expect(page.getByRole('link', { name: /Revoir/ })).toHaveAttribute('href', /#\/subject\/gestion-finance\/theme\/gf-t1/)
  await page.getByRole('button', { name: /Voir mon score/ }).click()
  await page.getByRole('button', { name:'Terminer cette révision',exact:true }).click()
  await expect(page.getByRole('heading', {name:'Révision terminée',exact:true})).toBeVisible()
  const [entree] = (await etat(page)).erreurs
  expect(entree).toMatchObject({ boite: 1 })
  expect(entree.due).toBe(addDays(entree.le,3))
  expect(erreurs).toEqual([])
})
