import { test, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Les chapitres d'arabe et d'italien de Terminale reprennent mot pour mot ceux de Première
// (audit du contenu). Leur réécriture au niveau Terminale demande un auteur qui lit ces
// langues : en attendant, ce test fige la liste connue pour qu'aucun nouveau clone n'apparaisse.
const lire = (m) => Object.fromEntries(JSON.parse(readFileSync(new URL(`../content/${m}/matiere.json`, import.meta.url), 'utf8')).chapters.map((t) => [t.id, t]))
const T = lire('langues')
const P = lire('p1-langues')

const clones = []
for (const l of ['it', 'ar']) for (const s of ['gram', 'voc', 'comp']) {
  const t = T[`lng-${l}-${s}`].cours
  const p = P[`lng-${l}-p1-${s}`].cours
  t.forEach((c, i) => { if (p[i] && JSON.stringify(c) === JSON.stringify(p[i])) clones.push(`lng-${l}-${s}::${i}`) })
}

test('chapitres de Terminale identiques à ceux de Première : liste connue, sans nouveau clone', () => {
  expect(clones.sort()).toEqual([
    'lng-ar-comp::0', 'lng-ar-comp::1', 'lng-ar-gram::0', 'lng-ar-gram::1', 'lng-ar-gram::2', 'lng-ar-gram::3',
    'lng-ar-voc::0', 'lng-ar-voc::1', 'lng-ar-voc::2',
    'lng-it-comp::0', 'lng-it-comp::1', 'lng-it-gram::0', 'lng-it-gram::1', 'lng-it-gram::2', 'lng-it-gram::3',
    'lng-it-voc::0', 'lng-it-voc::1', 'lng-it-voc::2',
  ])
})
