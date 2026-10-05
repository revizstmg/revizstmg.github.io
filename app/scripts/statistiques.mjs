// Statistiques principales de RévizSTMG, écrites dans statistiques/ à la racine
// du dépôt (STATISTIQUES.md lisible, historique.json pour l'évolution).
// Lancé chaque matin à 6 h, heure de Paris, par .github/workflows/statistiques.yml :
//   npx vite-node scripts/statistiques.mjs
// vite-node sert à importer le contenu de l'app comme le fait Vite (fichiers JSON).
//
// Sources :
// - le contenu de l'app (matières, thèmes, chapitres, exercices, flashcards) ;
// - Supabase : des comptages déjà agrégés par la fonction revizstmg_statistiques()
//   (aucun nom, aucune adresse ne sort de la base) ;
// - GitHub : dernière CI sur main, dernière mise en ligne, activité de la semaine ;
// - RESULTAT_TESTS : résultat de `npm test`, passé par le workflow.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as C from '../src/data/index.js'
import { SUPA_URL, SUPA_ANON } from '../src/supabase.js'

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DOSSIER = resolve(RACINE, 'statistiques')
const HISTORIQUE = resolve(DOSSIER, 'historique.json')
const DEPOT = 'revizstmg/revizstmg.github.io'
const maintenant = new Date()
const jour = maintenant.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }) // AAAA-MM-JJ
const nb = (n) => (n == null ? '—' : Number(n).toLocaleString('fr-FR'))

// ---- Contenu ----
// Nombre de questions d'une série d'exercices, selon son type.
function questions(jeu) {
  for (const cle of ['questions', 'pairs', 'items', 'cases', 'steps']) {
    if (Array.isArray(jeu[cle])) return cle === 'steps' ? 1 : jeu[cle].length
  }
  return 1 // exercices tirés à la volée (calculs, conjugaison…)
}

async function contenu() {
  await C.chargerTout()
  const c = { matieres: 0, terminale: 0, premiere: 0, themes: 0, chapitres: 0, series: 0, questions: 0, flashcards: 0 }
  for (const s of C.SUBJECTS) {
    c.matieres++
    if (s.niveau === 'premiere') c.premiere++
    else c.terminale++
    for (const t of s.chapters || []) {
      const theme = C.ALL_CHAPTERS[t.id]
      if (!theme || theme.comingSoon) continue
      c.themes++
      for (const ch of C.themeChapters(theme)) {
        c.chapitres++
        c.series += ch.games.length
        c.questions += ch.games.reduce((a, j) => a + questions(j), 0)
      }
      c.flashcards += C.deckForTheme(t.id)?.cards?.length || 0
    }
  }
  return c
}

// ---- Utilisation (Supabase) ----
async function utilisation() {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/rpc/revizstmg_statistiques`, {
      method: 'POST',
      headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}`, 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (r.status === 404) return { erreur: 'la fonction de comptage revizstmg_statistiques() n’est pas encore installée dans la base' }
    if (!r.ok) return { erreur: `Supabase a répondu ${r.status}` }
    return await r.json()
  } catch (e) {
    return { erreur: `Supabase injoignable (${e.message})` }
  }
}

// ---- GitHub ----
async function github(chemin) {
  const headers = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const r = await fetch(`https://api.github.com/repos/${DEPOT}${chemin}`, { headers })
  if (!r.ok) throw new Error(`GitHub ${r.status}`)
  return r.json()
}

async function publication() {
  const p = {}
  try {
    // Dernier passage terminé : un passage encore en cours n'a pas de résultat.
    const runs = await github('/actions/workflows/deploy.yml/runs?branch=main&status=completed&per_page=1')
    const run = runs.workflow_runs?.[0]
    if (run) p.ci = { etat: run.conclusion, date: run.updated_at }
  } catch { /* indisponible */ }
  try {
    // Dernière mise en ligne réussie. Un déploiement remplacé par un plus récent
    // est annulé et GitHub le note « error » : ce n'est pas une panne (la
    // vérification de 6 h surveille les vraies pannes).
    for (const dep of await github('/deployments?per_page=10')) {
      const st = (await github(`/deployments/${dep.id}/statuses?per_page=1`))[0]
      if (st?.state === 'success') { p.miseEnLigne = { etat: 'success', date: st.created_at }; break }
    }
  } catch { /* indisponible */ }
  try {
    const depuis = new Date(maintenant - 7 * 864e5).toISOString()
    const commits = await github(`/commits?sha=main&since=${depuis}&per_page=100`)
    p.modifications7j = commits.filter((c) => !/^(Publication automatique|Statistiques du)/.test(c.commit.message)).length
  } catch { /* indisponible */ }
  return p
}

// ---- Mise en forme ----
const dateFr = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short' }) : '—')
const etatIcone = (e) => (e === 'success' ? '✅' : e ? '❌' : '—')
const nomMatiere = (id) => C.SUBJECTS.find((s) => s.id === id)?.name || id
const NIVEAUX = { 'terminale-stmg': 'Terminale', 'premiere-stmg': 'Première' }
const repartition = (obj, nommer) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${nommer(k)} ${n}`).join(' · ') || '—'
const ecart = (n, avant) => (n == null || avant == null || n === avant ? '' : ` (${n > avant ? '+' : ''}${n - avant} en 7 jours)`)

function rediger(u, c, p, histo) {
  const ilYa7j = histo.filter((h) => h.date <= new Date(maintenant - 7 * 864e5).toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })).pop()
  const l = []
  l.push('# 📊 Statistiques de RévizSTMG', '')
  l.push(`Mises à jour automatiquement chaque matin à 6 h (heure de Paris). Dernière mise à jour : **${dateFr(maintenant)}**.`, '')

  l.push('## 👥 Utilisation', '')
  if (u.erreur) {
    l.push(`Indisponible aujourd'hui : ${u.erreur}.`, '')
  } else {
    l.push('| | |', '|---|---|')
    l.push(`| Comptes | **${nb(u.comptes)}**${ecart(u.comptes, ilYa7j?.comptes)} — ${nb(u.eleves)} élèves, ${nb(u.profs)} professeurs |`)
    l.push(`| Nouveaux comptes | ${nb(u.nouveaux_7j)} cette semaine · ${nb(u.nouveaux_30j)} en 30 jours |`)
    l.push(`| Comptes actifs | ${nb(u.actifs_1j)} en 24 h · ${nb(u.actifs_7j)} en 7 jours · ${nb(u.actifs_30j)} en 30 jours |`)
    l.push(`| Élèves par niveau | ${repartition(u.niveaux, (k) => NIVEAUX[k] || k)} |`)
    l.push(`| Élèves par spécialité | ${repartition(u.specialites, nomMatiere)} |`)
    l.push(`| Classes | ${nb(u.classes)} classes de professeurs · ${nb(u.eleves_en_classe)} élèves inscrits |`)
    l.push(`| Quiz de classe | ${nb(u.quiz_de_classe)} · sessions en direct : ${nb(u.sessions_live)} |`)
    l.push(`| Amis | ${nb(u.joueurs_amis)} joueurs · ${nb(u.defis_amis)} défis (${nb(u.defis_amis_7j)} cette semaine) |`)
    l.push(`| Suivi des parents | ${nb(u.suivis_parents)} élèves suivis (${nb(u.suivis_parents_actifs_7j)} actifs cette semaine) |`)
    l.push('')
    l.push("> Un compte est « actif » quand sa progression a été synchronisée. Les élèves qui révisent sans compte ne sont pas comptés : leur progression reste sur leur téléphone.", '')
  }

  l.push('## 📚 Contenu', '')
  l.push('| | |', '|---|---|')
  l.push(`| Matières | ${nb(c.matieres)} (${nb(c.terminale)} en Terminale, ${nb(c.premiere)} en Première) |`)
  l.push(`| Thèmes | ${nb(c.themes)} |`)
  l.push(`| Chapitres de cours | ${nb(c.chapitres)} |`)
  l.push(`| Séries d'exercices | ${nb(c.series)} (${nb(c.questions)} questions) |`)
  l.push(`| Flashcards | ${nb(c.flashcards)} |`)
  l.push('')

  l.push('## ✅ Qualité et mise en ligne', '')
  const tests = process.env.RESULTAT_TESTS
  l.push(`- Tests du contenu et de la logique : ${tests ? `${etatIcone(tests)} ${tests === 'success' ? 'réussis' : 'en échec'}` : '—'}`)
  l.push(`- Dernière CI sur main : ${p.ci ? `${etatIcone(p.ci.etat)} ${dateFr(p.ci.date)}` : '—'}`)
  l.push(`- Dernière mise en ligne réussie : ${p.miseEnLigne ? `${etatIcone(p.miseEnLigne.etat)} ${dateFr(p.miseEnLigne.date)}` : '—'}`)
  l.push(`- Modifications de l'app ces 7 derniers jours : ${nb(p.modifications7j)}`)
  l.push('')

  const recents = histo.slice(-14).reverse()
  if (recents.length > 1) {
    l.push('## 📈 Évolution (14 derniers jours)', '')
    l.push('| Date | Comptes | Actifs 7 j | Nouveaux 7 j | Chapitres | Questions |', '|---|---|---|---|---|---|')
    for (const h of recents) {
      const d = new Date(`${h.date}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      l.push(`| ${d} | ${nb(h.comptes)} | ${nb(h.actifs_7j)} | ${nb(h.nouveaux_7j)} | ${nb(h.chapitres)} | ${nb(h.questions)} |`)
    }
    l.push('')
  }
  return l.join('\n')
}

// ---- Programme ----
const [c, u, p] = await Promise.all([contenu(), utilisation(), publication()])
mkdirSync(DOSSIER, { recursive: true })
let histo = []
try { if (existsSync(HISTORIQUE)) histo = JSON.parse(readFileSync(HISTORIQUE, 'utf8')) } catch { histo = [] }
const entree = {
  date: jour,
  comptes: u.comptes ?? null, eleves: u.eleves ?? null, profs: u.profs ?? null,
  actifs_7j: u.actifs_7j ?? null, nouveaux_7j: u.nouveaux_7j ?? null,
  themes: c.themes, chapitres: c.chapitres, questions: c.questions, flashcards: c.flashcards,
}
histo = [...histo.filter((h) => h.date !== jour), entree].slice(-400)
writeFileSync(HISTORIQUE, JSON.stringify(histo, null, 1) + '\n')
writeFileSync(resolve(DOSSIER, 'STATISTIQUES.md'), rediger(u, c, p, histo) + '\n')
console.log(`Statistiques du ${jour} écrites dans statistiques/`)
