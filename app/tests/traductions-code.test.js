import { describe, it, expect } from 'vitest'
import { transformSync } from '@babel/core'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import plugin from '../scripts/plugin-traductions.mjs'
import FR from '../src/i18n/fr.js'

// Toute phrase française écrite dans un composant (JSX) doit exister dans les
// cinq livres de traduction : sinon, hors ligne, elle part vers le service en
// ligne ou reste en français. Le plugin de compilation sert de référence.
const SRC = new URL('../src/', import.meta.url).pathname
const normalise = (k) => k.replace(/\s+/g, ' ').trim()
const marches = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n)
  return statSync(p).isDirectory() ? (n === 'localisation' ? [] : marches(p)) : p.endsWith('.jsx') ? [p] : []
})

function clesDuCode() {
  const cles = new Map()
  for (const f of marches(SRC)) {
    const code = transformSync(readFileSync(f, 'utf8'), { filename: f, plugins: [plugin], parserOpts: { plugins: ['jsx'] }, configFile: false, babelrc: false }).code
    for (const m of code.matchAll(/\btext(?:=\{?|"?:\s*)("(?:[^"\\]|\\.)*")/g)) {
      let k
      try { k = normalise(JSON.parse(m[1])) } catch { continue }
      if (k) cles.set(k, f.slice(SRC.length))
    }
  }
  return cles
}

describe('phrases du code et livres de traduction', () => {
  const deBase = new Set(Object.values(FR).map((v) => normalise(String(v))))
  const cles = clesDuCode()
  for (const l of ['en', 'es', 'it', 'de', 'ar']) {
    it(`${l} : aucune phrase du code n’est absente du livre`, () => {
      const livre = JSON.parse(readFileSync(join(SRC, `localisation/public.${l}.json`), 'utf8'))
      const absentes = [...cles].filter(([k]) => !(k in livre) && !deBase.has(k)).map(([k, f]) => `${f} : ${k.slice(0, 70)}`)
      expect(absentes.slice(0, 15)).toEqual([])
    })
  }
})
