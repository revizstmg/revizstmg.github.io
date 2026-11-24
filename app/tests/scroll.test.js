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
    const genres = new Set()
    const tailles = []
    for (const id of Object.keys(ALL_CHAPTERS)) {
      const flux = construireFlux(id)
      if (!(ALL_CHAPTERS[id].cours || []).length) continue
      expect(flux.length, id).toBeGreaterThan(0)
      expect(flux.length).toBeLessThanOrEqual(100)
      for (const c of flux) {
        if (c.type === 'flash') { expect(c.recto && c.verso).toBeTruthy(); }
        else if (c.type === 'qcm') { expect(c.choix.length).toBeGreaterThanOrEqual(2); expect(c.bonne).toBeLessThan(c.choix.length) }
        else if (c.type === 'trou') { expect(c.texte).toContain('____'); expect(c.choix.length).toBe(4); expect(new Set(c.choix).size).toBe(4); expect(c.bonne).toBeLessThan(4) }
        else if (c.type === 'tri') { expect(c.categories.length).toBe(2); expect(c.categories.some((x) => x.id === c.bonne)).toBe(true) }
        else if (c.type === 'ordre') { expect(c.etapes.length).toBeGreaterThanOrEqual(3); expect(c.etapes.length).toBeLessThanOrEqual(7) }
        else if (c.type === 'paires') { expect(c.paires.length).toBe(3); expect(new Set(c.paires.map((x) => x.g)).size).toBe(3) }
        else if (c.type === 'mot') { expect(c.mot).toMatch(/^[A-Za-zÀ-ÿ]{5,12}$/); expect(c.indice.toLowerCase()).not.toContain(c.mot.toLowerCase()) }
        else expect(c.texte.length, id).toBeGreaterThan(5)
        genres.add(c.type)
        expect((String(c.texte || '').match(/\*\*/g) || []).length % 2, id).toBe(0)
      }
      tailles.push(flux.length)
      if (flux.some((c) => c.type === 'flash')) avecFlash++
      if (flux.some((c) => c.type === 'qcm')) avecQcm++
    }
    // Les jeux variés (compléter, mot mélangé, associer, A ou B, ordre) sont bien présents.
    for (const g of ['trou', 'mot', 'paires', 'tri', 'ordre', 'flash', 'qcm']) expect(genres.has(g), g).toBe(true)
    expect(avecFlash).toBeGreaterThan(30)
    expect(avecQcm).toBeGreaterThan(30)
    expect(tailles.filter((n) => n >= 80).length).toBeGreaterThan(tailles.length / 2)
  })
})
