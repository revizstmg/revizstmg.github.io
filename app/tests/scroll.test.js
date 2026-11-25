import { describe, it, expect } from 'vitest'
import { chargerTout, ALL_CHAPTERS, themeChapters } from '../src/data/index.js'
import { construireFlux } from '../src/data/scroll.js'

describe('mode scroll', () => {
  it('chaque chapitre donne des exercices valides (jamais de cours) et les formats variés sont présents', async () => {
    await chargerTout()
    const genres = new Set()
    const tailles = []
    for (const id of Object.keys(ALL_CHAPTERS)) {
      const n = themeChapters(ALL_CHAPTERS[id]).length
      for (let i = 0; i < n; i++) {
        const flux = construireFlux(id, i)
        expect(flux.length).toBeLessThanOrEqual(100)
        tailles.push(flux.length)
        for (const c of flux) {
          genres.add(c.type)
          expect(['trou', 'qcm', 'tri', 'ordre', 'paires', 'mot', 'flash'], `${id}:${i}`).toContain(c.type)
          if (c.type === 'flash') expect(c.recto && c.verso).toBeTruthy()
          else if (c.type === 'qcm') { expect(c.choix.length).toBeGreaterThanOrEqual(2); expect(c.bonne).toBeLessThan(c.choix.length); expect(c.q).toBeTruthy() }
          else if (c.type === 'trou') { expect(c.texte).toContain('____'); expect(c.choix.length).toBe(4); expect(new Set(c.choix).size).toBe(4); expect(c.bonne).toBeLessThan(4) }
          else if (c.type === 'tri') { expect(c.categories.length).toBe(2); expect(c.categories.some((x) => x.id === c.bonne)).toBe(true) }
          else if (c.type === 'ordre') { expect(c.etapes.length).toBeGreaterThanOrEqual(3); expect(c.etapes.length).toBeLessThanOrEqual(7) }
          else if (c.type === 'paires') { expect(c.paires.length).toBe(3); expect(new Set(c.paires.map((x) => x.g)).size).toBe(3) }
          else if (c.type === 'mot') { expect(c.mot).toMatch(/^[A-Za-zÀ-ÿ]{5,12}$/); expect(c.indice.toLowerCase()).not.toContain(c.mot.toLowerCase()) }
          expect((String(c.texte || '').match(/\*\*/g) || []).length % 2).toBe(0)
        }
      }
    }
    for (const g of ['trou', 'mot', 'paires', 'tri', 'ordre', 'flash', 'qcm']) expect(genres.has(g), g).toBe(true)
    tailles.sort((x, y) => x - y)
    // Une grande partie des chapitres approche la centaine d'exercices.
    expect(tailles[Math.floor(tailles.length / 2)]).toBeGreaterThanOrEqual(60)
    expect(tailles.filter((n) => n >= 90).length).toBeGreaterThan(200)
  })
})
