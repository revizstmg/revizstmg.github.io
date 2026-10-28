import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Une clé de livre doit déjà être normalisée comme le fait l'application
// (espaces multiples, insécables et retours à la ligne ramenés à un espace, sans
// espace aux extrémités), sinon la phrase n'est jamais retrouvée hors ligne.
const normalise = (k) => k.replace(/\s+/g, ' ').trim()
for (const l of ['en', 'es', 'it', 'de', 'ar']) {
  describe(`livre ${l}`, () => {
    const d = JSON.parse(readFileSync(new URL(`../src/localisation/public.${l}.json`, import.meta.url), 'utf8'))
    it('toutes les clés sont normalisées et toutes les traductions sont renseignées', () => {
      const anormales = Object.keys(d).filter((k) => k !== normalise(k))
      expect(anormales.slice(0, 5)).toEqual([])
      expect(Object.entries(d).filter(([, v]) => typeof v !== 'string' || !v.trim()).map(([k]) => k).slice(0, 5)).toEqual([])
    })
    it('les marqueurs {vN} de chaque clé figurent dans sa traduction', () => {
      const fautes = Object.entries(d).filter(([k, v]) => (k.match(/\{v\d+\}/g) || []).some((m) => !String(v).includes(m)))
      expect(fautes.map(([k]) => k.slice(0, 60)).slice(0, 5)).toEqual([])
    })
  })
}
