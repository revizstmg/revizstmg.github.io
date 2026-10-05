// Vérifie les liens vers d'autres sites (ressources, vidéos, sites officiels)
// cités dans le contenu (content/) et dans le code (src/). Lancé chaque semaine
// par .github/workflows/liens.yml, ou à la main :
//   node scripts/verifier-liens.mjs
// Sort en erreur si un lien est cassé (page disparue, site introuvable) : GitHub
// prévient alors par e-mail. Les liens internes de l'app sont vérifiés par
// tests/liens.test.js.
import { readdirSync, readFileSync, statSync, appendFileSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Adresses qui ne sont pas des pages à visiter : exemples, services appelés par
// l'app (ils ont leurs propres contrôles), recherches YouTube (une page de
// recherche existe toujours).
const IGNORER = [/^https:\/\/site\.fr/, /mymemory\.translated\.net/, /\.supabase\.co/, /youtube\.com\/results\?/]
// Codes qui viennent souvent d'une protection anti-robots : à regarder à la
// main, sans faire échouer la vérification.
const DOUTEUX = new Set([401, 403, 405, 429, 503])

const fichiers = (dossier) => readdirSync(dossier).flatMap((f) => {
  const p = join(dossier, f)
  return statSync(p).isDirectory() ? fichiers(p) : /\.(json|jsx?|mjs)$/.test(f) ? [p] : []
})

const liens = new Map() // url → fichiers où elle apparaît
for (const f of [...fichiers(join(APP, 'content')), ...fichiers(join(APP, 'src'))]) {
  for (const m of readFileSync(f, 'utf8').matchAll(/https?:\/\/[^\s"'`<>\\)]+/g)) {
    const url = m[0].replace(/[.,;:]+$/, '')
    if (url.includes('${') || IGNORER.some((r) => r.test(url))) continue
    if (!liens.has(url)) liens.set(url, new Set())
    liens.get(url).add(relative(APP, f))
  }
}

async function tester(url, essai = 1) {
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RevizSTMG-verification-liens; +https://revizstmg.github.io)', Accept: 'text/html,*/*' },
    })
    r.body?.cancel()
    return { code: r.status }
  } catch (e) {
    if (essai < 2) return tester(url, essai + 1)
    return { code: 0, erreur: e.cause?.code || e.name || e.message }
  }
}

const resultats = []
const urls = [...liens.keys()].sort()
for (let i = 0; i < urls.length; i += 6) {
  const lot = urls.slice(i, i + 6)
  resultats.push(...await Promise.all(lot.map(async (url) => ({ url, ...(await tester(url)) }))))
}

const casses = resultats.filter((r) => r.code === 0 || (r.code >= 400 && !DOUTEUX.has(r.code)))
const douteux = resultats.filter((r) => DOUTEUX.has(r.code))
const ligne = (r) => `- ${r.url} → ${r.code || r.erreur} (${[...liens.get(r.url)].join(', ')})`

const rapport = [
  `## Liens externes : ${resultats.length} vérifiés`,
  '',
  casses.length ? `### ❌ ${casses.length} lien(s) cassé(s)\n\n${casses.map(ligne).join('\n')}\n` : '✅ Aucun lien cassé.\n',
  douteux.length ? `### ⚠️ ${douteux.length} lien(s) à vérifier à la main (le site refuse peut-être les robots)\n\n${douteux.map(ligne).join('\n')}\n` : '',
].join('\n')
console.log(rapport)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, rapport + '\n')
process.exit(casses.length ? 1 : 0)
