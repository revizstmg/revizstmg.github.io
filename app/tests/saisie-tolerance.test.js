import { describe, it, expect } from 'vitest'
import { answerMatchesCours, answerMatches } from '../src/games/common.jsx'

// Une réponse juste ne doit pas être refusée pour sa seule écriture.
describe('correcteur de saisie des cours', () => {
  const ok = [
    ['2 septembre 1945', '2 sept. 1945'], ['24 octobre 1929', '24 oct. 1929'], ['27 janvier 1945', '27 janv. 1945'],
    ['septembre 1938', 'sept. 1938'], ['2 sept. 1945', '2 septembre 1945'],
    ['2000 €', '2 000 €'], ['90000 €', '90 000 €'], ['2 000€', '2 000 €'], ['2000€', '2 000 €'],
    ['10%', '10 %'], ['10 %', '10 %'], ['TVA à 10%', 'TVA à 10 %'],
    ['5.5 %', '5,5 %'], ['2.5', '2,5'], ['2,00€', '2,00 €'],
    ['oeuvre', 'œuvre'], ['coeur', 'cœur'], ['au coeur', 'au cœur'],
    ['hors taxes', 'hors taxes (HT)'], ['HT', 'hors taxes (HT)'], ['plan comptable général', 'Plan comptable général (PCG)'],
    ['1 058,40 €', '1 058,40 € TTC'], ['convention collective', 'La convention collective'],
  ]
  for (const [saisie, attendu] of ok) it(`accepte « ${saisie} » pour « ${attendu} »`, () => expect(answerMatchesCours(saisie, attendu)).toBe(true))

  const non = [
    ['2 000 €', '3 000 €'], ['10 %', '12 %'], ['5,5 %', '5 %'], ['2 septembre 1945', '8 mai 1945'], ['septembre 1938', 'septembre 1939'],
    ['2 sept. 1945', '2 sept. 1944'], ['hors', 'hors taxes (HT)'], ['', '2 000 €'], ['1 000 €', '10 000 €'], ['100', '1 000'],
  ]
  for (const [saisie, attendu] of non) it(`refuse « ${saisie} » pour « ${attendu} »`, () => expect(answerMatchesCours(saisie, attendu)).toBe(false))

  it('les langues restent strictes (l’article fait partie de la réponse), la ligature mise à part', () => {
    expect(answerMatches('le chat', 'chat')).toBe(false)
    expect(answerMatches('coeur', 'cœur')).toBe(true)
  })
})
