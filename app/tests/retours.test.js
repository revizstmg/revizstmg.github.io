import { test, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Point 25 : tous les retours et sorties « ← … » ont la même apparence (classe
// lien-retour, index.css). « ← Précédent » et la flèche seule entre deux
// questions restent des boutons de navigation ; la croix ✕ ferme une fenêtre.
const racine = new URL('../src/', import.meta.url).pathname
const fichiers = (dossier) => readdirSync(dossier, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? fichiers(join(dossier, e.name)) : e.name.endsWith('.jsx') ? [join(dossier, e.name)] : [])

test('chaque bouton ou lien « ← texte » utilise la classe lien-retour', () => {
  const ecarts = []
  for (const f of fichiers(racine)) {
    const source = readFileSync(f, 'utf8')
    for (const m of source.matchAll(/<(button|Link)\b([^>]*)>\s*←\s*[^<\s][^<]{0,20}/g)) {
      if (m[0].includes("t('previous')")) continue
      if (!/lien-retour/.test(m[2])) ecarts.push(`${f.slice(racine.length)} : ${m[0].slice(0, 90)}`)
    }
  }
  expect(ecarts).toEqual([])
})
