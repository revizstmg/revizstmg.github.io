// Parcours personnalisé : objectifs + test de positionnement → plan semaine par semaine.
// Tout est calculé ici, en local, à partir de ce que l'élève a déjà fait : rien n'est figé,
// le plan se recalcule à chaque résultat. Aucune IA, aucun coût, aucune donnée envoyée.
import { realThemes, buildThemeExam, THEME_INDEX } from './study.js'
import { ALL_CHAPTERS, themeChapters, shuffle } from './index.js'
import { chapterScore } from '../store.jsx'
import { addDays, daysBetween, defaultBacDate } from './srs.js'
import { epreuvesAVenir } from './epreuves.js'

export const NOTE_MIN = 8
export const NOTE_MAX = 18
export const HEURES = [1, 2, 3, 4, 5, 6, 8, 10]
export const OBJECTIFS_DEFAUT = { noteVisee: 12, heuresSemaine: 4, difficiles: [] }
export const QUESTIONS_POSITIONNEMENT = 6

const MIN_DECOUVERTE = 18 // minutes par chapitre jamais abordé (cours + premiers exercices)
const MIN_CONSOLIDER = 10 // minutes par chapitre pour combler un écart de 20 points
const MIN_RAPPEL = 8 // minutes de rappel par thème avant l'épreuve
const SEMAINES_RAPPEL = 2 // le rappel se place dans les deux dernières semaines
const SEMAINES_MAX = 60
const PRIOR_INCONNU = 35 // maîtrise supposée d'un thème sans aucune donnée

// Note visée → maîtrise à atteindre (0-100) : 8 → 50, 12 → 67, 16 → 84, 18 → 92.
export const cibleMaitrise = (note) => Math.round(Math.min(95, Math.max(45, 50 + (Number(note) - NOTE_MIN) * 4.2)))

export const objectifsValides = (o) => !!o && Number.isFinite(Number(o.noteVisee)) && Number(o.heuresSemaine) > 0

// Épreuve qui échoit à chaque matière (calendrier officiel, content/commun/epreuves.json).
// Les matières en contrôle continu n'ont pas d'épreuve finale : leur échéance est la fin des écrits.
const EPREUVE_DE = {
  philosophie: 'philo',
  droit: 'specialites', economie: 'specialites', management: 'specialites',
  'gestion-finance': 'specialites', mercatique: 'specialites', 'rh-communication': 'specialites', sig: 'specialites',
  'p1-francais': 'francais-ecrit', 'p1-maths': 'maths-anticipee',
}

// Échéance de chaque matière : la date choisie par l'élève (compte à rebours) l'emporte sinon l'épreuve de la matière.
export function echeances(level, state, today) {
  const dates = epreuvesAVenir(level, today).filter((e) => e.debut)
  // Contrôle continu : la fin des épreuves écrites (le Grand Oral se passe après, sans cours à réviser).
  const derniere = dates.filter((e) => !/oral/.test(e.id)).map((e) => e.fin || e.debut).sort().pop() || null
  const perso = state?.bacDate && state.bacDate >= today ? state.bacDate : null
  const parDefaut = derniere || defaultBacDate(new Date(`${today}T12:00:00`))
  return (subjectId) => perso || dates.find((e) => e.id === EPREUVE_DE[subjectId])?.debut || parDefaut
}

// Lundi de la semaine de `jour`.
export function lundiDe(jour) {
  const d = new Date(`${jour}T12:00:00Z`)
  return addDays(jour, -((d.getUTCDay() + 6) % 7))
}

// --- Maîtrise estimée d'un thème -------------------------------------------------------------
// Le test de positionnement donne le point de départ ; ce que l'élève fait ensuite pèse de plus en
// plus (jusqu'à 80 %) ; un thème dont la révision est en retard perd jusqu'à 30 % de sa valeur.
export function maitriseTheme(state, theme, today, positionnement = state?.parcours?.positionnement) {
  const pos = positionnement?.[theme.subjectId]
  const mesure = pos?.themes?.[theme.themeId]
  const priorTheme = mesure && mesure.total > 0 ? (100 * mesure.ok) / mesure.total : null
  const priorMatiere = Number.isFinite(pos?.score) ? pos.score * 0.9 : null
  const prior = priorTheme ?? priorMatiere ?? PRIOR_INCONNU
  const rec = state?.chapters?.[theme.themeId]
  const jeux = Object.keys(rec?.games || {}).length
  const pratique = !!(rec && (rec.quiz > 0 || jeux > 0))
  const obs = pratique ? chapterScore(state, theme.themeId) : null
  const poids = pratique ? Math.min(0.8, 0.35 + jeux * 0.05) : 0
  let m = prior * (1 - poids) + (obs ?? 0) * poids
  const s = state?.srs?.[theme.themeId]
  if (pratique && s?.due && s.due < today) m *= Math.max(0.7, 1 - 0.01 * daysBetween(s.due, today))
  return { maitrise: Math.round(Math.max(0, Math.min(100, m))), pratique, mesure: priorTheme != null, jeux }
}

// --- Test de positionnement ------------------------------------------------------------------
// Une question par thème, tirée au hasard, en parcourant les thèmes de la matière à tour de rôle.
export function composerPositionnement(subjectId, n = QUESTIONS_POSITIONNEMENT) {
  const themes = shuffle(Object.values(THEME_INDEX).filter((t) => t.subjectId === subjectId && ALL_CHAPTERS[t.themeId]))
  const out = []
  for (let tour = 0; out.length < n && tour < 3 && themes.length; tour++) {
    for (const t of themes) {
      if (out.length >= n) break
      const q = buildThemeExam(t.themeId, tour + 1)[tour]
      if (q && !out.some((x) => x.q === q.q)) out.push({ ...q, themeId: t.themeId })
    }
  }
  return out
}

// Résultat d'un test : score de la matière et réussite par thème (reussies/ratees portent leur themeId).
export function resultatPositionnement({ reussies = [], ratees = [] }, today) {
  const themes = {}
  for (const [ok, qs] of [[1, reussies], [0, ratees]]) {
    for (const q of qs) {
      if (!q.themeId) continue
      themes[q.themeId] ||= { ok: 0, total: 0 }
      themes[q.themeId].total++
      themes[q.themeId].ok += ok
    }
  }
  const total = reussies.length + ratees.length
  return { date: today, score: total ? Math.round((100 * reussies.length) / total) : 0, themes }
}

// --- Plan semaine par semaine ----------------------------------------------------------------
const ORDRE = { decouvrir: 0, consolider: 1, rappel: 2 }
const CHAPITRES_PAR_SEANCE = 2 // une séance de découverte couvre deux chapitres (environ 36 minutes)
const MINUTES_CONSOLIDATION = 30 // une séance de consolidation
const MINUTES_MAX_LIGNE = 90 // au-delà, une même tâche s'affiche sur deux lignes

// Les besoins d'un thème, découpés en séances courtes : l'élève voit « chapitres 3 à 4 », pas « 3 h 18 ».
function seancesDuTheme(theme, ctx) {
  const { state, today, cible, difficiles } = ctx
  const { maitrise, pratique, mesure } = maitriseTheme(state, theme, today)
  const nb = Math.max(1, theme.chapitres)
  const ecart = Math.max(0, cible - maitrise)
  const echeance = ctx.echeance(theme.subjectId)
  const dur = difficiles.has(theme.subjectId)
  const facteur = dur ? 1.3 : 1
  const prio = ecart + (dur ? 10 : 0) + (pratique ? 0 : 5)
  const base = { themeId: theme.themeId, subjectId: theme.subjectId, subjectName: theme.subjectName, themeName: theme.themeName, color: theme.color, chapitresTotal: nb, echeance, prio }
  const estime = !pratique && !mesure // niveau supposé : pas encore mesuré
  const principal = []
  if (!pratique) {
    const total = Math.round(nb * MIN_DECOUVERTE * facteur)
    for (let k = 0; k < nb; k += CHAPITRES_PAR_SEANCE) {
      const a = Math.min(nb, k + CHAPITRES_PAR_SEANCE)
      principal.push({ ...base, kind: 'decouvrir', chapitres: { de: k + 1, a }, minutes: Math.max(5, Math.round((total * (a - k)) / nb)), pourquoi: { cle: 'nouveau' } })
    }
  }
  if (ecart >= 5) {
    const total = Math.max(10, Math.round(nb * MIN_CONSOLIDER * (ecart / 20) * facteur))
    const n = Math.max(1, Math.ceil(total / MINUTES_CONSOLIDATION))
    for (let k = 0; k < n; k++) principal.push({ ...base, kind: 'consolider', minutes: Math.max(5, Math.round(total / n)), pourquoi: { cle: 'ecart', maitrise, cible, estime } })
  }
  const rappel = { ...base, kind: 'rappel', minutes: MIN_RAPPEL, pourquoi: { cle: 'rappel', maitrise, estime } }
  return { principal, rappel, prio }
}

// Lundis des semaines du plan : de la semaine en cours à celle de l'échéance la plus lointaine.
function semainesDuPlan(today, echeances) {
  const lundi0 = lundiDe(today)
  const derniere = [...echeances].sort().pop() || today
  const nb = Math.min(SEMAINES_MAX, Math.max(1, Math.floor(daysBetween(lundi0, derniere) / 7) + 1))
  return Array.from({ length: nb }, (_, i) => addDays(lundi0, i * 7))
}

// Réunit, dans une semaine, les séances voisines d'un même thème (« chapitres 1 à 4 », « 1 h 30 »).
function regrouper(taches, i) {
  const out = []
  for (const t of taches) {
    const memeTheme = out.findLast((x) => x.themeId === t.themeId && x.kind === t.kind && x.minutes + t.minutes <= MINUTES_MAX_LIGNE)
    if (memeTheme) {
      memeTheme.minutes += t.minutes
      if (t.chapitres) memeTheme.chapitres = { de: Math.min(memeTheme.chapitres.de, t.chapitres.de), a: Math.max(memeTheme.chapitres.a, t.chapitres.a) }
    } else out.push({ ...t, chapitres: t.chapitres ? { ...t.chapitres } : undefined })
  }
  return out.map((t, k) => ({ ...t, id: `${t.themeId}:${t.kind}:${i}:${k}` }))
}

/**
 * Plan complet. `themes` : [{ themeId, subjectId, subjectName, themeName, color, chapitres }].
 * Chaque semaine alterne les matières, en servant d'abord celle qui a le plus de travail par semaine restante
 * avant son épreuve ; chaque thème garde l'ordre découvrir → consolider, et le rappel n'arrive qu'à la fin.
 * Renvoie { semaines, faisable, minutesTotal, minutesPlacees, manque, heuresConseillees, cible, jours }.
 */
export function construirePlan({ state, track, today, themes }) {
  const o = { ...OBJECTIFS_DEFAUT, ...(state?.parcours?.objectifs || {}) }
  const cible = cibleMaitrise(o.noteVisee)
  const echeance = echeances(track?.level, state, today)
  const ctx = { state, today, cible, difficiles: new Set(o.difficiles || []), echeance }
  const parMatiere = new Map()
  for (const t of themes) {
    const { principal, rappel, prio } = seancesDuTheme(t, ctx)
    if (!parMatiere.has(t.subjectId)) parMatiere.set(t.subjectId, { id: t.subjectId, echeance: echeance(t.subjectId), themes: [], rappels: [] })
    const m = parMatiere.get(t.subjectId)
    m.themes.push({ prio, principal })
    m.rappels.push(rappel)
  }
  for (const m of parMatiere.values()) {
    m.file = m.themes.sort((a, b) => b.prio - a.prio).flatMap((x) => x.principal.sort((a, b) => ORDRE[a.kind] - ORDRE[b.kind]))
    m.rappels.sort((a, b) => b.prio - a.prio)
  }
  const matieres = [...parMatiere.values()]
  const lundis = semainesDuPlan(today, matieres.map((m) => m.echeance))
  // Capacité : la semaine en cours n'a plus que ses jours restants.
  const joursRestants = 7 - daysBetween(lundis[0], today)
  const capaciteSemaine = o.heuresSemaine * 60
  const semaines = lundis.map((debut, i) => ({
    index: i, debut, fin: addDays(debut, 6),
    capacite: i === 0 ? Math.max(15, Math.round((capaciteSemaine * joursRestants) / 7)) : capaciteSemaine,
    minutes: 0, taches: [],
  }))
  const indexEcheance = (date) => Math.max(0, Math.floor(daysBetween(lundis[0], date) / 7))
  for (const m of matieres) m.dernier = Math.min(semaines.length - 1, Math.max(0, indexEcheance(m.echeance) - 1))
  const restant = (m) => m.file.reduce((n, t) => n + t.minutes, 0) + m.rappels.reduce((n, t) => n + t.minutes, 0)
  const minutesTotal = matieres.reduce((n, m) => n + restant(m), 0)

  semaines.forEach((s, i) => {
    const places = []
    for (;;) {
      // Matières encore à servir cette semaine, la plus pressée d'abord.
      const candidates = matieres
        .filter((m) => i <= m.dernier && (m.file.length || (m.rappels.length && i >= m.dernier - (SEMAINES_RAPPEL - 1))))
        .map((m) => ({ m, urgence: restant(m) / (m.dernier - i + 1) }))
        .sort((a, b) => b.urgence - a.urgence)
      let place = false
      for (const { m } of candidates) {
        // Le rappel ne passe qu'une fois le travail de fond fait, ou dans la toute dernière semaine.
        const rappelPossible = m.rappels.length && i >= m.dernier - (SEMAINES_RAPPEL - 1) && (!m.file.length || i === m.dernier)
        const seance = rappelPossible ? m.rappels[0] : m.file[0]
        if (!seance || s.capacite - s.minutes < seance.minutes) continue
        s.minutes += seance.minutes
        places.push(seance)
        if (rappelPossible) m.rappels.shift(); else m.file.shift()
        place = true
      }
      if (!place) break
    }
    s.taches = regrouper(places, i)
  })

  const manque = matieres.reduce((n, m) => n + restant(m), 0)
  const semainesUtiles = Math.max(1, semaines.length - 1)
  const heuresConseillees = manque > 0 ? Math.min(20, Math.ceil(((minutesTotal / semainesUtiles) / 60) * 2) / 2) : o.heuresSemaine
  return {
    semaines, cible, minutesTotal, minutesPlacees: minutesTotal - manque, manque,
    faisable: manque === 0, heuresConseillees,
    jours: Math.max(0, daysBetween(today, matieres.map((m) => m.echeance).sort()[0] || today)),
  }
}

// Thèmes du parcours pour la filière : tous les thèmes réels, avec leur nombre de chapitres.
export function themesDuParcours(track) {
  return realThemes(track)
    .filter((t) => ALL_CHAPTERS[t.themeId]?.cours)
    .map((t) => ({ themeId: t.themeId, subjectId: t.subjectId, subjectName: t.subjectName, themeName: t.themeName, color: t.color, chapitres: themeChapters(ALL_CHAPTERS[t.themeId]).length }))
}

// Matières proposées pour le positionnement et les « matières difficiles ».
export function matieresDuParcours(track) {
  const vues = new Map()
  for (const t of themesDuParcours(track)) if (!vues.has(t.subjectId)) vues.set(t.subjectId, { id: t.subjectId, nom: t.subjectName, color: t.color, themes: 0 })
  for (const t of themesDuParcours(track)) vues.get(t.subjectId).themes++
  return [...vues.values()]
}

// Avancement de la semaine : `base` = minutes prévues quand la semaine a commencé, `reste` = ce qu'il en reste aujourd'hui.
export function avancementSemaine(parcours, semaineCourante, today) {
  const lundi = lundiDe(today)
  const base = parcours?.semaine?.debut === lundi ? parcours.semaine.minutes : semaineCourante.minutes
  const prevu = Math.max(base, semaineCourante.minutes)
  return { prevu, reste: semaineCourante.minutes, fait: Math.max(0, prevu - semaineCourante.minutes), pct: prevu ? Math.round((100 * Math.max(0, prevu - semaineCourante.minutes)) / prevu) : 100 }
}
