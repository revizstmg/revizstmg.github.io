import { test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { ordonnerExercices, estLibre, verifier } from '../src/data/exercicesManuel.js'

const LANGUES = ['de', 'en', 'es', 'it', 'ar']
const manuel = (l) => JSON.parse(readFileSync(new URL(`../resources/langues/${l}.json`, import.meta.url), 'utf8'))

test.each(LANGUES)('%s : tous les exercices du PDF sont proposés une seule fois, numérotés comme le PDF', (l) => {
  const m = manuel(l)
  const { groupes, numeros, total } = ordonnerExercices(m)
  const ids = groupes.flatMap((g) => g.exercices.map((e) => e.id))
  expect(ids).toHaveLength(m.exercises.length)
  expect(new Set(ids).size).toBe(ids.length)
  expect(total).toBe(m.exercises.length)
  expect(ids.map((id) => numeros.get(id))).toEqual(ids.map((_, i) => i + 1))
})

test.each(LANGUES)('%s : la réponse du corrigé est acceptée et une réponse vide ou fausse refusée', (l) => {
  for (const e of manuel(l).exercises) {
    if (e.type === 'qcm') expect(e.choices, e.id).toContain(e.answer)
    expect(verifier(e, e.answer), e.id).toBe(true)
    for (const a of e.alternatives || []) expect(verifier(e, a), e.id).toBe(true)
    expect(verifier(e, ''), e.id).toBe(false)
    expect(verifier(e, 'zzz inconnu'), e.id).toBe(false)
  }
})

test('les traductions et productions sont auto-évaluées, le reste est corrigé automatiquement', () => {
  expect(estLibre({ type: 'production', prompt: 'Pose une question' })).toBe(true)
  expect(estLibre({ type: 'court', prompt: 'Traduis : I work.' })).toBe(true)
  expect(estLibre({ type: 'court', prompt: 'Complète : She ____ here.' })).toBe(false)
  expect(estLibre({ type: 'qcm', prompt: 'Choisis' })).toBe(false)
})
