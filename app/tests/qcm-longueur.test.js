import { it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'

// Les flemmards repèrent la bonne réponse à sa longueur : dans les QCM écrits à la main, elle ne doit pas
// dépasser nettement la plus longue des mauvaises réponses (langues exclues : leurs choix sont dans la langue étudiée).
const racine = new URL('../content/', import.meta.url)
const trouver = (o, acc, f) => {
  if (Array.isArray(o)) o.forEach((x) => trouver(x, acc, f))
  else if (o && typeof o === 'object') {
    if (Array.isArray(o.choices) && typeof o.q === 'string' && Number.isInteger(o.answer)) acc.push({ f, q: o.q, ch: o.choices, a: o.answer })
    Object.values(o).forEach((x) => trouver(x, acc, f))
  }
}
it('aucun QCM rédigé n’a une bonne réponse nettement plus longue que les autres', () => {
  const trop = []
  for (const dossier of readdirSync(racine)) {
    if (dossier.includes('langues') || !statSync(new URL(dossier, racine)).isDirectory()) continue
    for (const f of readdirSync(new URL(`${dossier}/`, racine)).filter((n) => n.endsWith('.json') && !/^(termes|definitions)\.json$/.test(n))) {
      const acc = []
      trouver(JSON.parse(readFileSync(new URL(`${dossier}/${f}`, racine), 'utf8')), acc, `${dossier}/${f}`)
      for (const { q, ch, a } of acc) {
        const bonne = ch[a].length
        const autres = ch.filter((_, i) => i !== a).map((c) => c.length)
        if (autres.length && bonne >= 1.35 * Math.max(...autres) && bonne - Math.max(...autres) >= 12) trop.push(`${dossier}/${f} : ${q.slice(0, 60)}`)
      }
    }
  }
  expect(trop).toEqual([])
})
