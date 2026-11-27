import { describe, it, expect } from 'vitest'
import { answerMatchesCours } from '../src/games/common.jsx'

describe('réponses à écrire : termes composés', () => {
  it('« élasticité » est acceptée pour « élasticité-prix », sans accent aussi', () => {
    expect(answerMatchesCours('élasticité', 'élasticité-prix')).toBe(true)
    expect(answerMatchesCours('elasticite', 'élasticité-prix')).toBe(true)
    expect(answerMatchesCours('élasticité-prix', 'élasticité-prix')).toBe(true)
  })
  it('un premier mot trop court ou une réponse sans rapport reste refusé', () => {
    expect(answerMatchesCours('prix', 'prix-plafond')).toBe(false)
    expect(answerMatchesCours('marge', 'élasticité-prix')).toBe(false)
  })
})
