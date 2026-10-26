import { test, expect } from 'vitest'
import { FORMULA_PRACTICE, generateFormulaExercise } from '../src/data/formulaPractice.js'

// Plages de tirage qui avaient donné des énoncés absurdes (note « > 1 » contredite,
// valeur ajoutée ou marge négative, probabilité arrondie à 0).
const par = (id) => FORMULA_PRACTICE.find((f) => f.id === id)
const tirer = (id, n = 1000) => Array.from({ length: n }, () => generateFormulaExercise(par(id)))

test.each(['x102', 'x103'])('%s : un ratio « supérieur à 1 » l’est toujours', (id) => {
  for (const q of tirer(id)) expect(q.answer).toBeGreaterThan(1)
})

test.each(['x088', 'x127', 'x109', 'x116', 'x126'])('%s : valeur ajoutée ou marge positive', (id) => {
  for (const q of tirer(id)) expect(q.answer).toBeGreaterThan(0)
})

test('seuil de rentabilité, capacité de remboursement et délai de récupération restent plausibles', () => {
  for (const q of tirer('x111')) expect(q.answer).toBeGreaterThanOrEqual(10)
  for (const q of tirer('x101')) { expect(q.answer).toBeGreaterThanOrEqual(1); expect(q.answer).toBeLessThanOrEqual(10) }
  for (const q of tirer('x107')) { expect(q.answer).toBeGreaterThanOrEqual(1); expect(q.answer).toBeLessThanOrEqual(13) }
})

test('taux de croissance, absentéisme et ROI restent dans des ordres de grandeur réalistes', () => {
  for (const id of ['x120', 'x121', 'x129']) for (const q of tirer(id)) { expect(q.answer).toBeGreaterThan(-70); expect(q.answer).toBeLessThan(150) }
  for (const q of tirer('x124')) { expect(q.answer).toBeGreaterThan(0); expect(q.answer).toBeLessThan(20) }
  const roi = tirer('x147').map((q) => q.answer)
  expect(roi.some((r) => r > 0)).toBe(true)
  expect(Math.min(...roi)).toBeGreaterThan(-60)
})

test.each(['x115', 'x131', 'x130'])('%s : valeur unitaire supérieure à 1', (id) => {
  for (const q of tirer(id)) expect(q.answer).toBeGreaterThan(1)
})

test.each(['x067', 'x068', 'x161'])('%s : la probabilité affichée n’est jamais 0,0000', (id) => {
  for (const q of tirer(id, 2000)) {
    const { n, k } = q.values
    if (k !== undefined) expect(k).toBeLessThanOrEqual(n)
    expect(q.answer).toBeGreaterThan(0)
  }
})
