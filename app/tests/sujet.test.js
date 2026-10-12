// Sujets au format des épreuves écrites de spécialité : composés avec le contenu
// existant (études de documents, cas pratiques), deux parties chacun.
import { describe, it, expect, beforeAll } from 'vitest'
import * as C from '../src/data/index.js'
import { composerSujet, sujetsDisponibles, noteSur20 } from '../src/data/sujetBac.js'

beforeAll(() => C.chargerTout())
const tle = (specialty) => ({ level: 'terminale-stmg', specialty })
const sujetFixe = (id, track) => composerSujet(id, track, () => 0)

describe('sujet au format de l’épreuve', () => {
  it('Droit et économie : une étude de documents de droit, puis une d’économie', () => {
    const s = sujetFixe('droit-eco', tle('gestion-finance'))
    expect(s.parties.map((p) => [C.ALL_CHAPTERS[p.themeId].subjectId, p.game.type])).toEqual([['droit', 'doc'], ['economie', 'doc']])
    for (const p of s.parties) expect(p.game.questions.length).toBeGreaterThan(0)
    expect(s.duree).toBe(4 * 3600)
  })
  it('Management, sciences de gestion et numérique : un cas de management, puis un de la spécialité', () => {
    for (const spec of ['gestion-finance', 'mercatique', 'rh-communication']) {
      const s = sujetFixe('msgn', tle(spec))
      expect(s.parties.map((p) => C.ALL_CHAPTERS[p.themeId].subjectId), spec).toEqual(['management', spec])
      for (const p of s.parties) expect(p.game.cases.length, spec).toBeGreaterThan(0)
    }
  })
  it('sans cas pratique dans la spécialité, le sujet garde la partie management', () => {
    const s = sujetFixe('msgn', tle('sig'))
    expect(s.parties.map((p) => C.ALL_CHAPTERS[p.themeId].subjectId)).toEqual(['management'])
  })
  it('pas de sujet de spécialité en Première', () => {
    expect(sujetsDisponibles({ level: 'premiere-stmg' })).toEqual([])
    expect(composerSujet('droit-eco', { level: 'premiere-stmg' })).toBeNull()
  })
  it('note sur 20 d’après toutes les bonnes réponses', () => {
    expect(noteSur20([{ correct: 6, total: 8 }, { correct: 3, total: 4 }])).toBe(15)
    expect(noteSur20([{ correct: 1, total: 3 }])).toBe(6.7)
    expect(noteSur20([])).toBe(0)
  })
})
