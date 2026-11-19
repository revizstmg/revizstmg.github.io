import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { cleTerme, trouverDefinition } from '../src/data/termes.js'

// Glossaire des mots en gras des cours (content/<matière>/termes.json).
const CONTENU = new URL('../content/', import.meta.url).pathname
const matieres = readdirSync(CONTENU, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`${CONTENU}${d.name}/termes.json`)).map((d) => d.name)

describe('clé de comparaison d’un terme', () => {
  it('ignore la casse, les accents, la ponctuation, les articles et les parenthèses', () => {
    expect(cleTerme('La Personne morale')).toBe('personne morale')
    expect(cleTerme('L’exécution forcée.')).toBe('execution forcee')
    expect(cleTerme('Les dommages-intérêts')).toBe('dommages-interets')
    expect(cleTerme('cession (vente)')).toBe('cession')
    expect(cleTerme('  D’abord  ')).toBe('abord')
  })
  it('trouve le singulier et le pluriel simples', () => {
    const g = new Map([['obligation', 'x'], ['marques', 'y']])
    expect(trouverDefinition(g, 'obligations')).toBe('x')
    expect(trouverDefinition(g, 'marque')).toBe('y')
    expect(trouverDefinition(g, 'inconnu')).toBeNull()
    expect(trouverDefinition(g, 'ab')).toBeNull()
    expect(trouverDefinition(null, 'obligation')).toBeNull()
  })
})

describe('contenu du glossaire', () => {
  it('plusieurs matières ont un glossaire', () => expect(matieres.length).toBeGreaterThanOrEqual(10))
  for (const m of matieres) {
    it(`${m} : définitions complètes, sans doublon ni gras`, () => {
      const f = JSON.parse(readFileSync(`${CONTENU}${m}/termes.json`, 'utf8'))
      expect(Object.keys(f)).toEqual([m])
      const vus = new Map()
      const problemes = []
      for (const [cles, def] of Object.entries(f[m])) {
        if (typeof def !== 'string' || def.trim().length < 20 || def.length > 420) problemes.push(`${cles} : longueur de la définition`)
        if (/\*|\n/.test(def)) problemes.push(`${cles} : gras ou saut de ligne dans la définition`)
        if (!/[.!?)»]$/.test(def.trim())) problemes.push(`${cles} : la définition ne se termine pas par une ponctuation`)
        for (const a of cles.split('|')) {
          const k = cleTerme(a)
          if (!k) problemes.push(`${cles} : clé vide`)
          else if (vus.has(k) && vus.get(k) !== cles) problemes.push(`${a} : déjà défini par « ${vus.get(k)} »`)
          vus.set(k, cles)
        }
      }
      expect(problemes).toEqual([])
    })
  }
})
