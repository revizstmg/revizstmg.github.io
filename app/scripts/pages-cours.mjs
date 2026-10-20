// Écrit les pages de cours statiques dans dist/cours/ et le plan du site
// (dist/sitemap.xml). Lancé après la compilation : npm run build.
// Le rendu est dans scripts/pages-cours/generer.mjs.
import { mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chargerContenu, construirePages, sitemap } from './pages-cours/generer.mjs'

const ICI = dirname(fileURLToPath(import.meta.url))
const DIST = join(ICI, '..', 'dist')

await chargerContenu()
const pages = construirePages()
rmSync(join(DIST, 'cours'), { recursive: true, force: true })
for (const p of pages) {
  const dossier = join(DIST, p.chemin)
  mkdirSync(dossier, { recursive: true })
  writeFileSync(join(dossier, 'index.html'), p.html)
}
copyFileSync(join(ICI, 'pages-cours', 'cours.css'), join(DIST, 'cours', 'cours.css'))
writeFileSync(join(DIST, 'sitemap.xml'), sitemap(pages))
console.log(`[pages-cours] ${pages.length} pages de cours écrites dans dist/cours/, sitemap : ${pages.length + 1} adresses`)
