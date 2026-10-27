import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { BADGES } from '../src/badges.js'

// Constats de l'audit technique (agent A) : badges traduits hors ligne, étoiles lisibles par un lecteur d'écran.
const livre = (l) => JSON.parse(readFileSync(new URL(`../src/localisation/public.${l}.json`, import.meta.url), 'utf8'))

describe('badges', () => {
  it.each(['en', 'es', 'it', 'ar', 'de'])('%s : les 56 badges ont leur nom et leur description dans le catalogue local', (l) => {
    const book = livre(l)
    for (const b of BADGES) for (const t of [b.name, b.desc]) expect(book[t], `${b.id} : ${t}`).toBeTruthy()
  })
})

describe('étoiles de résultat', () => {
  it('portent un rôle « img » avec le libellé, et les glyphes sont masqués', () => {
    // Le composant passe par la traduction (store requis) : on contrôle donc sa source.
    const ui = readFileSync(new URL('../src/components/ui.jsx', import.meta.url), 'utf8')
    const stars = ui.slice(ui.indexOf('export function Stars'), ui.indexOf('export function Ring'))
    expect(stars).toContain('role="img"')
    expect(stars).toContain('aria-label={`${count} sur 3 étoiles`}')
    expect(stars).toContain('aria-hidden="true"')
  })
})
