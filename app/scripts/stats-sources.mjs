// Sources des statistiques de RévizSTMG, partagées par le fichier du matin
// (statistiques.mjs) et le rapport envoyé par mail (rapport-mail.mjs) :
// - le contenu de l'app (matières, thèmes, chapitres, exercices, flashcards) ;
// - Supabase : des comptages déjà agrégés par la fonction revizstmg_statistiques()
//   (aucun nom, aucune adresse ne sort de la base) ;
// - GitHub : dernière CI sur main, dernière mise en ligne, activité de la semaine.
// À lancer avec vite-node, qui importe le contenu comme le fait Vite.
import * as C from '../src/data/index.js'
import { SUPA_URL, SUPA_ANON } from '../src/supabase.js'
import { avecGraine } from '../tests/outils.js'

export const DEPOT = 'revizstmg/revizstmg.github.io'
export const SUBJECTS = C.SUBJECTS

// ---- Contenu ----
// Nombre de questions d'une série d'exercices, selon son type.
function questions(jeu) {
  for (const cle of ['questions', 'pairs', 'items', 'cases', 'steps']) {
    if (Array.isArray(jeu[cle])) return cle === 'steps' ? 1 : jeu[cle].length
  }
  return 1 // exercices tirés à la volée (calculs, conjugaison…)
}

export async function contenu() {
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
      // Hasard fixé par thème, comme dans les tests : le total ne bouge que
      // si le contenu change.
      for (const ch of avecGraine(t.id, () => C.themeChapters(theme))) {
        c.chapitres++
        c.series += ch.games.length
        c.questions += ch.games.reduce((a, j) => a + questions(j), 0)
      }
      c.flashcards += avecGraine(t.id, () => C.deckForTheme(t.id))?.cards?.length || 0
    }
  }
  return c
}

// ---- Utilisation (Supabase) ----
export async function utilisation() {
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

export async function publication(maintenant = new Date()) {
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
