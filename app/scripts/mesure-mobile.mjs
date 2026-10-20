// Mesure du démarrage sur un téléphone émulé (point 27 de l'audit).
//   node scripts/mesure-mobile.mjs <dossier compilé> [<autre dossier>…]
// Chaque dossier (un « dist » compilé) est servi en local avec compression gzip,
// comme GitHub Pages. Chromium émule un Pixel 7, un processeur 4 fois plus lent
// et une 4G lente (1,6 Mbit/s, 150 ms de latence). Élève fictif déjà inscrit ;
// aucune requête extérieure ; service worker désactivé (première visite).
// Mesures : affichage du titre de l'accueil, LCP, temps de blocage du fil
// principal (somme des tâches longues au-delà de 50 ms) et octets reçus.
// C'est une émulation : un vrai téléphone peut être plus lent ou plus rapide.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { gzipSync } from 'node:zlib'
import { chromium, devices } from '@playwright/test'

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }
const ESSAIS = 3

function servir(dossier) {
  const serveur = createServer(async (req, res) => {
    const chemin = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '')
    try {
      let corps = await readFile(join(dossier, chemin.endsWith('/') ? chemin + 'index.html' : chemin))
      const type = TYPES[extname(chemin) || '.html'] || 'application/octet-stream'
      const entetes = { 'content-type': type, 'cache-control': 'no-store' }
      if (/text|javascript|json|svg|manifest/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) { corps = gzipSync(corps); entetes['content-encoding'] = 'gzip' }
      res.writeHead(200, entetes).end(corps)
    } catch { res.writeHead(404).end() }
  })
  return new Promise((ok) => serveur.listen(0, '127.0.0.1', () => ok(serveur)))
}

async function essai(navigateur, url) {
  const contexte = await navigateur.newContext({ ...devices['Pixel 7'], serviceWorkers: 'block' })
  const page = await contexte.newPage()
  await page.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()))
  await page.addInitScript(() => {
    const jour = new Date().toLocaleDateString('sv-SE')
    localStorage.setItem('stmg_reset_v2', '1')
    localStorage.setItem('stmg_progress_v2', JSON.stringify({ profile: { firstName: 'Léa', lastName: 'Test' }, track: { level: 'terminale-stmg', specialty: 'gestion-finance' }, onboarded: true, streak: { count: 1, last: jour } }))
    window.__mesure = { lcp: 0, blocage: 0 }
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__mesure.lcp = e.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__mesure.blocage += Math.max(0, e.duration - 50) }).observe({ type: 'longtask', buffered: true })
  })
  const cdp = await contexte.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  let octets = 0
  cdp.on('Network.loadingFinished', (e) => { octets += e.encodedDataLength })
  const debut = Date.now()
  await page.goto(url + '#/accueil')
  await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 60000 })
  const titre = Date.now() - debut
  await page.waitForTimeout(3000)
  const m = await page.evaluate(() => window.__mesure)
  await contexte.close()
  return { titre, lcp: Math.round(m.lcp), blocage: Math.round(m.blocage), octets }
}

const navigateur = await chromium.launch()
for (const dossier of process.argv.slice(2)) {
  const serveur = await servir(dossier)
  const url = `http://127.0.0.1:${serveur.address().port}/`
  const essais = []
  for (let i = 0; i < ESSAIS; i++) essais.push(await essai(navigateur, url))
  serveur.close()
  const mediane = (k) => essais.map((e) => e[k]).sort((a, b) => a - b)[Math.floor(ESSAIS / 2)]
  console.log(JSON.stringify({ dossier, titre_ms: mediane('titre'), lcp_ms: mediane('lcp'), blocage_ms: mediane('blocage'), octets: mediane('octets'), essais }))
}
await navigateur.close()
