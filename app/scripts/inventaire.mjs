// Inventaire du code de l'app : taille de chaque fichier, qui importe quoi,
// fichiers jamais importés. Sert à tenir docs/ARCHITECTURE.md à jour.
//   node scripts/inventaire.mjs          -> résumé lisible
//   node scripts/inventaire.mjs --json   -> données brutes
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(APP, 'src')

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const files = walk(SRC).filter((f) => ['.js', '.jsx', '.json', '.css'].includes(extname(f)))
const rel = (f) => relative(APP, f)
const IMPORT_RE = /(?:import\s[^'"]*?from\s*|import\s*\(\s*|import\s+)['"](\.[^'"]+)['"]/g

function resolveImport(from, spec) {
  const base = resolve(dirname(from), spec)
  for (const cand of [base, base + '.js', base + '.jsx', base + '.json', join(base, 'index.js')]) {
    try { if (statSync(cand).isFile()) return cand } catch {}
  }
  return null
}

const graph = {}
for (const f of files) {
  const text = extname(f) === '.css' ? '' : readFileSync(f, 'utf8')
  const deps = []
  for (const m of text.matchAll(IMPORT_RE)) {
    const target = resolveImport(f, m[1])
    if (target) deps.push(rel(target))
  }
  graph[rel(f)] = { bytes: statSync(f).size, lines: text ? text.split('\n').length : 0, imports: [...new Set(deps)] }
}

const importedBy = {}
for (const [f, info] of Object.entries(graph)) {
  for (const d of info.imports) (importedBy[d] ||= []).push(f)
}
const entries = new Set(['src/main.jsx'])
const orphans = Object.keys(graph).filter((f) => !importedBy[f] && !entries.has(f))

// Fichiers atteignables depuis main.jsx (le reste n'est jamais exécuté).
const reachable = new Set()
const stack = [...entries]
while (stack.length) {
  const f = stack.pop()
  if (reachable.has(f) || !graph[f]) continue
  reachable.add(f)
  stack.push(...graph[f].imports)
}
const unreachable = Object.keys(graph).filter((f) => !reachable.has(f))

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ graph, importedBy, orphans, unreachable }, null, 2))
} else {
  const byDir = {}
  for (const [f, i] of Object.entries(graph)) {
    const d = dirname(f)
    byDir[d] ||= { files: 0, bytes: 0, lines: 0 }
    byDir[d].files++; byDir[d].bytes += i.bytes; byDir[d].lines += i.lines
  }
  console.log('Dossier'.padEnd(22), 'fichiers', 'lignes'.padStart(8), 'Ko'.padStart(7))
  for (const [d, s] of Object.entries(byDir).sort()) {
    console.log(d.padEnd(22), String(s.files).padStart(8), String(s.lines).padStart(8), (s.bytes / 1024).toFixed(0).padStart(7))
  }
  console.log('\nJamais importés :', orphans.length ? orphans.join(', ') : 'aucun')
  console.log('Inaccessibles depuis main.jsx :', unreachable.length ? unreachable.join(', ') : 'aucun')
}
