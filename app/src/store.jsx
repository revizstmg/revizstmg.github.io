import { vacancesSummary } from './data/vacancesState.js'
import { updateMission, missionStatus, MISSION_STAGES, MISSION_PASS } from './data/missionProgress.js'
import { updateSuccesses } from './data/revisionPaths.js'
import { normalizeStudyLanguages } from './data/studyLanguages.js'
import { studySeconds, activeSeconds, repairStudyTime } from './data/studyTime.js'
import { SHOP_LEVELS, purchaseItem, equipItem, collectReward, walletRevision } from './data/shop.js'
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { SUBJECTS, ALL_CHAPTERS, chapitreDuJeu, exercicesParChapitre, EXERCICES_POUR_MAITRISER } from './data/index.js'
import { BADGES, badgesForTrack } from './badges.js'
import { envoyerProgression, isSignedIn, refreshSession, fetchProfile, getSession, signOut } from './auth.js'
import { srsUpdate, todayKey, daysBetween, addDays } from './data/srs.js'
import { dailyRewardFor } from './data/rewards.js'
import { subjectsForTrack, trackLabel } from './data/tracks.js'
import { publishChildStats, deleteMyChildStats, PARENT_READY } from './parent.js'
import { desactiverRappelsPush } from './push.js'
import { ajouterNote } from './notesClasse.js'
import { oublierTraductions } from './translate.js'
import { CARNET_MAX, mergeProgress, grandOralVide, etudeGestionVide, noter, chargeUtile, empreinte, aSauvegarder, versionDe, avecVersionServeur, apresEnvoi, detacherEssai } from './progression.js'

export { CARNET_MAX, mergeProgress, grandOralVide, etudeGestionVide }

// Modes transverses qui touchent plein de thèmes d'un coup (bac blanc, coach IA,
// défi, express) : ils enregistrent un score mais NE marquent PAS un thème comme
// « travaillé », sinon « À réviser » se remplit de thèmes jamais étudiés.
export const CROSS_GAMES = new Set(['exam', 'coach-ia', 'daily', 'express', 'sujet-bac', 'revision-acquis'])

// Carnet d'erreurs, révisé question par question (répétition espacée par notion) :
// - une question ratée y entre (ou y revient) en boîte 0, à revoir le lendemain ;
// - réussie le jour où elle est due (ou après), elle monte d'une boîte : revue
//   3 jours plus tard, puis 7 ; à la troisième réussite espacée, elle sort ;
// - réussie avant son jour, elle ne bouge pas : refaire ses erreurs juste
//   après une série entraîne, mais ne vide pas le carnet.
// Tous les modes l'alimentent (exercices, test du thème, bac blanc, défi,
// coach, sujets) ; une question garde son thème (q.themeId) quand le mode en
// mélange plusieurs. La clé repose sur le type d'exercice et l'énoncé, pour
// retrouver la même question d'un exercice à l'autre.
export const CARNET_INTERVALLES = [1, 3, 7]
export function cleErreur(type, q) {
  return `${type}|${String(q?.q || q?.text || q?.statement || q?.prompt || '').slice(0, 200)}`
}
export function majCarnet(erreurs, { themeId, type, ratees = [], reussies = [] }, jour) {
  const parId = new Map((erreurs || []).map((e) => [e.id, e]))
  for (const q of reussies) {
    const id = cleErreur(type, q)
    const e = parId.get(id)
    if (!e || (e.due && e.due > jour)) continue
    const boite = (e.boite || 0) + 1
    if (boite >= CARNET_INTERVALLES.length) parId.delete(id)
    else parId.set(id, { ...e, boite, le: jour, due: addDays(jour, CARNET_INTERVALLES[boite]) })
  }
  const nouvelles = []
  for (const q of ratees) {
    const tid = q?.themeId || themeId
    if (!tid) continue
    const id = cleErreur(type, q)
    parId.delete(id)
    nouvelles.push({ id, themeId: tid, type, q, le: jour, boite: 0, due: addDays(jour, CARNET_INTERVALLES[0]) })
  }
  return [...nouvelles, ...parId.values()].slice(0, CARNET_MAX)
}
// Erreurs à revoir ce jour-là (les plus anciennes d'abord).
export function erreursDues(erreurs, jour) {
  return (erreurs || []).filter((e) => !e.due || e.due <= jour).sort((a, b) => (a.due || '').localeCompare(b.due || ''))
}

// ---------------------------------------------------------------------------
// Sauvegarde locale (localStorage). La progression de l'élève est conservée
// entre les sessions sur son appareil, mais un compte est désormais requis
// pour accéder au site. Structure versionnée pour évoluer sans casser.
// ---------------------------------------------------------------------------
const KEY = 'stmg_progress_v2'
// Copie de secours de la progression (au plus une par minute) : si la copie
// principale est abîmée, on repart de celle-ci au lieu de tout remettre à zéro.
// La copie abîmée est gardée à part, pour pouvoir la récupérer à la main.
const KEY_SECOURS = 'stmg_progress_v2_secours'
const KEY_ABIME = 'stmg_progress_v2_abime'

// Remise à zéro (v2) : on efface l'ancienne progression locale et la session
// pour forcer chaque utilisateur à (re)créer un compte. Effectué une seule fois
// par appareil grâce au marqueur `stmg_reset_v2`.
;(function resetForV2() {
  try {
    if (localStorage.getItem('stmg_reset_v2')) return
    localStorage.removeItem('stmg_progress_v1')
    localStorage.removeItem('stmg_session')
    localStorage.setItem('stmg_reset_v2', '1')
  } catch {
    /* navigation privée / quota : on ignore */
  }
})()

const emptyState = () => ({
  missions: {}, // étapes de chapitre validées, réussites autonomes et espacées
  xp: 0,
  streak: { count: 0, last: null },
  badges: [], // ids de badges obtenus
  chapters: {}, // { [chapterId]: { games: { [gameId]: pct }, quiz: pct } }
  favorites: [], // ids de chapitres marqués « à revoir »
  lastChapter: null, // { subjectId, chapterId }
  studyLanguages: null, // langues étudiées (pas la langue de l’interface)
  track: null, // { level, specialty } — filière choisie à l'entrée
  profile: null, // { firstName, lastName } — fiche d'information (accueil personnalisé)
  onboarded: false, // a vu l'étape « Que veux-tu travailler ? » (choix des chapitres)
  theme: null, // 'light' | 'dark' | null (= système)
  customTheme: null, // { bg, ink, accent, card } — couleurs personnalisées (null = charte par défaut)
  lang: 'fr', // langue de l'interface : 'fr' | 'en' | 'es'
  totalAnswers: 0,
  correctAnswers: 0,
  weekly: { week: null, done: [] }, // cours travaillés durant la semaine ISO en cours
  classCode: '', // code de la classe active (partagé pour classement / espace)
  account: null, // { id, email, role } quand connecté (compte prof/élève)
  teacherClasses: [], // [{ code, label }] — classes générées par le prof
  srs: {}, // répétition espacée : { [themeId]: { interval, ease, reps, last, due, score } }
  bacDate: null, // date du bac (programme de révision)
  a11y: { dys: false, contrast: false, big: false }, // accessibilité (local)
  reminder: { on: false, time: '18:00' }, // rappel de révision (local)
  parentShare: false, // partage volontaire de la progression avec les parents (local)
  grandOral: grandOralVide(), // Grand Oral : questions, sources, analyse, arguments (sauvegardé sur le compte)
  reussites: [],
  erreurs: [], // carnet d'erreurs : questions ratées à refaire
  etudeGestion: etudeGestionVide(), // étude de gestion (Première) : projet, sources, arguments
  examSeen: {}, // bac blanc : { [sélection]: [clés d'énoncés déjà tombés] } (local)
  shopWalletUpdatedAt: 0,
  shopRewards: {}, // récompenses uniques ; offres futures réservées, jamais activées ici
  coins: 0, // pièces 🪙 dépensables en boutique (gagnées avec l'XP)
  owned: [], // ids d'articles cosmétiques achetés (boutique)
  freezes: 0, // gels de série disponibles (protègent la série un jour manqué)
  tabs: null, // onglets choisis pour la barre du bas (null = par défaut)
  history: {}, // { 'YYYY-MM-DD': xpCumulé } — courbe de progression (120 j max)
  themeTime: {}, // { [themeId]: secondes } — temps de révision par thème
  savedDecks: [], // paquets de flashcards téléchargés (app) : { id, title, subjectId, themeId, cards, savedAt }
  dailyChallenge: { last: null, streak: 0, best: 0, lastBonus: 0 }, // défi du jour (série + récompense)
  notes: {}, // { [themeId]: texte } — notes personnelles de l'élève par thème
  fiches: [], // fiches de révision créées depuis une photo : { id, title, createdAt, source, sections }
  notesClasse: [], // notes reçues en classe (privées) : { id, note, matiere, chapitre, date, ajouteLe }
  parcours: null, // parcours personnalisé : { objectifs, positionnement, semaine, maj }
})

// Suppression du compte : tout ce que l'application garde dans ce navigateur
// (progression, session, codes ami et parent, préférences, traductions…) est
// effacé. Le site ne sert que RévizSTMG : on vide tout son stockage.
export function effacerDonneesAppareil() {
  for (const stockage of ['localStorage', 'sessionStorage']) {
    try { globalThis[stockage]?.clear() } catch { /* stockage indisponible */ }
  }
}

// Objectif hebdomadaire : nombre de chapitres distincts à travailler dans la
// semaine, et récompense (XP + pièces) à réclamer une fois atteint.
export const WEEKLY_GOAL = 5
export const WEEKLY_REWARD = 60

// Clé de semaine ISO (ex. « 2026-W36 ») pour le suivi / classement hebdomadaire.
export function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

// La progression de l'état appartient au compte ouvert sur cet appareil.
const compteActif = (s) => !!s?.account?.id && s.account.id === getSession()?.user?.id

// Seules les préférences d'affichage passent d'un compte à l'autre.
function withoutAccount(s) {
  const out = emptyState()
  for (const key of ['lang', 'theme', 'customTheme', 'a11y', 'tabs']) out[key] = s[key]
  if (out.customTheme) {
    out.customTheme = { ...out.customTheme }
    for (const key of ['avatar', 'title', 'banner']) delete out.customTheme[key]
  }
  return out
}

// L'élève a-t-il déjà fait quelque chose (essai sans compte) ?
const aProgresse = (s) => (s?.xp || 0) > 0 || Object.keys(s?.chapters || {}).length > 0 || (s?.favorites || []).length > 0
  || Object.keys(s?.notes || {}).length > 0 || (s?.notesClasse || []).length > 0 || (s?.fiches || []).length > 0 || !!s?.parcours?.maj

export function restoreAccountState(previous, profile, session) {
  const id = session?.user?.id
  if (!id || !profile || (profile.id && profile.id !== id)) throw new Error('Profil du compte indisponible. Réessaie de te connecter.')
  // Même compte : sa copie locale. Essai sans compte (aucun compte sur
  // l'appareil) : sa progression rejoint le compte, comme promis à l'élève.
  // Autre compte : rien n'est repris.
  const base = previous.account?.id === id ? previous
    : !previous.account?.id && aProgresse(previous) ? { ...detacherEssai(previous), classCode: '', teacherClasses: [] }
    : withoutAccount(previous)
  const parts = String(profile.name || 'Élève').trim().split(/\s+/)
  const role = profile.role === 'prof' ? 'prof' : 'eleve'
  return {
    ...avecVersionServeur(mergeProgress(base, profile.progress), versionDe(profile.progress)),
    account: { id, email: session.user.email, role },
    profile: { firstName: parts[0], lastName: parts.slice(1).join(' '), photo: profile.photo || undefined },
    track: profile.level ? { level: profile.level, specialty: profile.specialty || null } : base.track,
    onboarded: true,
    classCode: profile.class_code || '',
    teacherClasses: role === 'prof' ? base.teacherClasses : [],
  }
}

function lireCopie(cle) {
  const raw = localStorage.getItem(cle)
  if (!raw) return null
  const valeur = JSON.parse(raw)
  if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) throw new Error('Progression illisible')
  return valeur
}

function load() {
  let copie = null
  try {
    copie = lireCopie(KEY)
  } catch {
    try { localStorage.setItem(KEY_ABIME, localStorage.getItem(KEY) || '') } catch { /* stockage plein */ }
    try { copie = lireCopie(KEY_SECOURS) } catch { copie = null }
  }
  if (!copie) return emptyState()
  const saved = repairStudyTime({ ...emptyState(), ...copie })
  const id = getSession()?.user?.id
  return id && saved.account?.id && id !== saved.account.id ? withoutAccount(saved) : saved
}

// Écrit la progression sur l'appareil. Si le stockage est plein, on libère
// d'abord les traductions mémorisées, puis on réessaie. Renvoie false si la
// progression n'a pas pu être écrite.
let dernierSecours = 0
function ecrireProgression(state) {
  const texte = JSON.stringify(state)
  const ecrire = () => {
    localStorage.setItem(KEY, texte)
    if (Date.now() - dernierSecours > 60000) {
      try { localStorage.setItem(KEY_SECOURS, texte); dernierSecours = Date.now() } catch { /* secours facultatif */ }
    }
  }
  try { ecrire(); return true } catch { /* stockage plein ou indisponible */ }
  oublierTraductions()
  try { localStorage.removeItem(KEY_SECOURS); ecrire(); return true } catch { return false }
}

// Niveaux : paliers d'XP cumulés.
const LEVELS = SHOP_LEVELS
export function levelFromXp(xp) {
  let lvl = 1
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lvl = i + 1
  const curFloor = LEVELS[lvl - 1] ?? 0
  const nextFloor = LEVELS[lvl] ?? curFloor + 1200
  return {
    level: lvl,
    into: xp - curFloor,
    span: nextFloor - curFloor,
    pct: Math.min(100, Math.round(((xp - curFloor) / (nextFloor - curFloor)) * 100)),
    next: nextFloor,
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setRaw] = useState(load)
  // Toute modification faite par l'élève passe par setState : on y note ce qui
  // change, pour la fusion entre appareils (progression.js). Les fusions avec le
  // compte, la déconnexion et la remise à zéro passent par setRaw.
  const setState = useCallback((maj) => setRaw((prev) => noter(prev, typeof maj === 'function' ? maj(prev) : maj)), [])
  const [newBadges, setNewBadges] = useState([]) // badges à célébrer
  const [dailyReward, setDailyReward] = useState(null) // récompense de connexion à célébrer

  // Persistance à chaque changement. Si l'appareil refuse (stockage plein), un
  // bandeau prévient l'élève (EtatSauvegarde.jsx) au lieu de perdre en silence.
  const [stockagePlein, setStockagePlein] = useState(false)
  useEffect(() => {
    setStockagePlein(!ecrireProgression(state))
  }, [state])

  // Application du thème sur <html>.
  useEffect(() => {
    const root = document.documentElement
    const prefersDark =
      state.theme === 'dark' ||
      (state.theme == null && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', !!prefersDark)
  }, [state.theme])

  // Langue de l'interface + sens de lecture (arabe = droite à gauche).
  useEffect(() => {
    const root = document.documentElement
    root.lang = state.lang || 'fr'
    root.dir = state.lang === 'ar' ? 'rtl' : 'ltr'
  }, [state.lang])

  // Apparence personnalisée : on pose (ou retire) les variables CSS sur <html>
  // (couleurs, polices, arrondi, taille du texte). `avatar` n'est pas une
  // variable CSS (géré dans les composants), on l'ignore ici.
  useEffect(() => {
    const root = document.documentElement
    const map = {
      bg: '--c-bg', ink: '--c-ink', accent: '--c-accent', card: '--c-card',
      fontDisplay: '--font-display', fontBody: '--font-body', radius: '--radius', scale: '--scale',
    }
    for (const k of Object.keys(map)) {
      const v = state.customTheme?.[k]
      if (v) root.style.setProperty(map[k], v)
      else root.style.removeProperty(map[k])
    }
  }, [state.customTheme])

  // Accessibilité : classes sur <html> (dyslexie, fort contraste, grand texte).
  useEffect(() => {
    const root = document.documentElement
    const a = state.a11y || {}
    root.classList.toggle('a11y-dys', !!a.dys)
    root.classList.toggle('a11y-contrast', !!a.contrast)
    root.classList.toggle('a11y-big', !!a.big)
  }, [state.a11y])

  // Espace parent : l'élève publie un instantané de ses stats (temps, série,
  // XP, matières, badges…) sous son « code parent ». Anti-rebond ~3 s, silencieux
  // et facultatif — c'est ce que le parent relié consulte en lecture seule.
  // Rien n'est publié tant que l'élève n'a pas activé le partage (Mon espace).
  useEffect(() => {
    if (!PARENT_READY || !state.track || !state.parentShare || !isSignedIn()) return
    const id = setTimeout(() => { publishChildStats(buildChildSnapshot(state, deriveAll(state))).catch(() => {}) }, 3000)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.track, state.parentShare, state.xp, state.streak, state.chapters, state.themeTime, state.weekly, state.badges, state.bacDate, state.profile, state.parcours])

  // Partage désactivé : on efface l'instantané déjà publié par cet appareil (une
  // fois ; le marqueur évite de le redemander à chaque ouverture).
  useEffect(() => {
    if (!PARENT_READY || !state.track || state.parentShare || !isSignedIn()) return
    try { if (localStorage.getItem('stmg_parent_efface')) return } catch { return }
    deleteMyChildStats().then((ok) => { try { if (ok) localStorage.setItem('stmg_parent_efface', '1') } catch { /* stockage indisponible */ } })
  }, [state.track, state.parentShare])

  const evaluateBadges = useCallback((next) => {
    const derived = deriveAll(next)
    const earned = badgesForTrack(next.track).filter((b) => b.check(next, derived)).map((b) => b.id)
    const fresh = earned.filter((id) => !next.badges.includes(id))
    if (fresh.length) {
      next.badges = [...next.badges, ...fresh]
      setNewBadges((q) => [...q, ...fresh])
    }
    return next
  }, [])

  // Met à jour le streak (jours consécutifs) au moment d'une activité.
  const bumpStreak = (s) => {
    const t = todayKey()
    if (s.streak.last === t) return s.streak
    // Date de l'appareil reculée (fuseau, horloge) : la série et son jour restent intacts.
    if (s.streak.last && daysBetween(s.streak.last, t) < 0) return s.streak
    if (s.streak.last && daysBetween(s.streak.last, t) === 1)
      return { count: s.streak.count + 1, last: t }
    return { count: 1, last: t }
  }

  // Check-in quotidien : à la première ouverture de la journée, on valide un
  // jour de connexion « d'affilée » et on offre la récompense d'XP du jour
  // (croissante + gros bonus aux paliers). Une seule fois par jour.
  const checkIn = useCallback(() => {
    setState((prev) => {
      if (!prev.track) return prev // pas encore de filière : rien à récompenser
      const t = todayKey()
      if (prev.streak?.last === t) return prev // déjà validé aujourd'hui
      const gap = prev.streak?.last ? daysBetween(prev.streak.last, t) : null
      if (gap !== null && gap < 0) return prev // date de l'appareil reculée : ni série perdue ni récompense redonnée
      const next = structuredCloneSafe(prev)
      let count
      let usedFreeze = false
      if (gap === 1) {
        count = (prev.streak.count || 0) + 1
      } else if (gap >= 2 && (prev.freezes || 0) >= gap - 1) {
        // Chaque jour manqué est couvert par un gel de série : on préserve la série
        // et on consomme autant de gels que de jours manqués (tout ou rien).
        count = (prev.streak.count || 0) + 1
        next.freezes = (prev.freezes || 0) - (gap - 1)
        usedFreeze = true
      } else {
        count = 1
      }
      const reward = dailyRewardFor(count)
      next.streak = { count, last: t }
      next.xp += reward.xp
      next.shopWalletUpdatedAt = walletRevision(prev)
      next.coins = (next.coins || 0) + reward.xp // pièces gagnées à la connexion
      setDailyReward({ count, ...reward, usedFreeze })
      return evaluateBadges(next)
    })
  }, [evaluateBadges])
  const clearDailyReward = useCallback(() => setDailyReward(null), [])

  const recordResult = useCallback(
    ({ chapterId, gameId, quiz = false, pct, correct = 0, total = 0, xp = 0 }) => {
      setState((prev) => {
        const next = structuredCloneSafe(prev)
        const ch = (next.chapters[chapterId] ||= { games: {}, quiz: 0 })
        if (quiz) ch.quiz = Math.max(ch.quiz || 0, Math.round(pct))
        else ch.games[gameId] = Math.max(ch.games[gameId] || 0, Math.round(pct))
        // Marque le thème comme réellement travaillé (leçon/jeu/test du thème),
        // hors modes transverses — c'est ce drapeau que « À réviser » consulte.
        if (chapterId && !CROSS_GAMES.has(gameId)) ch.worked = true
        next.xp += Math.round(xp)
        next.shopWalletUpdatedAt = walletRevision(prev)
        next.coins = (next.coins || 0) + Math.round(xp) // pièces gagnées avec l'XP
        next.totalAnswers += total
        next.correctAnswers += correct
        next.streak = bumpStreak(next)
        // Suivi hebdomadaire : chapitres distincts travaillés cette semaine ISO.
        const wk = isoWeekKey()
        if (!next.weekly || next.weekly.week !== wk) next.weekly = { week: wk, done: [] }
        // Un bac blanc, un défi ou le coach touchent beaucoup de thèmes d'un coup :
        // ils ne remplissent pas l'objectif de la semaine.
        if (chapterId && !CROSS_GAMES.has(gameId) && !next.weekly.done.includes(chapterId)) next.weekly.done = [...next.weekly.done, chapterId]
        // Répétition espacée : planifie la prochaine révision de ce thème selon le
        // résultat de CETTE séance. Le score du thème garde le meilleur résultat et
        // ne baisse jamais : avec lui, une révision ratée ne rapprochait pas la
        // suivante, et l'oubli passait inaperçu.
        // Dans un mode transverse, une ou deux questions d'un thème ne suffisent
        // pas à repousser sa révision.
        if (chapterId && (!CROSS_GAMES.has(gameId) || total >= 3)) next.srs = { ...(next.srs || {}), [chapterId]: srsUpdate(next.srs?.[chapterId], pct, todayKey()) }
        return evaluateBadges(next)
      })
    },
    [evaluateBadges],
  )

  const recordMission = useCallback(({themeId, index, stage, pct, assisted = false}) => {
    if (!ALL_CHAPTERS[themeId] || !Number.isInteger(index) || index < 0 || index >= exercicesParChapitre(themeId).length || !Number.isFinite(pct)) return
    setState(prev => {
      const rank = MISSION_STAGES.indexOf(stage)
      const status = missionStatus(prev.missions, themeId, index)
      if (rank < 0 || status.stages.slice(0,rank).some(s=>s.best<MISSION_PASS)) return prev
      return {...prev, missions:updateMission(prev.missions,{themeId,index,stage,pct,assisted,day:todayKey()})}
    })
  }, [])

  const toggleFavorite = useCallback((chapterId) => {
    setState((prev) => {
      const has = prev.favorites.includes(chapterId)
      const next = {
        ...prev,
        favorites: has
          ? prev.favorites.filter((c) => c !== chapterId)
          : [...prev.favorites, chapterId],
      }
      return evaluateBadges(next)
    })
  }, [evaluateBadges])

  const setLastChapter = useCallback((subjectId, chapterId) => {
    setState((prev) => {
      if (prev.lastChapter?.chapterId === chapterId) return prev
      return { ...prev, lastChapter: { subjectId, chapterId } }
    })
  }, [])

  const setTheme = useCallback((theme) => setState((p) => ({ ...p, theme })), [])

  const setStudyLanguages = useCallback((languages) => setState(p => ({ ...p, studyLanguages: normalizeStudyLanguages(languages) })), [])
  const setTrack = useCallback((track) => setState((p) => ({ ...p, track })), [])

  const setProfile = useCallback((profile) => setState((p) => evaluateBadges({ ...p, profile })), [evaluateBadges])

  // Photo de profil (data URL déjà réduite) : fusionnée dans le profil.
  const setPhoto = useCallback((photo) => setState((p) => ({ ...p, profile: { ...(p.profile || {}), photo: photo || undefined } })), [])

  const setLang = useCallback((lang) => setState((p) => ({ ...p, lang })), [])

  const setClassCode = useCallback((classCode) => setState((p) => ({ ...p, classCode: classCode || '' })), [])

  const setAccount = useCallback((account) => setState((p) => ({ ...p, account: account || null })), [])

  // Classes du professeur (codes générés). setClassCode choisit la classe active.
  const setTeacherClasses = useCallback((list) => setState((p) => ({ ...p, teacherClasses: Array.isArray(list) ? list : [] })), [])
  const addTeacherClass = useCallback((cls) => setState((p) => {
    const list = [...(p.teacherClasses || []).filter((c) => c.code !== cls.code), cls]
    return { ...p, teacherClasses: list, classCode: cls.code }
  }), [])

  const latestState = useRef(state)
  latestState.current = state

  // --- Sauvegarde sur le compte ---------------------------------------------
  // Chaque changement de progression part sur le compte ~2 s plus tard. La copie
  // du compte n'est remplacée que si elle n'a pas changé depuis notre dernière
  // lecture ; sinon, on la fusionne d'abord avec celle de l'appareil. Hors ligne
  // ou en cas d'échec, l'élève voit « Non sauvegardé » (EtatSauvegarde.jsx) et
  // l'envoi reprend tout seul. La progression reste de toute façon sur l'appareil.
  const [sauvegarde, setSauvegarde] = useState({ etat: 'ok' })
  const envoi = useRef(null)
  const relance = useRef({ minuteur: null, delai: 0 })

  const envoyer = useCallback(async ({ keepalive = false } = {}) => {
    for (let essai = 0; essai < 3; essai++) {
      const s = latestState.current
      if (!s.account?.id) return 'local'
      const charge = chargeUtile(s)
      const emp = empreinte(charge)
      if (emp === s._sync?.empreinte) return 'ok'
      // Session expirée : il faut se reconnecter (même compte) pour sauvegarder.
      if (!compteActif(s)) return getSession()?.user?.id ? 'local' : 'session'
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'horsLigne'
      const vu = s._sync?.vuServeur ?? null
      const rev = Math.max(Date.now(), (s._sync?.rev || 0) + 1, (vu || 0) + 1)
      charge._sync.rev = rev
      const r = await envoyerProgression(charge, vu, { keepalive })
      if (r.ok) {
        const envoye = (p) => (p.account?.id === s.account.id ? apresEnvoi(p, rev, emp) : p)
        latestState.current = envoye(latestState.current)
        setRaw(envoye)
        return 'ok'
      }
      if (!r.conflit) return r.raison === 'reseau' ? 'horsLigne' : 'erreur'
      // Un autre appareil a écrit entre-temps : on fusionne, puis on renvoie.
      const fusion = (p) => avecVersionServeur(mergeProgress(p, r.conflit), versionDe(r.conflit))
      latestState.current = fusion(latestState.current)
      setRaw((p) => (p.account?.id === s.account.id ? evaluateBadges(fusion(p)) : p))
    }
    return 'erreur'
  }, [evaluateBadges])

  const sauvegarder = useCallback((options) => {
    if (envoi.current) { envoi.current.encore = true; return envoi.current.promesse }
    const tache = { encore: false }
    tache.promesse = (async () => {
      let etat
      do {
        tache.encore = false
        setSauvegarde((x) => (x.etat === 'envoi' ? x : { ...x, etat: 'envoi' }))
        try { etat = await envoyer(options) } catch { etat = 'erreur' }
      } while (tache.encore && etat === 'ok')
      envoi.current = null
      setSauvegarde({ etat: etat === 'local' ? 'ok' : etat, le: Date.now() })
      // Nouvel essai automatique, de plus en plus espacé (15 s à 5 min).
      clearTimeout(relance.current.minuteur)
      if (etat === 'horsLigne' || etat === 'erreur') {
        relance.current.delai = Math.min(300000, (relance.current.delai || 7500) * 2)
        relance.current.minuteur = setTimeout(() => sauvegarderRef.current(), relance.current.delai)
      } else relance.current.delai = 0
      return etat
    })()
    envoi.current = tache
    return tache.promesse
  }, [envoyer])
  const sauvegarderRef = useRef(sauvegarder)
  sauvegarderRef.current = sauvegarder

  // Anti-rebond : on envoie 2 s après le dernier changement.
  const aEnvoyer = useMemo(() => compteActif(state) && aSauvegarder(state), [state])
  useEffect(() => {
    if (!aEnvoyer) { setSauvegarde((x) => (x.etat === 'attente' ? { ...x, etat: 'ok' } : x)); return }
    setSauvegarde((x) => (['horsLigne', 'erreur', 'envoi'].includes(x.etat) ? x : { ...x, etat: 'attente' }))
    const id = setTimeout(() => sauvegarderRef.current(), 2000)
    return () => clearTimeout(id)
  }, [aEnvoyer, state])

  // Retour du réseau ou de l'élève : on reprend. Départ (onglet caché, page
  // fermée) : on envoie tout de suite ce qui reste, sans attendre.
  const aEnvoyerRef = useRef(aEnvoyer)
  aEnvoyerRef.current = aEnvoyer
  useEffect(() => {
    const reprendre = () => { if (aEnvoyerRef.current) sauvegarderRef.current() }
    const partir = () => { if (aEnvoyerRef.current) sauvegarderRef.current({ keepalive: true }) }
    const visibilite = () => (document.visibilityState === 'hidden' ? partir() : reprendre())
    window.addEventListener('online', reprendre)
    window.addEventListener('pagehide', partir)
    document.addEventListener('visibilitychange', visibilite)
    return () => {
      window.removeEventListener('online', reprendre)
      window.removeEventListener('pagehide', partir)
      document.removeEventListener('visibilitychange', visibilite)
      clearTimeout(relance.current.minuteur)
    }
  }, [])

  // Déconnexion : la progression vit sur le compte. On l'envoie d'abord ; si
  // c'est impossible (hors ligne…), on ne l'efface pas sans l'accord de l'élève
  // (`deconnexion`, affiché par EtatSauvegarde.jsx) : logout({ force: true }).
  // Ensuite : rappels push arrêtés, session fermée sur le serveur, identité et
  // progression locale effacées (appareil partagé). Langue et thème restent.
  const [deconnexion, setDeconnexion] = useState(null)
  const logout = useCallback(async ({ force = false } = {}) => {
    const session = getSession()
    const avant = latestState.current
    // Essai sans compte : la progression n'existe que sur cet appareil. On ne
    // l'efface pas sans l'accord de l'élève, à qui l'on propose un compte.
    if (!force && !avant.account?.id && aProgresse(avant)) { setDeconnexion({ etat: 'essai' }); return false }
    if (!force && avant.account?.id) {
      // Session expirée : rien ne peut partir avant de se reconnecter.
      const etat = compteActif(avant) ? await sauvegarder() : !session && aSauvegarder(avant) ? 'session' : 'ok'
      if (etat !== 'ok' && etat !== 'local') { setDeconnexion({ etat }); return false }
    }
    setDeconnexion(null)
    // Une connexion plus récente ne doit pas être fermée par ce retour tardif.
    if (getSession()?.user?.id !== session?.user?.id) return false
    await desactiverRappelsPush()
    if (getSession()?.user?.id !== session?.user?.id) return false
    signOut()
    setRaw(withoutAccount(latestState.current))
    setNewBadges([])
    setDailyReward(null)
    setSauvegarde({ etat: 'ok' })
    return true
  }, [sauvegarder])
  const annulerDeconnexion = useCallback(() => setDeconnexion(null), [])

  const restoreAccount = useCallback((profile, session) => {
    if (!session?.user?.id || session.user.id !== getSession()?.user?.id) return
    if (!profile || (profile.id && profile.id !== session.user.id)) throw new Error('Profil du compte indisponible. Réessaie de te connecter.')
    setRaw((previous) => session.user.id === getSession()?.user?.id
      ? evaluateBadges(restoreAccountState(previous, profile, session)) : previous)
  }, [evaluateBadges])

  // Restaure la progression du compte (fusion avec l'éventuel local du même
  // utilisateur) après connexion / récupération.
  const hydrateProgress = useCallback((server) => {
    setRaw((p) => evaluateBadges(avecVersionServeur(mergeProgress(structuredCloneSafe(p), server), versionDe(server))))
  }, [evaluateBadges])

  // Rester connecté : au démarrage, si une session existe, on rafraîchit le
  // jeton (il expire ~1 h) puis on resynchronise la progression du compte
  // (fusion sans perte). Ainsi, une fois connecté, on le reste durablement et
  // sur tous ses appareils.
  const booted = useRef(false)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    if (!isSignedIn()) return
    const owner = getSession()?.user?.id
    ;(async () => {
      await refreshSession().catch(() => {})
      if (!isSignedIn() || getSession()?.user?.id !== owner) return
      try {
        const session = getSession()
        const profile = await fetchProfile()
        if (profile && getSession()?.user?.id === owner) restoreAccount(profile, session)
      } catch { /* hors-ligne : on garde uniquement le local du même compte */ }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Une connexion/déconnexion dans un autre onglet change aussi l'identité ici.
  // Un renouvellement du jeton du même compte ne réinitialise pas la progression.
  useEffect(() => {
    const changed = async event => {
      if (event.key !== 'stmg_session' && event.key !== null) return
      const owner = getSession()?.user?.id
      let previousOwner
      try { previousOwner = JSON.parse(event.oldValue)?.user?.id } catch { /* stockage effacé */ }
      if (event.key !== null && owner === previousOwner) return
      setRaw(previous => {
        if (!owner) return previous.account ? withoutAccount(previous) : previous
        const latest = load()
        return latest.account?.id === owner ? latest : withoutAccount(previous)
      })
      if (!owner) return
      try {
        const profile = await fetchProfile()
        const session = getSession()
        if (profile && session?.user?.id === owner) restoreAccount(profile, session)
      } catch { /* hors ligne : aucune donnée de l'ancien compte n'est exposée */ }
    }
    window.addEventListener('storage', changed)
    return () => window.removeEventListener('storage', changed)
  }, [restoreAccount])

  // Récompense : XP gagnés à la fin d'une session de révision (minuteur focus).
  // 1 XP par minute de révision effectuée (plafonné), badges réévalués.
  useEffect(() => {
    const onDone = (e) => {
      const mins = Math.max(1, Math.min(90, Math.round(e?.detail?.minutes || 0)))
      setState((p) => evaluateBadges({ ...p, xp: p.xp + mins }))
    }
    window.addEventListener('stmg-focus-done', onDone)
    return () => window.removeEventListener('stmg-focus-done', onDone)
  }, [evaluateBadges])

  // Courbe de progression : à chaque changement d'XP, on note l'XP cumulé du
  // jour (une entrée par jour, 120 jours glissants) pour tracer la progression.
  useEffect(() => {
    setState((p) => {
      const day = todayKey()
      if ((p.history || {})[day] === p.xp) return p
      const h = { ...(p.history || {}), [day]: p.xp }
      const days = Object.keys(h).sort()
      while (days.length > 120) delete h[days.shift()]
      return { ...p, history: h }
    })
  }, [state.xp])

  // Temps de révision par thème : accumule des secondes actives sur un thème.
  const addThemeTime = useCallback((themeId, secs) => {
    const s = studySeconds(secs)
    if (!themeId || s <= 0) return
    setState((p) => ({ ...p, themeTime: { ...(p.themeTime || {}), [themeId]: studySeconds(p.themeTime?.[themeId]) + s } }))
  }, [])

  // Flashcards téléchargées (app) : espace « Révision ». On ajoute/actualise un
  // paquet (par id) et on plafonne la bibliothèque. removeDeck le retire.
  const saveDeck = useCallback((deck) => {
    if (!deck || !deck.id || !Array.isArray(deck.cards) || !deck.cards.length) return
    setState((p) => {
      const rest = (p.savedDecks || []).filter((d) => d.id !== deck.id)
      const entry = { id: deck.id, title: deck.title || 'Flashcards', subjectId: deck.subjectId || null, themeId: deck.themeId || null, color: deck.color || null, cards: deck.cards.map((c) => ({ front: c.front, back: c.back })), savedAt: Date.now() }
      return { ...p, savedDecks: [entry, ...rest].slice(0, 60) }
    })
  }, [])
  const removeDeck = useCallback((id) => setState((p) => ({ ...p, savedDecks: (p.savedDecks || []).filter((d) => d.id !== id) })), [])

  // Fiches de révision générées depuis une photo (OCR + structuration locale).
  // On ajoute/actualise par id et on plafonne la bibliothèque.
  const saveFiche = useCallback((fiche) => {
    if (!fiche || !fiche.id) return
    setState((p) => {
      const rest = (p.fiches || []).filter((f) => f.id !== fiche.id)
      return { ...p, fiches: [{ ...fiche, createdAt: fiche.createdAt || Date.now() }, ...rest].slice(0, 60) }
    })
  }, [])
  const removeFiche = useCallback((id) => setState((p) => ({ ...p, fiches: (p.fiches || []).filter((f) => f.id !== id) })), [])

  // Couleurs personnalisées : fusionne des overrides ({bg,ink,accent,card}).
  const setCustomTheme = useCallback((patch) => setState((p) => ({
    ...p,
    customTheme: patch ? { ...(p.customTheme || {}), ...patch } : null,
  })), [])
  const resetCustomTheme = useCallback(() => setState((p) => ({ ...p, customTheme: null })), [])

  // Onglets de la barre du bas : liste d'ids (voir navTabs.js) ou null = défaut.
  const setTabs = useCallback((tabs) => setState((p) => ({ ...p, tabs: Array.isArray(tabs) && tabs.length ? tabs : null })), [])

  // Notes personnelles de l'élève sur un thème (remarques, astuces…).
  const setNote = useCallback((themeId, text) => setState((p) => ({ ...p, notes: { ...(p.notes || {}), [themeId]: text } })), [])

  // Notes reçues en classe (page « Mes notes de classe ») : ajout et retrait.
  const ajouterNoteClasse = useCallback((entree) => setState((p) => ({ ...p, notesClasse: ajouterNote(p.notesClasse, entree) })), [])
  const retirerNoteClasse = useCallback((id) => setState((p) => ({ ...p, notesClasse: (p.notesClasse || []).filter((n) => n.id !== id) })), [])

  // Défi du jour : à la fin du défi, une seule récompense par jour. La série
  // augmente si le défi de la veille a été relevé, sinon elle repart à 1.
  const completeDailyChallenge = useCallback((pct = 0) => setState((p) => {
    const day = todayKey()
    const dc = p.dailyChallenge || { last: null, streak: 0, best: 0 }
    if (dc.last === day) return p // déjà relevé aujourd'hui
    const gap = dc.last ? daysBetween(dc.last, day) : null
    const streak = gap === 1 ? (dc.streak || 0) + 1 : 1
    const best = Math.max(dc.best || 0, streak)
    const bonus = 30 + Math.round((Math.max(0, Math.min(100, pct)) / 100) * 30) + Math.min(30, streak * 3)
    return evaluateBadges({ ...p, xp: p.xp + bonus, coins: (p.coins || 0) + bonus, shopWalletUpdatedAt: walletRevision(p), dailyChallenge: { last: day, streak, best, lastBonus: bonus } })
  }), [evaluateBadges])

  // Objectif de la semaine : réclamer la récompense quand l'objectif de chapitres
  // travaillés est atteint (une seule fois par semaine ISO).
  const claimWeekly = useCallback(() => setState((p) => {
    const wk = isoWeekKey()
    const w = p.weekly?.week === wk ? p.weekly : { week: wk, done: [] }
    const count = w.done?.length || 0
    if (count < WEEKLY_GOAL || w.rewarded === wk) return p
    const bonus = WEEKLY_REWARD
    return evaluateBadges({ ...p, xp: p.xp + bonus, coins: (p.coins || 0) + bonus, shopWalletUpdatedAt: walletRevision(p), weekly: { ...w, rewarded: wk } })
  }), [evaluateBadges])

  // Inscription : applique en une fois le profil, la filière, les chapitres
  // choisis (favoris « à revoir ») et le point de reprise, puis évalue les
  // badges (Bienvenue, Feuille de route…).
  const applyOnboarding = useCallback(({ profile, track, favorites, lastChapter, studyLanguages }) => {
    setState((p) => {
      const next = { ...p, onboarded: true }
      if (profile) next.profile = profile
      if (track) next.track = track
      if (studyLanguages !== undefined) next.studyLanguages = normalizeStudyLanguages(studyLanguages)
      if (favorites?.length) next.favorites = Array.from(new Set([...(p.favorites || []), ...favorites]))
      if (lastChapter) next.lastChapter = lastChapter
      return evaluateBadges(next)
    })
  }, [evaluateBadges])

  const resetAll = useCallback(() => setRaw(emptyState()), [])

  const dismissBadge = useCallback(
    (id) => setNewBadges((q) => q.filter((b) => b !== id)),
    [],
  )

  const derived = useMemo(() => deriveAll(state), [state])

  // Programme : date du bac. XP direct (bac blanc, révision libre).
  const setBacDate = useCallback((bacDate) => setState((p) => ({ ...p, bacDate: bacDate || null })), [])
  const addXp = useCallback((n) => setState((p) => {
    const g = Math.max(0, Math.round(n) || 0)
    return evaluateBadges({ ...p, xp: p.xp + g, coins: (p.coins || 0) + g, shopWalletUpdatedAt: walletRevision(p) })
  }), [evaluateBadges])

  // Résolution depuis le catalogue : prix et conditions ne viennent pas du bouton.
  const buy = useCallback((item) => setState((p) => purchaseItem(p, item?.id)), [])
  const equip = useCallback((item) => setState((p) => equipItem(p, item?.id)), [])
  const claimShopReward = useCallback((id) => setState((p) => collectReward(p, id)), [])
  const setA11y = useCallback((patch) => setState((p) => ({ ...p, a11y: { ...(p.a11y || {}), ...patch } })), [])
  const setReminder = useCallback((patch) => setState((p) => ({ ...p, reminder: { ...(p.reminder || {}), ...patch } })), [])
  const setGrandOral = useCallback((maj) => setState((p) => {
    const avant = { ...grandOralVide(), ...(p.grandOral || {}) }
    const apres = typeof maj === 'function' ? maj(avant) : { ...avant, ...maj }
    return { ...p, grandOral: { ...apres, maj: Date.now() } }
  }), [])
  // Parcours personnalisé : `maj` peut être un objet (fusionné) ou une fonction de l'ancien parcours.
  const setParcours = useCallback((maj) => setState((p) => {
    const avant = p.parcours || {}
    const apres = typeof maj === 'function' ? maj(avant) : { ...avant, ...maj }
    return { ...p, parcours: { ...apres, maj: Date.now() } }
  }), [])
  const setEtudeGestion = useCallback((maj) => setState((p) => {
    const avant = { ...etudeGestionVide(), ...(p.etudeGestion || {}) }
    const apres = typeof maj === 'function' ? maj(avant) : { ...avant, ...maj }
    return { ...p, etudeGestion: { ...apres, maj: Date.now() } }
  }), [])
  const noterReponses = useCallback((r) => setState((p) => ({ ...p, erreurs: majCarnet(p.erreurs, r, todayKey()), reussites: updateSuccesses(p.reussites, r) })), [])
  const setParentShare = useCallback((on) => {
    try { if (on) localStorage.removeItem('stmg_parent_efface') } catch { /* stockage indisponible */ }
    setState((p) => ({ ...p, parentShare: !!on }))
  }, [])
  // Bac blanc : mémorise les énoncés déjà tombés pour cette sélection, afin de
  // ne jamais reproposer le même sujet deux fois de suite (fenêtre glissante).
  const recordExamSeen = useCallback((selection, keys) => setState((p) => {
    if (!Array.isArray(keys) || !keys.length) return p
    const prev = p.examSeen?.[selection] || []
    const merged = [...prev.filter((k) => !keys.includes(k)), ...keys]
    const CAP = 120
    const capped = merged.length > CAP ? merged.slice(merged.length - CAP) : merged
    return { ...p, examSeen: { ...(p.examSeen || {}), [selection]: capped } }
  }), [])

  const value = {
    state,
    derived,
    newBadges,
    dailyReward,
    checkIn,
    clearDailyReward,
    buy,
    equip,
    claimShopReward,
    recordResult,
    recordMission,
    setBacDate,
    addXp,
    setA11y,
    setReminder,
    setGrandOral,
    setParentShare,
    noterReponses,
    setEtudeGestion,
    setParcours,
    recordExamSeen,
    toggleFavorite,
    setLastChapter,
    setTheme,
    setTrack,
    setStudyLanguages,
    setProfile,
    setPhoto,
    setLang,
    setClassCode,
    setAccount,
    setTeacherClasses,
    addTeacherClass,
    logout,
    deconnexion,
    annulerDeconnexion,
    sauvegarde,
    sauvegarder,
    stockagePlein,
    hydrateProgress,
    restoreAccount,
    setCustomTheme,
    resetCustomTheme,
    setTabs,
    addThemeTime,
    saveDeck,
    removeDeck,
    saveFiche,
    removeFiche,
    claimWeekly,
    completeDailyChallenge,
    setNote,
    ajouterNoteClasse,
    retirerNoteClasse,
    applyOnboarding,
    resetAll,
    dismissBadge,
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore doit être utilisé dans <StoreProvider>')
  return ctx
}

// Compte le temps de révision réellement passé (page au premier plan) sur un
// thème et l'ajoute au store (par paliers, à la sortie et au passage en arrière-
// plan). Utilisé par les pages Thème/Chapitre. Ne compte pas l'onglet caché.
// Clé « fourre-tout » : le temps passé à réviser hors d'un thème précis (bac
// blanc, révision express, coach IA, défi, flashcards sans thème). Filtrée des
// barres « temps par thème » (pas un vrai thème), mais comptée dans le temps
// total → elle alimente bien les récompenses de temps.
export const STUDY_BUCKET = '__study'

// Mesure le temps ACTIF (onglet visible) passé sur une activité et l'ajoute au
// compteur `bucket` de `themeTime`. Passer un id de thème pour l'attribuer au
// thème ; sinon on retombe sur le fourre-tout STUDY_BUCKET.
function useActivityTimer(bucket) {
  const { addThemeTime } = useStore()
  useEffect(() => {
    if (!bucket) return
    let acc = 0
    let last = performance.now()
    let visible = typeof document === 'undefined' ? true : !document.hidden
    const tick = () => {
      const now = performance.now()
      acc += activeSeconds(last, now, visible)
      last = now
    }
    const flush = () => { tick(); if (acc > 0) { addThemeTime(bucket, acc); acc = 0 } }
    const onVis = () => {
      tick()
      const nowHidden = document.hidden
      if (nowHidden) flush() // en quittant l'onglet : on enregistre
      visible = !nowHidden
      last = performance.now()
    }
    const id = setInterval(() => { tick(); if (acc >= 30) flush() }, 5000)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', flush)
    return () => {
      flush()
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', flush)
    }
  }, [bucket, addThemeTime])
}

// Temps passé sur un thème (page cours/thème + exercices du chapitre).
export function useThemeTimer(themeId) { useActivityTimer(themeId || null) }

// Temps passé à réviser hors d'un thème précis (bac blanc, express, coach IA,
// défi, flashcards) : attribué au thème si on en connaît un, sinon au
// fourre-tout — dans tous les cas compté pour les récompenses de temps.
export function useStudyTimer(themeId = null) { useActivityTimer(themeId || STUDY_BUCKET) }

// ---- Calculs de progression dérivés de l'état ----------------------------
// Maîtrise d'un thème (« chapterId » : identifiant historique du thème) :
// - chaque chapitre du cours compte ses 3 meilleurs exercices (un chapitre est
//   maîtrisé quand 3 de ses exercices sont réussis à 100 %, ou tous s'il en a
//   moins) ; un chapitre sans exercice ne compte pas ;
// - la maîtrise du thème est la moyenne de ses chapitres, ou le résultat du
//   test du thème s'il est meilleur (le test couvre tout le thème).
// Les modes transverses (bac blanc, défi, coach) ne comptent pas ici.
export function chapterScore(state, chapterId) {
  if (!ALL_CHAPTERS[chapterId]) return 0
  const rec = state.chapters[chapterId]
  if (!rec) return 0
  const nb = exercicesParChapitre(chapterId)
  const parChapitre = nb.map(() => [])
  for (const [id, pct] of Object.entries(rec.games || {})) {
    const i = chapitreDuJeu(chapterId, id)
    if (i != null && i < nb.length) parChapitre[i].push(Number(pct) || 0)
  }
  let somme = 0, comptes = 0
  nb.forEach((k, i) => {
    if (!k) return
    somme += parChapitre[i].sort((a, b) => b - a).slice(0, k).reduce((a, b) => a + b, 0) / k
    comptes++
  })
  const moyenne = comptes ? somme / comptes : 0
  return Math.min(100, Math.round(Math.max(moyenne, rec.quiz || 0)))
}

export function starsFromScore(score) {
  if (score >= 90) return 3
  if (score >= 60) return 2
  if (score >= 25) return 1
  return 0
}

export function subjectScore(state, subjectId) {
  const subj = SUBJECTS.find((s) => s.id === subjectId)
  if (!subj || !subj.chapters.length) return 0
  const sum = subj.chapters.reduce((a, c) => a + chapterScore(state, c.id), 0)
  return Math.round(sum / subj.chapters.length)
}

export function globalScore(state) {
  if (!SUBJECTS.length) return 0
  const sum = SUBJECTS.reduce((a, s) => a + subjectScore(state, s.id), 0)
  return Math.round(sum / SUBJECTS.length)
}

// Instantané des stats de l'élève pour l'espace parent (lecture seule).
export function buildChildSnapshot(state, derived) {
  const subs = subjectsForTrack(state.track).filter((s) => s && !s.comingSoon && (s.chapters || []).length)
  const subjects = subs.map((s) => ({
    short: s.short || s.name,
    ...(state.parentShare && state.parcours?.vacances?.subjectId === s.id && vacancesSummary(state.parcours.vacances, state.track) ? { vacances: vacancesSummary(state.parcours.vacances, state.track) } : {}),
    color: s.color,
    score: derived?.bySubject?.[s.id] || 0,
    time: (s.chapters || []).reduce((a, c) => a + studySeconds(state.themeTime?.[c.id]), 0),
  }))
  const totalTime = Object.values(state.themeTime || {}).reduce((a, b) => a + studySeconds(b), 0)
  const name = [state.profile?.firstName, state.profile?.lastName].filter(Boolean).join(' ').trim() || 'Élève'
  return {
    name,
    xp: state.xp || 0,
    level: derived?.level || 0,
    streak: state.streak?.count || 0,
    coursesWeek: derived?.weeklyCourses || 0,
    weeklyGoal: WEEKLY_GOAL,
    totalTime,
    bacDate: state.bacDate || null,
    badges: (state.badges || []).length,
    track: trackLabel(state.track),
    subjects,
  }
}

function deriveAll(state) {
  const bySubject = {}
  const byChapter = {}
  let chaptersMastered = 0
  let subjectsPlayed = 0
  for (const s of SUBJECTS) {
    bySubject[s.id] = subjectScore(state, s.id)
    const played = s.chapters.some((c) => {
      const rec = state.chapters[c.id]
      return rec && (rec.quiz > 0 || Object.keys(rec.games || {}).length > 0)
    })
    if (played) subjectsPlayed++
  }
  for (const cid of Object.keys(ALL_CHAPTERS)) {
    const sc = chapterScore(state, cid)
    byChapter[cid] = sc
    if (sc >= 90) chaptersMastered++
  }
  const wk = isoWeekKey()
  const weeklyCourses = state.weekly?.week === wk ? (state.weekly.done?.length || 0) : 0
  return {
    global: globalScore(state),
    bySubject,
    byChapter,
    chaptersMastered,
    subjectsPlayed,
    weeklyCourses,
    ...levelFromXp(state.xp),
  }
}

// structuredClone n'est pas garanti partout : petit filet de sécurité.
function structuredCloneSafe(obj) {
  try {
    return structuredClone(obj)
  } catch {
    return JSON.parse(JSON.stringify(obj))
  }
}
