import { describe, it, expect } from 'vitest'
import { parseNombre } from '../src/games/common.jsx'

// Le bouton « − » écrit un vrai signe moins : il doit être compris comme un nombre négatif.
describe('signe moins des réponses chiffrées', () => {
  it('« −4,5 » (moins typographique) vaut −4,5, avec ou sans unité', () => {
    expect(parseNombre('−4,5')).toBe(-4.5)
    expect(parseNombre('−4,5 %')).toBe(-4.5)
    expect(parseNombre('-12')).toBe(-12)
  })
})
