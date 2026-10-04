// Outils partagés par les tests.
import { createHash } from 'node:crypto'

// Hasard reproductible : les exercices sont tirés au hasard (shuffle). Pour
// comparer deux versions du code, on remplace Math.random par un générateur
// à graine (mulberry32) le temps d'un calcul.
function graine(texte) {
  let h = 2166136261
  for (const c of String(texte)) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}
export function avecGraine(cle, fn) {
  let a = graine(cle)
  const original = Math.random
  Math.random = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  try {
    return fn()
  } finally {
    Math.random = original
  }
}

// Sérialisation qui garde la trace de ce que JSON perdrait (fonctions,
// valeurs undefined, expressions régulières).
export function serialiser(valeur) {
  return JSON.stringify(valeur, (cle, v) => {
    if (typeof v === 'function') return `[fonction ${v.name || 'anonyme'}]`
    if (v === undefined) return '[undefined]'
    if (v instanceof RegExp) return `[regex ${v}]`
    return v
  })
}

export function empreinte(valeur) {
  return createHash('sha256').update(serialiser(valeur)).digest('hex').slice(0, 16)
}
