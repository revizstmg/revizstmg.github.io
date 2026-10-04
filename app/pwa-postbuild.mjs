// Post-build PWA : rend l'app installable et hors-ligne.
// 1) copie le manifest, le service worker et les icônes à côté de l'app ;
// 2) écrit dans le service worker la liste de tous les fichiers compilés à
//    mettre en cache, et une version qui change avec eux ;
// 3) injecte les balises <head> et l'enregistrement du service worker.
import { readdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createHash } from 'node:crypto'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SRC = join(ROOT, 'pwa')
const OUT = join(ROOT, 'dist')

// 1) Copier les fichiers PWA (tout sauf les scripts de génération).
const SKIP = new Set(['gen-icons.mjs'])
const copied = []
for (const f of readdirSync(SRC)) {
  if (SKIP.has(f)) continue
  copyFileSync(join(SRC, f), join(OUT, f))
  copied.push(f)
}

// 2) Liste des fichiers compilés (noms dépendant du contenu) et version.
const assets = readdirSync(join(OUT, 'assets')).sort().map((f) => `./assets/${f}`)
const version = createHash('sha256').update(assets.join('\n')).update(readFileSync(join(OUT, 'index.html'))).digest('hex').slice(0, 10)
const swPath = join(OUT, 'sw.js')
let sw = readFileSync(swPath, 'utf8')
if (!sw.includes('__VERSION__') || !sw.includes('/* __PRECACHE__ */ []')) throw new Error('sw.js : repères __VERSION__ / __PRECACHE__ introuvables')
sw = sw.replace('__VERSION__', version).replace('/* __PRECACHE__ */ []', JSON.stringify(assets))
writeFileSync(swPath, sw)

// 3) Injecter les balises PWA dans index.html.
const indexPath = join(OUT, 'index.html')
let html = readFileSync(indexPath, 'utf8')

const MARK = '<!-- pwa-head -->'
if (!html.includes(MARK)) {
  const head = `${MARK}
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="icon" type="image/png" href="./favicon.png" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="RévizSTMG" />
  `
  html = html.replace('</head>', `${head}</head>`)

  const reg = `<script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('./sw.js').catch(function () {});
        });
      }
    </script>
  `
  html = html.replace('</body>', `${reg}</body>`)
  writeFileSync(indexPath, html)
}

console.log('[pwa-postbuild] fichiers copiés :', copied.join(', '))
console.log(`[pwa-postbuild] service worker : version ${version}, ${assets.length} fichiers à mettre en cache`)
console.log('[pwa-postbuild] balises PWA injectées dans dist/index.html')
