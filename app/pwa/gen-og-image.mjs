// Image d'aperçu des liens partagés (Open Graph, 1200 × 630), dans le style des
// icônes (gen-icons.mjs). À relancer seulement si le visuel change :
//   node pwa/gen-og-image.mjs   (depuis app/, Chromium de Playwright requis)
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DIR = dirname(fileURLToPath(import.meta.url))
const POLICES = join(DIR, '../node_modules/@fontsource')
// Tout est intégré dans la page (data:) : une page sans adresse ne peut pas lire de fichier local.
const enLigne = (chemin, type) => `data:${type};base64,${readFileSync(chemin).toString('base64')}`
const police = (paquet, fichier) => enLigne(join(POLICES, paquet, 'files', fichier), 'font/woff2')

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Cormorant Garamond'; font-weight: 700; src: url(${police('cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2')}); }
@font-face { font-family: 'Inter'; font-weight: 500; src: url(${police('inter', 'inter-latin-500-normal.woff2')}); }
html, body { margin: 0; }
body { width: 1200px; height: 630px; display: flex; align-items: center; gap: 64px; padding: 0 90px; box-sizing: border-box;
  background: radial-gradient(circle at 22% 18%, rgba(255,255,255,.08), transparent 55%), linear-gradient(135deg, #2c251b, #1b1611 55%, #100d09);
  font-family: 'Inter', sans-serif; color: #efe6d2; }
img { width: 230px; height: 230px; border-radius: 52px; box-shadow: 0 30px 60px -20px rgba(0,0,0,.7); flex-shrink: 0; }
h1 { margin: 0; font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 118px; line-height: 1; letter-spacing: -1px;
  background: linear-gradient(#f6dc9c, #e3bd6a 50%, #bb8c36); -webkit-background-clip: text; color: transparent; }
.trait { width: 120px; height: 3px; margin: 26px 0 24px; background: linear-gradient(90deg, #e3bd6a, transparent); }
p { margin: 0; }
.titre { font-size: 44px; color: #f4ecdb; }
.liste { margin-top: 18px; font-size: 28px; color: #cbbd9f; }
</style></head><body>
<img src="${enLigne(join(DIR, 'icon-512.png'), 'image/png')}" alt="">
<div>
  <h1>RévizSTMG</h1>
  <div class="trait"></div>
  <p class="titre">Réviser le bac STMG</p>
  <p class="liste">Cours · Exercices · Flashcards · Bacs blancs<br>Première et Terminale — gratuit</p>
</div>
</body></html>`

const navigateur = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: join(DIR, 'og-image.jpg'), type: 'jpeg', quality: 86 })
await navigateur.close()
console.log('pwa/og-image.jpg écrite')
