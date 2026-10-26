import { test, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Erreurs de cours corrigées après vérification des sources : elles ne doivent pas revenir.
const racine = new URL('../content/', import.meta.url).pathname
const lire = (f) => readFileSync(join(racine, f), 'utf8')
const tous = (dir = racine) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? tous(p) : p.endsWith('.json') ? [p] : []
})

test('sécurité du SI : le sigle est DICP (ou DIC pour les trois critères fondamentaux), jamais D.I.C.T.', () => {
  for (const f of tous()) expect(readFileSync(f, 'utf8'), f).not.toMatch(/D\.I\.C\.T/)
})

test('seuil de rentabilité du burger : 800 par mois font environ 36 par jour ouvré', () => {
  const t = lire('gestion-finance/approfondi-1.json')
  expect(t).not.toMatch(/27 burgers par jour/)
  expect(t).toMatch(/36 burgers par jour ouvré/)
})

test('responsabilité civile : le nombre de régimes annoncé est celui des régimes listés', () => {
  const t = lire('droit/approfondi-1.json')
  expect(t).not.toMatch(/prend trois formes/)
  expect(t).toMatch(/prend quatre formes/)
})

test('espaces ruraux : multifonctionnels, pas « ne servent plus qu’à produire »', () => {
  expect(lire('p1-histoire-geo/enrichissements.json')).not.toMatch(/ne servent plus qu’à produire/)
})

test('Banque de France : la date de nationalisation cite la loi du 2 décembre 1945', () => {
  expect(lire('histoire-geo/cours-complets.json')).toMatch(/Banque de France\*\* \(loi du 2 décembre 1945, en vigueur le 1er janvier 1946\)/)
})

test('aucune ponctuation « .; » dans les repères lexicaux des langues', () => {
  for (const f of tous()) expect(readFileSync(f, 'utf8').match(/Repères lexicaux de cet axe[^"]*\.;/), f).toBeNull()
})
