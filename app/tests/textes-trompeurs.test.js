import { test, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Formulations retirées après l'audit d'utilisation : jargon, promesses fausses ou message faux pour un visiteur.
const racine = new URL('../src/', import.meta.url).pathname
const tous = (dir = racine) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? tous(p) : /\.(jsx|js)$/.test(n) ? [p] : []
})
const sources = tous().filter((f) => !/localisation|i18n\//.test(f)).map((f) => [f, readFileSync(f, 'utf8')])

test.each([
  ['Le générateur est temporairement', 'jargon : « le générateur »'],
  ['Ta série précédente', 'fausse pour un élève qui n’a jamais créé de série'],
  ['envoyé à Gemini uniquement', 'le service d’IA doit être expliqué, pas seulement nommé'],
  ['Tu obtiens un bilan relié au cours', 'promet un bilan avant de dire qu’il est prévu dans Premium'],
])('« %s » n’apparaît plus (%s)', (texte) => {
  for (const [f, s] of sources) expect(s.includes(texte), f).toBe(false)
})
