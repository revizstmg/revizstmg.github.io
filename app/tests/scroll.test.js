import { describe, it, expect } from 'vitest'
import { chargerTout, ALL_CHAPTERS } from '../src/data/index.js'
import { construireFlux, decouper } from '../src/data/scroll.js'

describe('mode scroll', () => {
  it('coupe les paragraphes à la fin d’une phrase sans casser un passage en gras', () => {
    const t = 'Première phrase assez longue pour remplir une carte entière avec du **gras important** dedans et encore des mots. Deuxième phrase qui continue le propos avec **un autre terme clé** et du texte. Troisième phrase courte.'
    const m = decouper(t, 120)
    expect(m.length).toBeGreaterThan(1)
    for (const c of m) expect((c.match(/\*\*/g) || []).length % 2).toBe(0)
    expect(m.join(' ')).toBe(t)
  })
  it('chaque thème donne un flux de cartes valides, avec cours, flashcards et questions', async () => {
    await chargerTout()
    let avecFlash = 0, avecQcm = 0
    for (const id of Object.keys(ALL_CHAPTERS)) {
      const flux = construireFlux(id)
      if (!(ALL_CHAPTERS[id].cours || []).length) continue
      expect(flux.length, id).toBeGreaterThan(0)
      expect(flux.length).toBeLessThanOrEqual(90)
      for (const c of flux) {
        if (c.type === 'flash') { expect(c.recto && c.verso).toBeTruthy(); }
        else if (c.type === 'qcm') { expect(c.choix.length).toBeGreaterThanOrEqual(2); expect(c.bonne).toBeLessThan(c.choix.length) }
        else expect(c.texte.length, id).toBeGreaterThan(5)
        expect((String(c.texte || '').match(/\*\*/g) || []).length % 2, id).toBe(0)
      }
      if (flux.some((c) => c.type === 'flash')) avecFlash++
      if (flux.some((c) => c.type === 'qcm')) avecQcm++
    }
    expect(avecFlash).toBeGreaterThan(30)
    expect(avecQcm).toBeGreaterThan(30)
  })
})
