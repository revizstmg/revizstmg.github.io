// Prépare le rapport du matin envoyé par mail (sujet, HTML, texte) :
//   npm run rapport -- --verif /tmp/verif.json --sortie /tmp/rapport
//   (soit NODE_USE_ENV_PROXY=1 vite-node scripts/rapport-mail.mjs -- …)
// (--releve chemin : un autre relevé que statistiques/dernier.json, pour essayer)
// La routine de vérification quotidienne écrit d'abord le résultat de ses
// contrôles dans verif.json, lance ce script, puis envoie sortie/email.html
// (et email.txt, sujet.txt) à l'adresse du projet.
//
// Données : le contenu et l'état de GitHub sont mesurés à l'instant ; les chiffres
// d'utilisation viennent du dernier relevé du workflow « Statistiques »
// (statistiques/dernier.json) et l'évolution de statistiques/historique.json.
//
// Format de verif.json (tout est facultatif) :
// { "construction": { "ok": true, "detail": "…" }, "tests": { "ok": true, "detail": "121 tests" },
//   "parcours": { "ok": true, "detail": "72 tests" }, "themes": ["…", "…"],
//   "problemes": [{ "gravite": "grave|moyen|mineur", "titre": "…", "ou": "…", "correction": "…" }],
//   "ci": { "etat": "success", "date": "ISO" }, "miseEnLigne": { "etat": "success", "date": "ISO" } }
// (ci et miseEnLigne ne servent que si l'API GitHub ne répond pas au script.)
// NODE_USE_ENV_PROXY=1 (dans le script npm) fait passer les requêtes par le proxy
// de l'environnement des routines.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { contenu, publication, SUBJECTS } from './stats-sources.mjs'
import { construireRapport } from './rapport.js'

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const option = (nom, defaut) => { const k = args.indexOf(`--${nom}`); return k >= 0 ? args[k + 1] : defaut }
const lireJson = (chemin) => { try { return existsSync(chemin) ? JSON.parse(readFileSync(chemin, 'utf8')) : null } catch (e) { console.error(`Lecture impossible : ${chemin} (${e.message})`); return null } }

const sortie = resolve(option('sortie', resolve(tmpdir(), 'rapport-revizstmg')))
const verif = option('verif') ? lireJson(resolve(option('verif'))) : null
const maintenant = new Date()
const jour = maintenant.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })

const [c, p] = await Promise.all([contenu(), publication(maintenant)])
const rapport = construireRapport({
  jour,
  verif,
  releve: lireJson(resolve(option('releve', resolve(RACINE, 'statistiques/dernier.json')))),
  contenu: c,
  // Si GitHub n'a pas répondu, l'état relevé par la routine elle-même.
  publication: { ...p, ci: p.ci || verif?.ci, miseEnLigne: p.miseEnLigne || verif?.miseEnLigne },
  historique: lireJson(resolve(RACINE, 'statistiques/historique.json')) || [],
  nomMatiere: (id) => SUBJECTS.find((s) => s.id === id)?.name || id,
})
mkdirSync(sortie, { recursive: true })
writeFileSync(resolve(sortie, 'sujet.txt'), rapport.sujet + '\n')
writeFileSync(resolve(sortie, 'email.html'), rapport.html)
writeFileSync(resolve(sortie, 'email.txt'), rapport.texte)
console.log(`Rapport prêt dans ${sortie} : ${rapport.sujet}`)
