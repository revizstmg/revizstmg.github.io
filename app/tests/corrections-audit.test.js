import { describe, it, expect, beforeAll } from 'vitest'
import * as C from '../src/data/index.js'
import { outils } from '../src/components/SiteMobileMenu.jsx'

beforeAll(async () => { await C.chargerTout() })

describe('recherche', () => {
  it('trouve « chomage » sans accent et « chômage » avec', () => {
    expect(C.search('chomage').some((r) => r.id === 'eco-t7')).toBe(true)
    expect(C.search('chômage').some((r) => r.id === 'eco-t7')).toBe(true)
  })
  it('se limite aux matières du niveau quand on lui en donne la liste', () => {
    const premiere = C.search('dérivation', ['p1-maths']).map((r) => r.subjectId || r.id)
    expect(premiere.length).toBeGreaterThan(0)
    expect(C.search('dérivation', ['maths']).every((r) => (r.subjectId || r.id) === 'maths')).toBe(true)
  })
})

describe('menu des outils', () => {
  it('Terminale : Grand Oral sans étude de gestion ; Première : l’inverse ; prof : pas d’outils d’élève', () => {
    expect(outils({ track: { level: 'terminale-stmg' } })).toContain('grandoral')
    expect(outils({ track: { level: 'terminale-stmg' } })).not.toContain('etudegestion')
    expect(outils({ track: { level: 'premiere-stmg' } })).toContain('etudegestion')
    expect(outils({ track: { level: 'premiere-stmg' } })).not.toContain('grandoral')
    expect(outils({ account: { role: 'prof' }, track: { level: 'terminale-stmg' } })).not.toContain('defi')
  })
})
