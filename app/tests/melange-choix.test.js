import { describe, it, expect, beforeAll } from 'vitest'
import * as C from '../src/data/index.js'

// Duels et test du thème : la bonne réponse ne doit pas toujours être la
// première tuile (les QCM écrits à la main la rangent en premier).
beforeAll(async () => { await C.chargerTout() })

const position = (qs) => qs.filter((q) => q.choices.length >= 3).map((q) => q.answer)

describe('mélange des propositions', () => {
  it('melangerPropositions garde la bonne réponse et ses propositions', () => {
    for (let k = 0; k < 200; k++) {
      const q = { q: 'x', choices: ['bonne', 'b', 'c', 'd'], answer: 0 }
      const m = C.melangerPropositions(q)
      expect(m.choices[m.answer]).toBe('bonne')
      expect([...m.choices].sort()).toEqual(['b', 'bonne', 'c', 'd'])
    }
  })

  it('une proposition qui renvoie aux autres garde son rang, un vrai/faux aussi', () => {
    const renvoi = { q: 'x', choices: ['a', 'b', 'Toutes les réponses ci-dessus'], answer: 2 }
    expect(C.melangerPropositions(renvoi)).toBe(renvoi)
    const vf = { q: 'x', choices: ['Vrai', 'Faux'], answer: 0 }
    expect(C.melangerPropositions(vf)).toBe(vf)
  })

  it('le quiz d’un chapitre (duel) répartit la bonne réponse sur plusieurs positions', () => {
    const positions = []
    for (const id of Object.keys(C.ALL_CHAPTERS)) for (let k = 0; k < 3; k++) positions.push(...position(C.buildQuiz(id)))
    expect(positions.length).toBeGreaterThan(500)
    const part = (i) => positions.filter((p) => p === i).length / positions.length
    expect(part(0)).toBeLessThan(0.4)
    expect(part(1)).toBeGreaterThan(0.15)
    expect(part(2)).toBeGreaterThan(0.15)
  })

  it('le test du thème répartit aussi la bonne réponse', () => {
    const positions = []
    for (const id of Object.keys(C.ALL_CHAPTERS)) positions.push(...position(C.buildThemeTest(id).qcm || []))
    expect(positions.length).toBeGreaterThan(200)
    expect(positions.filter((p) => p === 0).length / positions.length).toBeLessThan(0.4)
  })
})
