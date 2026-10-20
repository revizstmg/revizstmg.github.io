import { describe, it, expect } from 'vitest'
import { composerSujetMaths, corriger, lireReponse, reponseJuste, texteReponse, polynome } from '../src/data/sujetMaths.js'

// Générateur pseudo-aléatoire reproductible (mulberry32).
function graine(n) {
  return () => { n |= 0; n = (n + 0x6d2b79f5) | 0; let t = Math.imul(n ^ (n >>> 15), 1 | n); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const questions = (sujet) => sujet.parties.flatMap((p) => p.exercices.flatMap((e) => e.questions))

describe('sujet d’entraînement à l’épreuve anticipée de mathématiques', () => {
  it('suit le format du BO : 2 h, partie 1 sur 6, partie 2 sur 14 en trois exercices de domaines différents', () => {
    for (let k = 0; k < 300; k++) {
      const s = composerSujetMaths(graine(k))
      expect(s.duree).toBe(7200)
      const [p1, p2] = s.parties
      expect(p1.exercices[0].questions.reduce((n, q) => n + q.points, 0)).toBe(6)
      expect(p2.exercices).toHaveLength(3)
      expect(p2.exercices.flatMap((e) => e.questions).reduce((n, q) => n + q.points, 0)).toBe(14)
      expect(new Set(p2.exercices.map((e) => e.titre)).size).toBe(3)
    }
  })

  it('a des réponses calculables sans calculatrice, acceptées telles que la correction les écrit', () => {
    for (let k = 0; k < 500; k++) {
      const s = composerSujetMaths(graine(k))
      for (const q of questions(s)) {
        const texte = `${q.enonce} ${q.correction}`
        expect(texte, texte).not.toMatch(/NaN|undefined|Infinity|\[object/)
        if (q.reponse.fraction) {
          expect(Number.isInteger(q.reponse.fraction.num) && Number.isInteger(q.reponse.fraction.den)).toBe(true)
        } else {
          const v = q.reponse.valeur
          expect(Number.isFinite(v), q.enonce).toBe(true)
          // Au plus trois décimales : un calcul de tête reste possible.
          expect(Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6, `${q.enonce} → ${v}`).toBe(true)
        }
        expect(reponseJuste(q, texteReponse(q)), `${q.enonce} → ${texteReponse(q)}`).toBe(true)
      }
    }
  })

  it('note la copie : tout juste = 20, rien = 0', () => {
    const s = composerSujetMaths(graine(7))
    const justes = Object.fromEntries(questions(s).map((q) => [q.id, texteReponse(q)]))
    expect(corriger(s, justes).total).toBe(20)
    expect(corriger(s, {}).total).toBe(0)
  })

  it('lit les écritures usuelles des élèves', () => {
    expect(lireReponse('12,5')).toEqual({ valeur: 12.5 })
    expect(lireReponse(' −4 % ')).toEqual({ valeur: -4 })
    expect(lireReponse('+21%')).toEqual({ valeur: 21 })
    expect(lireReponse('x = 3')).toEqual({ valeur: 3 })
    expect(lireReponse('18 min')).toEqual({ valeur: 18 })
    expect(lireReponse('7/12')).toEqual({ num: 7, den: 12 })
    expect(lireReponse('abc')).toBe(null)
    expect(lireReponse('')).toBe(null)
    const q = { reponse: { fraction: { num: 7, den: 12 } } }
    expect(reponseJuste(q, '7/12')).toBe(true)
    expect(reponseJuste(q, '14/24')).toBe(false) // pas irréductible
    expect(reponseJuste({ reponse: { valeur: 0.85 } }, '0,85')).toBe(true)
  })

  it('écrit les polynômes sans « 1x » ni « + − »', () => {
    expect(polynome(-1, 8, -12)).toBe('−x² + 8x − 12')
    expect(polynome(2, -1, 0)).toBe('2x² − x')
    expect(polynome(1, 0, 5)).toBe('x² + 5')
  })
})
