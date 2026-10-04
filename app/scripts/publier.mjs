// Publication : dépose la version compilée (dist/) à la racine du dépôt, que
// GitHub Pages sert. Utilisé par le workflow « Tester et publier ».
//   node app/scripts/publier.mjs <dossier compilé> [racine du site]
//
// Les fichiers de assets/ ont des noms qui changent avec leur contenu. On garde
// ceux de la version précédente en plus de la nouvelle : un élève qui a encore
// l'ancienne version ouverte doit pouvoir charger les fichiers qu'elle demande.
// Tout le reste (versions plus anciennes) est supprimé.
import { readdirSync, readFileSync, copyFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const DIST = resolve(process.argv[2] || 'dist')
const SITE = resolve(process.argv[3] || '.')

// Fichiers de la version actuellement en ligne, d'après son service worker.
function fichiersEnLigne() {
  const sw = join(SITE, 'sw.js')
  if (!existsSync(sw)) return []
  const m = readFileSync(sw, 'utf8').match(/const PRECACHE = (\[[^\]]*\])/)
  if (!m) return []
  try {
    return JSON.parse(m[1]).filter((u) => u.startsWith('./assets/')).map((u) => u.slice('./assets/'.length))
  } catch {
    return []
  }
}

const precedents = fichiersEnLigne()
const nouveaux = readdirSync(join(DIST, 'assets'))

mkdirSync(join(SITE, 'assets'), { recursive: true })
for (const f of nouveaux) copyFileSync(join(DIST, 'assets', f), join(SITE, 'assets', f))
for (const f of readdirSync(DIST)) {
  if (f === 'assets') continue
  if (statSync(join(DIST, f)).isFile()) copyFileSync(join(DIST, f), join(SITE, f))
}

const garder = new Set([...nouveaux, ...precedents])
const supprimes = []
for (const f of readdirSync(join(SITE, 'assets'))) {
  if (!garder.has(f)) { rmSync(join(SITE, 'assets', f)); supprimes.push(f) }
}

console.log(`Publié : ${nouveaux.length} fichiers ; gardés de la version précédente : ${precedents.filter((f) => !nouveaux.includes(f)).length} ; supprimés : ${supprimes.length}`)
