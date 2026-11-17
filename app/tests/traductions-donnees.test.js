import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Textes affichés par TextePublic à partir de données (et non de JSX) : le garde-fou
// « traductions-code » ne les voit pas. Ils doivent exister dans les cinq livres,
// sinon l'élève voit du français au milieu d'une page traduite (hors ligne).
const LANGUES = ['en', 'es', 'it', 'de', 'ar']
const norm = (s) => s.replace(/\s+/g, ' ').trim()
const livre = (l) => JSON.parse(readFileSync(new URL(`../src/localisation/public.${l}.json`, import.meta.url), 'utf8'))
const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), 'utf8')

function textesDuCoach() {
  const src = lire('../src/pages/Coach.jsx')
  return [...src.matchAll(/\b(?:name|desc|q|label): '((?:[^'\\]|\\.)*)'/g)].map((m) => norm(m[1].replace(/\\'/g, "'")))
}
function textesDesEpreuves() {
  const { epreuves } = JSON.parse(lire('../content/commun/epreuves.json'))
  return epreuves.flatMap((e) => [e.nom, e.note].filter(Boolean)).map(norm)
}

describe('textes de données traduits hors ligne', () => {
  const coach = textesDuCoach()
  const epreuves = textesDesEpreuves()
  it('le Coach et le calendrier des épreuves fournissent des textes', () => {
    expect(coach.length).toBeGreaterThanOrEqual(25)
    expect(epreuves.length).toBeGreaterThanOrEqual(8)
  })
  for (const l of LANGUES) {
    it(`${l} : méthodes et quiz du Coach, calendrier des épreuves`, () => {
      const b = livre(l)
      const absents = [...coach, ...epreuves].filter((t) => !(t in b))
      expect(absents.map((t) => t.slice(0, 70))).toEqual([])
    })
    it(`${l} : aucune phrase française recopiée telle quelle comme « traduction »`, () => {
      const b = livre(l)
      const mots = /\b(le|la|les|des|du|une|pour|tu|ton|ta|tes|est|restent|dans|avec)\b/i
      const copies = Object.entries(b).filter(([k, v]) => k === v && k.length > 14 && (k.match(new RegExp(mots.source, 'gi')) || []).length >= 2)
      expect(copies.map(([k]) => k.slice(0, 70))).toEqual([])
    })
  }
})
