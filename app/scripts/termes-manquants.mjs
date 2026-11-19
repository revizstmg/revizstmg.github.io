// Liste les mots en gras les plus fréquents d'un cours qui n'ont pas encore de définition
// (content/<matière>/termes.json + definitions.json). Aide à compléter le glossaire :
//   npm run termes                 (toutes les matières, 25 termes chacune)
//   npm run termes -- droit 60     (une matière, 60 termes)
// Seuls les termes de 1 à 4 mots vus au moins deux fois sont proposés ; c'est à la personne
// qui rédige de choisir ceux qui sont techniques (un gras d'emphase n'a pas besoin de définition).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const CONTENU = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'content')
const ARTICLES = /^(?:l['’]|d['’]|(?:le|la|les|un|une|des|du|de la|de l['’]|au|aux|ce|cette|ces|son|sa|ses|leur|leurs)\s+)/
const cle = (brut) => {
  let s = String(brut).replace(/\([^)]*\)/g, ' ').trim().replace(/^[\s.:;,!?«"“]+|[\s.:;,!?»"”]+$/g, '')
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ').trim()
  for (let i = 0; i < 2; i++) s = s.replace(ARTICLES, '')
  return s.trim()
}
const chaines = function* (o) {
  if (typeof o === 'string') yield o
  else if (Array.isArray(o)) for (const x of o) yield* chaines(x)
  else if (o && typeof o === 'object') for (const v of Object.values(o)) yield* chaines(v)
}
const lire = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')) } catch { return null } }

const [, , cible, limite = '25'] = process.argv
const matieres = readdirSync(CONTENU, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'commun' && (!cible || d.name === cible)).map((d) => d.name)
for (const m of matieres) {
  const deja = new Set()
  const termes = lire(join(CONTENU, m, 'termes.json'))?.[m] || {}
  for (const k of Object.keys(termes)) for (const a of k.split('|')) deja.add(cle(a))
  const defs = lire(join(CONTENU, m, 'definitions.json')) || {}
  for (const liste of Object.values(defs)) for (const it of liste || []) if (Array.isArray(it)) deja.add(cle(it[0]))
  const compte = new Map()
  for (const f of readdirSync(join(CONTENU, m)).filter((x) => x.endsWith('.json') && !['definitions.json', 'termes.json'].includes(x) && !x.includes('exercices'))) {
    const d = lire(join(CONTENU, m, f)); if (!d) continue
    for (const s of chaines(d)) for (const g of s.matchAll(/\*\*([^*]+)\*\*/g)) { const k = cle(g[1]); if (k) compte.set(k, (compte.get(k) || 0) + 1) }
  }
  const manquants = [...compte].filter(([k, n]) => n >= 2 && k.split(' ').length <= 4 && k.length > 3 && !deja.has(k) && !deja.has(k.replace(/s$/, ''))).sort((a, b) => b[1] - a[1])
  const total = [...compte.values()].reduce((a, b) => a + b, 0)
  const couvert = [...compte].filter(([k]) => deja.has(k) || deja.has(k.replace(/s$/, ''))).reduce((a, [, n]) => a + n, 0)
  console.log(`\n${m} : ${couvert}/${total} gras ont une définition ; ${manquants.length} termes vus 2 fois ou plus sans définition`)
  console.log(manquants.slice(0, Number(limite)).map(([k, n]) => `${k} (${n})`).join(', '))
}
