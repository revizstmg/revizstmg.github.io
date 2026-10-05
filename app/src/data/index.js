// Assemblage des matières à partir du contenu JSON (app/content/, voir
// src/content/contenu.js). Pour ajouter un chapitre : l'ajouter dans
// content/<matière>/matiere.json. Rien d'autre à toucher dans l'application.
//
// Chargement à la demande : SUBJECTS et ALL_CHAPTERS sont disponibles dès le
// démarrage dans leur version légère (noms, couleurs, identifiants des
// exercices). chargerMatiere(id) charge les fichiers d'une matière, assemble ses
// thèmes et complète ces objets SUR PLACE. Les fonctions qui lisent le contenu
// (themeChapters, buildQuiz, decks…) supposent la matière chargée : les pages
// qui s'en servent passent par <Contenu> (src/content/Contenu.jsx).
import { ORDRE_MATIERES, MATIERES, COUCHES, commun, chargerFichiers, remplacerEnPlace } from '../content/contenu.js'
import { THEME_TERMS, subjectFallbackFor } from './keyterms.js'
import { PIEGES } from './pieges.js'

const LESSONS = COUCHES['cours-complets']
const COURS_REELS = COUCHES['cours-reels']
const ENRICH = COUCHES.enrichissements
const PHILO_LONG = COUCHES['philo-longue-duree']
const APPROF = COUCHES['approfondi-1']
const APPROF2 = COUCHES['approfondi-2']
const APPROF3 = COUCHES['approfondi-3']
const APPROF4 = COUCHES['approfondi-4']
const SICSI = COUCHES['sic-si']
const HIST_DEEP = COUCHES['histoire-approfondie']
const MGMT_DEEP = COUCHES['management-approfondi']
const DOC_STUDIES = COUCHES['etudes-documents']
const CAS_PRATIQUES = COUCHES['cas-pratiques']
const GAME_SECTION = COUCHES['exercices-sections']

export const SUBJECTS = MATIERES

// Index chapitre -> { subject, ...chapitre } pour un accès direct par id.
// Les « cours complets » de lessons.js (facultatifs) enrichissent chaque
// chapitre : introduction, sections développées, exemples, ressources vidéos.
// Un chapitre sans entrée dans LESSONS garde son cours d'origine.
// Petit nettoyage markdown local (le module « shuffle/stripMd » plus bas n'est
// pas encore défini à ce stade du fichier).
function _strip(x) { return String(x || '').replace(/\*\*/g, '').replace(/\*/g, '').trim() }

// Catégorie d'un chapitre approfondi d'après son intitulé, pour le ranger dans
// une section repliable de la page thème (méthodes de calcul, études de cas,
// ou cours approfondi par défaut).
export function courseGroupOf(h) {
  const s = String(h || '')
  if (/MÉTHODE|comment calculer/i.test(s)) return 'methode'
  if (/étude de cas|cas pratique/i.test(s)) return 'cas'
  return 'approf'
}

// Intro « plan du thème » synthétique : oriente l'élève quand aucune intro n'a
// été rédigée à la main. Construite à partir des seuls intitulés de sections
// (contenu déjà relu) → aucun risque d'erreur factuelle.
function synthIntro(chapter) {
  const secs = (chapter.cours || []).map((s) => _strip(s.h)).filter(Boolean)
  if (!secs.length) return null
  const list = secs.length > 1 ? secs.slice(0, 6).map((s) => `**${s}**`).join(' · ') : `**${secs[0]}**`
  return `Dans ce thème : ${list}. Lis chaque partie, retiens les **définitions clés** surlignées, puis entraîne-toi avec les exercices en bas de page. Le mémo « L’essentiel » ci-dessous résume ce qu’il faut absolument savoir pour le bac.`
}

// Mémo « L'essentiel » synthétique : construit à partir des définitions clés
// (vérifiées), d'une formule et d'un piège fréquent du thème, quand aucun mémo
// n'a été rédigé à la main. Réutilise uniquement des contenus déjà relus.
function synthEssentiel(chapter) {
  const items = []
  for (const [term, def] of (THEME_TERMS[chapter.id] || []).slice(0, 5)) {
    if (term && def) items.push(`**${_strip(term)}** : ${_strip(def)}`)
  }
  if (Array.isArray(chapter.formulas) && chapter.formulas[0]) items.push(`📐 ${_strip(chapter.formulas[0])}`)
  const pg = (PIEGES[chapter.id] || [])[0]
  if (pg) items.push(`⚠️ À ne pas confondre — ${pg}`)
  return items.length >= 3 ? items : null
}

// Cours de Terminale = uniquement des notions de Terminale. Certaines sections,
// héritées des modules, ne font que reprendre des PRÉREQUIS de Première (« qu'est-ce
// qu'une organisation », types/finalités, efficacité/efficience, facteurs de
// production…). On les MASQUE du cours affiché, sans les supprimer des modules :
// les notions de Première restent dans la banque d'exercices (keyterms.js), donc
// les EXERCICES peuvent toujours les mobiliser pour formuler des questions de
// Terminale — mais l'élève ne relit plus ces bases dans le cours.
// Pour en masquer d'autres : ajouter un motif (titre de section) au thème concerné.
// Droit, thème 8 : les cours réels ne traitent ni la concurrence (8.3) ni les
// partenariats (8.4) ; les sections du cours complet restent affichées.
const COURS_COMPLET_AUSSI = new Set(['droit-t8'])

const PREREQ_SECTIONS = {
  'mgmt-t1': [
    /Decathlon.*trois logiques/i,
    /Ce qui fait tourner une organisation/i,
    /Exemple traité[^]*caractériser une organisation/i,
    /Qu[’'`]est-ce qu[’'`]une organisation[^]*trois types/i,
    /Finalité, performance et parties prenantes/i,
    /Produire[^]*facteurs et combinaison productive/i,
    /Étude de cas guidée[^]*caractériser et diagnostiquer/i,
    /Mesurer la performance/i,
    // « Organiser la production » reste affiché : c'est la question 1.3 du
    // programme de Terminale (flexibilité, qualité, maîtrise des coûts).
  ],
}

// Dédoublonnage des sections de cours. Après empilement de plusieurs modules
// (cours de base, « cours réels », approfondir ×4, enrich…), un même sujet
// pouvait apparaître 2 à 4 fois dans un thème (« Nombre dérivé et tangente »,
// « La RSE et le développement durable »…). On regroupe les sections de MÊME
// nature (leçon / exemple / méthode / cas) portant sur le MÊME sujet et on ne
// garde que la version la plus complète, ancrée dans la catégorie la plus
// visible (« Le cours » de préférence). Réversible : retirer l'appel suffit.
const _dnorm = (h) => String(h || '').replace(/\*\*/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ')
const _DEDUP_STOP = new Set(['le', 'la', 'les', 'd', 'de', 'des', 'du', 'un', 'une', 'et', 'au', 'aux', 'en', 'dans', 'sa', 'ses', 'son', 'pour', 'par', 'sur', 'ou', 'exemple', 'exemples', 'exercice', 'exercices', 'traite', 'traitee', 'guide', 'guidee', 'methode', 'cas', 'pratique', 'etude', 'type', 'chiffre', 'chiffree'])
const _GPRIO = { '': 0, approf: 1, methode: 2, cas: 3 }
function _dkeys(h) { return new Set(_dnorm(h).split(/\s+/).filter((w) => w.length >= 3 && !_DEDUP_STOP.has(w))) }
function _djac(a, b) { if (!a.size || !b.size) return 0; let i = 0; for (const x of a) if (b.has(x)) i++; return i / (new Set([...a, ...b]).size) }
function _dkind(h, g) {
  const t = _dnorm(h)
  if (/cas pratique|etude de cas/.test(t) || g === 'cas') return 'case'
  if (/methode/.test(t) || g === 'methode') return 'method'
  if (/exemple|exercice type|exercice guide|exercice traite/.test(t)) return 'example'
  return 'lesson'
}
function _dweight(sec) {
  let w = 0
  for (const b of sec.blocks || []) {
    if (typeof b.c === 'string') w += b.c.length
    else if (Array.isArray(b.c)) w += b.c.join('').length
    if (b.rows) w += JSON.stringify(b.rows).length
  }
  if (Array.isArray(sec.points)) w += sec.points.join('').length
  return w
}
function dedupeCourse(cours) {
  if (!Array.isArray(cours) || cours.length < 2) return cours
  const secs = cours.map((sec, i) => ({ i, sec, k: _dkind(sec.h, sec.group), g: sec.group || '', kw: _dkeys(sec.h), w: _dweight(sec) }))
  const parent = secs.map((_, i) => i)
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (let a = 0; a < secs.length; a++)
    for (let b = a + 1; b < secs.length; b++)
      if (secs[a].k === secs[b].k && secs[a].kw.size >= 2 && secs[b].kw.size >= 2 && _djac(secs[a].kw, secs[b].kw) >= 0.62)
        parent[find(b)] = find(a)
  const clusters = new Map()
  secs.forEach((s, i) => { const r = find(i); if (!clusters.has(r)) clusters.set(r, []); clusters.get(r).push(s) })
  const emit = new Map()
  const drop = new Set()
  for (const members of clusters.values()) {
    if (members.length < 2) continue
    const rich = members.reduce((p, x) => (x.w > p.w ? x : p))
    const anchor = members.reduce((p, x) => {
      const gp = _GPRIO[x.g] ?? 1
      const pp = _GPRIO[p.g] ?? 1
      return gp !== pp ? (gp < pp ? x : p) : (x.i < p.i ? x : p)
    })
    emit.set(anchor.i, { ...rich.sec, group: anchor.g || undefined })
    for (const x of members) if (x.i !== anchor.i) drop.add(x.i)
  }
  const out = []
  secs.forEach((s) => { if (drop.has(s.i)) return; out.push(emit.get(s.i) || s.sec) })
  return out
}

// Index thème -> { ...thème, subjectId, subjectName, color } pour un accès
// direct par id. Version légère au démarrage, complétée au chargement.
export const ALL_CHAPTERS = {}
for (const s of SUBJECTS) {
  for (const c of s.chapters) ALL_CHAPTERS[c.id] = { ...c, subjectId: s.id, subjectName: s.name, color: s.color }
}

// Assemble un thème à partir de ses couches (ordre et règles inchangés).
// Les « cours complets » (facultatifs) enrichissent chaque thème : introduction,
// sections développées, exemples, ressources vidéos.
function assemblerTheme(c) {
  const lesson = LESSONS[c.id]
  if (lesson) {
    if (lesson.intro) c.intro = lesson.intro
    if (lesson.cours) c.cours = lesson.cours
    if (lesson.resources) c.resources = lesson.resources
    if (lesson.essentiel) c.essentiel = lesson.essentiel
  }
  // Cours « par l'exemple réel » (matières de gestion) : remplace le corps du
  // cours par une explication ancrée dans un exemple concret. Les définitions
  // ne sont plus dans le cours mais uniquement dans l'encadré « Définitions
  // clés ». Appliqué après LESSONS pour bien remplacer.
  // Pour les thèmes de COURS_COMPLET_AUSSI, les cours réels ne couvrent pas
  // tout le programme : on garde aussi les sections du cours complet.
  if (COURS_REELS[c.id]?.length) c.cours = COURS_COMPLET_AUSSI.has(c.id) ? [...COURS_REELS[c.id], ...(c.cours || [])] : COURS_REELS[c.id]
  // Enrichissement additif (exemples résolus, sections complémentaires,
  // ressources) : on n'écrase rien, on ajoute à la fin.
  const enr = ENRICH[c.id]
  if (enr) {
    if (enr.sections?.length) c.cours = [...(c.cours || []), ...enr.sections]
    if (enr.resources?.length) c.resources = [...(c.resources || []), ...enr.resources]
  }
  // Cours « longue durée » de philosophie : sections supplémentaires ajoutées
  // à la suite (définitions approfondies, thèses, textes commentés, dissertations).
  const plong = PHILO_LONG[c.id]
  if (plong?.length) c.cours = [...(c.cours || []), ...plong]
  // Cours « approfondis » du tronc STMG (Gestion-Finance, Management, Droit,
  // Économie, Maths) : plusieurs chapitres développés ajoutés à la suite.
  // Chaque section reçoit un « group » (approf / methode / cas) pour être
  // rangée dans une catégorie repliable sur la page du thème.
  const appr = APPROF[c.id]
  if (appr?.length) c.cours = [...(c.cours || []), ...appr.map((s) => ({ ...s, group: courseGroupOf(s.h) }))]
  const appr2 = APPROF2[c.id]
  if (appr2?.length) c.cours = [...(c.cours || []), ...appr2.map((s) => ({ ...s, group: courseGroupOf(s.h) }))]
  const appr3 = APPROF3[c.id]
  if (appr3?.length) c.cours = [...(c.cours || []), ...appr3.map((s) => ({ ...s, group: courseGroupOf(s.h) }))]
  const appr4 = APPROF4[c.id]
  if (appr4?.length) c.cours = [...(c.cours || []), ...appr4.map((s) => ({ ...s, group: courseGroupOf(s.h) }))]
  // SIC & SI : chapitres du programme rattachés à la catégorie principale
  // « 📘 Le cours » (pas de « group » → première catégorie, ouverte).
  const sicsi = SICSI[c.id]
  if (sicsi?.length) c.cours = [...(c.cours || []), ...sicsi]
  // Histoire : chapitres approfondis (≈5-6 pages) placés EN TÊTE de la
  // catégorie principale « 📘 Le cours » (pas de « group »).
  const hdeep = HIST_DEEP[c.id]
  if (hdeep?.length) c.cours = [...hdeep, ...(c.cours || [])]
  // Management : cours complet (chapitres développés) en tête de la catégorie
  // principale « 📘 Le cours » (pas de « group »).
  const mdeep = MGMT_DEEP[c.id]
  if (mdeep?.length) c.cours = [...mdeep, ...(c.cours || [])]
  // Masquage des sections « prérequis de Première » (voir PREREQ_SECTIONS) :
  // le cours de Terminale n'affiche que du niveau Terminale. Les notions
  // restent dans la banque d'exercices → toujours mobilisables en exercice.
  const prereq = PREREQ_SECTIONS[c.id]
  if (prereq?.length && Array.isArray(c.cours)) {
    c.cours = c.cours.filter((sec) => !prereq.some((rx) => rx.test(_strip(sec.h))))
  }
  // Dédoublonnage : un même sujet ne doit apparaître qu'une fois (version la
  // plus complète). Voir dedupeCourse plus haut.
  if (Array.isArray(c.cours) && c.cours.length > 1) c.cours = dedupeCourse(c.cours)
  // Lisibilité : ouvrir le cours par son accroche concrète (les « cours réels »
  // sont écrits comme des mises en situation d'introduction). On remonte ces
  // sections en tête de la catégorie « 📘 Le cours ».
  const hookHeads = new Set((COURS_REELS[c.id] || []).map((s) => s.h))
  if (hookHeads.size && Array.isArray(c.cours) && c.cours.length > 1) {
    const isHook = (s) => !s.group && hookHeads.has(s.h)
    c.cours = [...c.cours.filter(isHook), ...c.cours.filter((s) => !isHook(s))]
  }
  // Filet universel « cours clair » : toute page de thème s'ouvre sur une intro
  // et se referme sur un mémo « L'essentiel », même sans cours rédigé à la main.
  if (!c.intro) { const i = synthIntro(c); if (i) c.intro = i }
  if (!c.essentiel || !c.essentiel.length) { const e = synthEssentiel(c); if (e) c.essentiel = e }
  // Étude de documents (Droit & Économie) : ajoutée aux jeux du thème.
  const docStudy = DOC_STUDIES[c.id]
  if (docStudy && !(c.games || []).some((g) => g.id === docStudy.id)) {
    c.games = [...(c.games || []), docStudy]
  }
}

const CHARGEMENTS = new Map()
const CHARGEES = new Set()
const ABONNES = new Set()

export function matiereChargee(id) {
  return CHARGEES.has(id)
}

// Charge une matière (une seule fois) et assemble ses thèmes.
export function chargerMatiere(id) {
  if (!CHARGEMENTS.has(id)) {
    const p = (async () => {
      const s = await chargerFichiers(id)
      for (const c of s.chapters) {
        assemblerTheme(c)
        const entree = { ...c, subjectId: s.id, subjectName: s.name, color: s.color }
        if (ALL_CHAPTERS[c.id]) remplacerEnPlace(ALL_CHAPTERS[c.id], entree)
        else ALL_CHAPTERS[c.id] = entree
      }
      CHARGEES.add(id)
      for (const fn of ABONNES) fn(id)
      return s
    })()
    // Un échec (réseau coupé…) ne doit pas bloquer une nouvelle tentative.
    p.catch(() => CHARGEMENTS.delete(id))
    CHARGEMENTS.set(id, p)
  }
  return CHARGEMENTS.get(id)
}

export function chargerMatieres(ids) {
  return Promise.all([...new Set(ids)].filter((id) => ORDRE_MATIERES.includes(id)).map(chargerMatiere))
}

export function chargerTout() {
  return chargerMatieres(ORDRE_MATIERES)
}

// Charge la matière d'un thème (duels, favoris…).
export function chargerPourTheme(themeId) {
  const c = ALL_CHAPTERS[themeId]
  return c ? chargerMatiere(c.subjectId) : Promise.resolve(null)
}

// Prévient quand une matière vient d'être chargée.
export function surChargement(fn) {
  ABONNES.add(fn)
  return () => ABONNES.delete(fn)
}

export function getSubject(id) {
  return SUBJECTS.find((s) => s.id === id) || null
}
export function getChapter(id) {
  return ALL_CHAPTERS[id] || null
}
export function chapterGameCount(chapterId) {
  const c = ALL_CHAPTERS[chapterId]
  return c ? (c.games?.length || 0) : 0
}

// ---------------------------------------------------------------------------
// Découpage Thème → Chapitres.
// Chaque « thème » (ex. « Thème 5 — Le contrat ») est découpé en chapitres,
// un par section du cours. Les mini-jeux du thème sont répartis sur ses
// chapitres (round-robin). La progression reste indexée par id de thème.
// ---------------------------------------------------------------------------
// Types d'exercices qui ciblent UNE notion précise : on les garde au niveau
// chapitre (rattachés à leur section). Les jeux de SYNTHÈSE (qcm, vrai/faux,
// association) et les anciennes flashcards couvraient tout le thème : ils ne
// sont plus placés sur un chapitre (ils alimentent le « Test du thème »).
const CHAPTER_GAME_TYPES = new Set(['calcul', 'trou', 'tri', 'ordre', 'memory', 'doc', 'verbs', 'grammar', 'comprehension', 'sql'])

export function themeChapters(theme) {
  if (!theme) return []
  const cours = theme.cours || []
  const games = theme.games || []
  const chapters = cours.map((sec, i) => ({
    id: `${theme.id}::${i}`,
    themeId: theme.id,
    idx: i,
    title: sec.h || `Partie ${i + 1}`,
    section: sec,
    games: [],
  }))
  if (!chapters.length) return chapters
  // Seuls les exercices « propres à une notion » restent sur le chapitre,
  // rattachés à leur section via GAME_SECTION (relue à la main).
  const kept = games.filter((g) => CHAPTER_GAME_TYPES.has(g.type))
  kept.forEach((g, k) => {
    let idx = GAME_SECTION[g.id]
    if (idx == null || idx < 0 || idx >= chapters.length) idx = Math.floor((k * chapters.length) / Math.max(1, kept.length))
    chapters[Math.min(idx, chapters.length - 1)].games.push(g)
  })
  // Chaque chapitre reçoit EN PLUS tout un ensemble d'exercices générés à partir
  // de SA SEULE section (QCM notions/dates/tableau, textes à trous en plusieurs
  // lots, « réponse à écrire »…) : on multiplie ainsi par ~5 le nombre
  // d'exercices par chapitre, et le contenu est mélangé/retiré à chaque partie —
  // jamais deux fois le même. Aucune flashcard ici (réservée à l'app installée).
  for (const ch of chapters) {
    const gen = sectionExercises(ch.section, theme, ch.idx)
    for (const g of gen) if (!ch.games.some((x) => x.id === g.id)) ch.games.push(g)
  }
  // Mini-cas d'entreprise chiffrés (rédigés à la main) : rattachés en tête du
  // premier chapitre du thème quand ils existent.
  const cas = CAS_PRATIQUES[theme.id]
  if (cas && cas.length && chapters[0]) {
    const g = { id: `${theme.id}::cas`, type: 'caspratique', title: 'Cas pratiques — scénarios chiffrés', icon: '🧮', cases: cas }
    if (!chapters[0].games.some((x) => x.id === g.id)) chapters[0].games.unshift(g)
  }
  return chapters
}

// Retire le markdown gras/italique pour un texte propre dans un exercice.
function stripMd(s) {
  return String(s || '').replace(/\*\*/g, '').replace(/\*/g, '').trim()
}

// Découpe un texte en phrases sans couper après une abréviation (« art. 1103 »,
// « al. 1 », « par ex. », « cf. »…) ni avant une suite en minuscule.
const ABREV_RE = /(?:^|[\s(«'’])(?:art|al|ex|cf|etc|env|av|apr|n°|p|pp|s|vol|chap|M|Mme|MM|Dr|St|Ste|C|civ|com|trav|consom)\.$/i
function phrases(text) {
  const t = String(text || '')
  const out = []
  let debut = 0
  const re = /[.!?…]+(?=\s)/g
  let m
  while ((m = re.exec(t))) {
    const fin = m.index + m[0].length
    const avant = t.slice(debut, fin)
    const suite = t.slice(fin).trimStart()
    if (m[0] === '.' && ABREV_RE.test(avant)) continue
    if (suite && !/^[A-ZÀ-ÖØ-Þ«"“(0-9*•–—-]/.test(suite)) continue
    out.push(avant)
    debut = fin
  }
  out.push(t.slice(debut))
  return out.map((s) => s.trim()).filter(Boolean)
}

// Clé de comparaison d'une réponse : minuscules, sans accents, sans article,
// sans numéro de liste ni ponctuation finale.
function cleReponse(s) {
  return _accents(stripMd(String(s || ''))).toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/^\d+\s*[.)]\s*/, '')
    .replace(/^(l'|d'|le |la |les |un |une |des |du |de la |de l')/, '')
    .replace(/[-‐‑]/g, ' ')
    .replace(/[\s.;:!?…,]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Autres réponses justes à accepter dans les exercices à écrire
// (content/commun/reponses-acceptees.json : « toutes » les matières, ou un thème).
let _REPONSES = null
function reponsesAcceptees(terme, themeId) {
  if (!_REPONSES) {
    _REPONSES = {}
    for (const [portee, table] of Object.entries(commun('reponses-acceptees') || {})) {
      _REPONSES[portee] = {}
      for (const [k, v] of Object.entries(table)) _REPONSES[portee][cleReponse(k)] = v
    }
  }
  const k = cleReponse(terme)
  return [...(_REPONSES.toutes?.[k] || []), ...(_REPONSES[themeId]?.[k] || [])]
}

// Deux libellés de la même notion : identiques, l'un est une variante de
// l'autre (« Dommage » / « Dommage / préjudice »), ou le plus long ne fait
// qu'ajouter un complément (« Consentement » / « Le consentement des parties »,
// « Capacité juridique » / « La capacité juridique de contracter »). Ils ne
// doivent pas coexister dans un exercice, sinon il y a deux bonnes réponses.
// « Chômage » et « Taux de chômage » ou « Chômage structurel » restent distincts.
function libelleNotion(terme) {
  return cleReponse(String(terme || '').replace(/\([^)]*\)/g, ' '))
}
function memeNotion(a, b) {
  const A = libelleNotion(a)
  const B = libelleNotion(b)
  if (!A || !B) return false
  if (A === B) return true
  const variantes = (s) => s.split(/\s*\/\s*/).map((x) => x.trim()).filter(Boolean)
  if (variantes(A).includes(B) || variantes(B).includes(A)) return true
  const [court, long] = A.length <= B.length ? [A, B] : [B, A]
  return new RegExp(`^${court.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (de|des|du|d'|en)\\b`).test(long)
}

// Notions dont l'une englobe l'autre (content/commun/notions-liees.json) :
// la définition de l'une est vraie aussi de l'autre.
let _LIEES = null
function notionsLiees(a, b) {
  if (memeNotion(a, b)) return true
  if (!_LIEES) _LIEES = (commun('notions-liees') || []).map(([x, y]) => [cleReponse(x), cleReponse(y)])
  const ka = cleReponse(a)
  const kb = cleReponse(b)
  return _LIEES.some(([x, y]) => (x === ka && y === kb) || (x === kb && y === ka))
}

// Étapes d'un raisonnement (« Faits », « Application », « Conclusion »,
// « Règle de droit (majeure) »…) : ce ne sont pas des notions à définir.
const ETAPES_METHODE = new Set(['faits', 'enonce', 'application', 'conclusion', 'qualification', 'solution', 'probleme', 'probleme juridique', 'probleme de droit', 'question', 'question de droit', 'regle', 'reponse', 'analyse', 'situation', 'corrige'])
function estEtapeMethode(terme) {
  if (/\((majeure|mineure)\)/i.test(terme)) return true
  return ETAPES_METHODE.has(cleReponse(String(terme).replace(/\([^)]*\)/g, ' ')))
}

// Construit un QCM à partir de paires { q (énoncé), a (bonne réponse), e }.
// Les mauvaises réponses (distracteurs) sont tirées des AUTRES réponses de la
// même section → l'exercice reste propre au chapitre.
// exclut(p, a) : vrai si la réponse a ne peut pas servir de distracteur pour p
// (notion liée : elle serait aussi juste).
function qcmFromPairs(pairs, id, title, exclut = null) {
  const answers = [...new Set(pairs.map((p) => p.a).filter((a) => a && a.length))]
  if (answers.length < 2) return null
  const questions = shuffle(pairs)
    .slice(0, 8)
    .map((p) => {
      const distractors = shuffle(answers.filter((a) => a !== p.a && !(exclut && exclut(p, a)))).slice(0, 3)
      const choices = shuffle([p.a, ...distractors])
      return { q: p.q, choices, answer: choices.indexOf(p.a), explain: p.e || `${p.q} → ${p.a}` }
    })
    .filter((q) => q.choices.length >= 2 && q.answer >= 0)
  return questions.length ? { id, type: 'qcm', title, icon: '❓', questions } : null
}

// Génère des « textes à trous » à partir des termes en gras des paragraphes /
// puces de la SECTION (on masque le terme mis en valeur dans sa phrase). Les
// longues phrases sont réduites à une fenêtre de contexte autour du trou.
function trouFromBold(sec, themeId) {
  const out = []
  const seen = new Set()
  const addFrom = (text) => {
    for (const sRaw of phrases(text)) {
      const bm = sRaw.match(/\*\*(.+?)\*\*/)
      if (!bm) continue
      const term = bm[1].trim()
      if (term.length < 3 || term.length > 45 || /^\d+$/.test(term)) continue
      // Une étiquette (« Énoncé. », « Qualification : », « **Conclusion** : »)
      // n'est pas un mot à trouver.
      if (/[.:;!?]$/.test(term) || estEtapeMethode(term)) continue
      // Clarté : un « trou » ne doit masquer qu'UNE notion. On écarte les
      // fragments de phrase (plus de 4 mots) et les mnémotechniques « X = Y »
      // ou « X : Y », qui rendent la réponse impossible à deviner proprement.
      if (term.split(/\s+/).length > 4 || /[=:]/.test(term)) continue
      const key = term.toLowerCase()
      if (seen.has(key)) continue
      const plain = stripMd(sRaw).replace(/\s+/g, ' ').trim()
      if (plain.length < 15) continue
      const at = plain.indexOf(term)
      if (at < 0) continue
      let text2
      if (plain.length <= 180) {
        text2 = plain.slice(0, at) + '____' + plain.slice(at + term.length)
      } else {
        // Fenêtre de contexte : ~100 caractères avant / ~70 après le trou.
        let start = Math.max(0, at - 100)
        let end = Math.min(plain.length, at + term.length + 70)
        if (start > 0) { const sp = plain.indexOf(' ', start); if (sp > -1 && sp < at) start = sp + 1 }
        if (end < plain.length) { const sp = plain.lastIndexOf(' ', end); if (sp > at + term.length) end = sp }
        text2 = (start > 0 ? '… ' : '') + plain.slice(start, at) + '____' + plain.slice(at + term.length, end) + (end < plain.length ? ' …' : '')
      }
      if (!text2.includes('____')) continue
      // Assez de contexte pour deviner le mot : au moins 5 mots autour du trou
      // (« Qualification : ____. » ou « Au-delà → ____. » ne se comprennent pas seuls).
      const contexte = text2.replace('____', ' ').split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w))
      if (contexte.length < 5) continue
      seen.add(key)
      out.push({ text: text2, answer: term, alt: reponsesAcceptees(term, themeId), explain: `Le mot manquant : « ${term} ».` })
    }
  }
  for (const b of sec.blocks || []) {
    if (['p', 'tip', 'warning', 'example'].includes(b.t) && b.c) addFrom(b.c)
    if (b.t === 'list' && Array.isArray(b.c)) for (const it of b.c) addFrom(it)
  }
  if (Array.isArray(sec.points)) for (const it of sec.points) addFrom(it)
  return out
}

// Un tableau à 2 colonnes est-il une VRAIE table « terme → définition » (→ bon
// pour définitions clés, flashcards, QCM notions) ou une COMPARAISON de deux
// colonnes parallèles (atouts / risques, interne / externe, actif / passif,
// avant / après…) ? Une comparaison ne doit JAMAIS devenir une paire
// terme→définition : cela fabrique de fausses définitions (« un atout » : « un
// risque »). On la détecte pour la transformer plutôt en exercice de tri.
const _accents = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
const _norm = (s) => _accents(stripMd(String(s || ''))).toLowerCase().trim()
const CONTRAST_RE = /\b(risques?|limites?|inconv[ée]nients?|freins?|menaces?|faiblesses?|greenwashing|d[ée]rives?)\b/i
const OPP_LEFT_RE = /^(atouts?|avantages?|forces?|opportunit[ée]s?|mobiles?|emplois?|actif|interne|b[ée]n[ée]fices?|points? forts?)\b/
const OPP_RIGHT_RE = /^(risques?|limites?|inconv[ée]nients?|freins?|menaces?|faiblesses?|ressources?|passif|externe|greenwashing|points? faibles?)\b/
const _STOP2 = new Set(['avec', 'dans', 'pour', 'cette', 'leur', 'sont', 'plus', 'type', 'types', 'selon', 'entre', 'quoi', 'chez'])
function twoColKind(head) {
  const h0 = _norm((head || [])[0])
  const h1 = _norm((head || [])[1])
  if (!h0 || !h1) return 'def'
  // 1) Vraie définition (priorité) : l'entête l'annonce explicitement.
  if (/definition|\bsens\b|signif|designe|veut dire|c.?est quoi/.test(h1)) return 'def'
  if (/\bnotion|\bterme|\bmot\b|concept|vocabulaire|sigle|acronyme/.test(h0)) return 'def'
  // Application à un cas (« Condition | Ici ») ou caractéristique (« Forme |
  // Responsabilité ») : la colonne de droite n'est pas une définition.
  if (/^(ici|en l.espece|dans (ce|le|notre) cas|application|cas|exemples?|illustrations?|responsabilite|patrimoine|capital|associes?|regime|duree|delai|montant|taux|sanctions?|consequences?|effets?)\b/.test(h1)) return 'case'
  // 2) Comparaison : marqueur de contraste, opposition gauche↔droite, entête
  //    temporel « avant / après », ou mot fort commun aux deux titres.
  if (CONTRAST_RE.test(h0) || CONTRAST_RE.test(h1)) return 'compare'
  if (OPP_LEFT_RE.test(h0) && OPP_RIGHT_RE.test(h1)) return 'compare'
  if (/^avant\b/.test(h0) && /^(apres|avec|aujourd|maintenant|desormais|depuis)/.test(h1)) return 'compare'
  const toks0 = new Set(h0.split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !_STOP2.has(w)))
  if (h1.split(/[^a-z0-9]+/).some((w) => w.length >= 4 && !_STOP2.has(w) && toks0.has(w))) return 'compare'
  return 'def'
}

// Extrait toutes les « matières premières » exploitables d'une section :
// paires de dates, paires notion→définition, lignes de tableaux larges, et
// tableaux de comparaison (deux colonnes parallèles). Sert de base à TOUS les
// exercices générés du chapitre.
// Une chaîne n'est-elle qu'une date / un repère chronologique (année, période,
// date complète) ? Sert à ne PAS transformer un repère de date en « définition »
// (« Plan Marshall : 1947 » n'est pas une définition mais une date).
function isBareDate(s) {
  const t = String(s || '').trim()
  if (!t || t.length > 28) return false
  return /^(vers\s+|env\.?\s+|~|avant\s+|apr[èe]s\s+|d[èe]s\s+)?-?\d{3,4}(\s*[-–—/]\s*\d{2,4})?$/i.test(t)
    || /^(\d{1,2}(er)?\s+)?[a-zàâéèêîïôûçäëüö]+\s+-?\d{3,4}$/i.test(t)
    || /^(le\s+)?\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}$/.test(t)
}

function sectionPairs(sec) {
  const blocks = sec.blocks || []
  const isDateHead = (h) => /date|année|chronolog/i.test(h || '')
  const datePairs = [] // { d, e }
  const defPairs = []  // { term, def }
  const widePairs = [] // { q, a, e }
  const compareTables = [] // { labelA, labelB, itemsA, itemsB }
  for (const b of blocks) {
    if (b.t === 'table' && isDateHead((b.head || [])[0])) {
      for (const r of b.rows || []) if (r[0] && r[1]) datePairs.push({ d: stripMd(String(r[0])), e: stripMd(String(r[1])) })
    } else if (b.t === 'frise') {
      for (const e of b.events || []) if (e.date && e.label) datePairs.push({ d: stripMd(e.date), e: stripMd(e.label) })
    } else if (b.t === 'table' && (b.head || []).length === 2 && !isDateHead((b.head || [])[0])) {
      const kind = twoColKind(b.head)
      if (kind === 'case') continue
      if (kind === 'compare') {
        const labelA = stripMd(String((b.head || [])[0] || ''))
        const labelB = stripMd(String((b.head || [])[1] || ''))
        const itemsA = []
        const itemsB = []
        for (const r of b.rows || []) {
          const a = stripMd(String(r[0] || ''))
          const c = stripMd(String(r[1] || ''))
          if (a) itemsA.push(a)
          if (c) itemsB.push(c)
        }
        if (labelA && labelB && itemsA.length && itemsB.length) compareTables.push({ labelA, labelB, itemsA, itemsB })
      } else {
        for (const r of b.rows || []) {
          const term = stripMd(String(r[0] || ''))
          const def = stripMd(String(r[1] || ''))
          if (term && def && term.length <= 60) defPairs.push({ term, def })
        }
      }
    } else if (b.t === 'table') {
      const w = (b.head || []).length
      if (w >= 3 && w <= 4 && !isDateHead((b.head || [])[0])) {
        const label = stripMd(String((b.head || [])[0] || ''))
        for (const r of b.rows || []) {
          const entry = stripMd(String(r[0] || ''))
          const rest = r.slice(1).map((x) => stripMd(String(x || ''))).filter(Boolean).join(' — ')
          if (entry && rest && entry.length <= 40) widePairs.push({ q: `${label ? label + ' — ' : ''}« ${entry} » : ?`, a: rest, e: `${entry} → ${rest}` })
        }
      }
    }
  }
  // notion → définition à partir des puces « **terme** : définition ».
  const notionItems = []
  for (const b of blocks) if (b.t === 'list' && Array.isArray(b.c)) notionItems.push(...b.c)
  if (Array.isArray(sec.points)) notionItems.push(...sec.points)
  for (const item of notionItems) {
    const s = String(item)
    if (!s.includes('**')) continue
    const m = s.match(/^(.{3,60}?)\s*[:—–]\s+(.+)$/)
    if (!m) continue
    // « 5. La mineure » → « La mineure » : le numéro de liste n'est pas la notion.
    const term = stripMd(m[1]).replace(/[;,.]$/, '').replace(/^\d+\s*[.)]\s*/, '').trim()
    const def = stripMd(m[2]).replace(/[;.]$/, '').trim()
    if (estEtapeMethode(term)) continue
    if (term && def.length > 3 && term.length <= 50) defPairs.push({ term, def })
  }
  // Un « repère chronologique » n'est pas une définition : si le terme OU la
  // définition n'est qu'une date, on bascule la paire vers les dates (elle
  // alimentera un QCM de dates, pas un QCM de notions). Évite « Plan Marshall :
  // 1947 » présenté comme une définition, et les années parasites en distracteurs.
  for (let i = defPairs.length - 1; i >= 0; i--) {
    const p = defPairs[i]
    if (isBareDate(p.def)) { datePairs.push({ d: p.def, e: p.term }); defPairs.splice(i, 1) }
    else if (isBareDate(p.term)) { datePairs.push({ d: p.term, e: p.def }); defPairs.splice(i, 1) }
  }
  // Dédoublonnage des définitions (même notion sous deux libellés).
  const uniqDefs = []
  for (const p of defPairs) if (!uniqDefs.some((u) => memeNotion(u.term, p.term))) uniqDefs.push(p)
  return { datePairs, defPairs: uniqDefs, widePairs, compareTables }
}

// Fabrique un exercice « à écrire » (type saisie) à partir d'items
// { prompt, answer, alt?, explain }. Réponses courtes uniquement (saisissables).
// À partir d'un terme (« PGI / ERP », « Système d'information (SIG) »), dérive
// les réponses acceptées en plus du terme complet : chaque variante séparée par
// « / » ou « ou », et l'acronyme entre parenthèses. Ainsi « PGI » seul est
// accepté quand la réponse attendue est « PGI / ERP ». (On ne découpe jamais sur
// « , » ni sur les chiffres pour ne pas casser les dates ou les nombres.)
function termVariants(term) {
  const raw = String(term || '').trim()
  if (!raw) return []
  const out = new Set()
  const push = (s) => {
    const v = String(s || '').replace(/\s+/g, ' ').replace(/[;,.]+$/, '').trim()
    if (v && v.toLowerCase() !== raw.toLowerCase()) out.add(v)
  }
  push(raw.replace(/\s*\([^)]*\)/g, ' ')) // le terme sans ses parenthèses
  for (const part of raw.split(/\s*(?:\/| ou )\s*/i)) {
    push(part.replace(/\s*\([^)]*\)/g, ' ')) // « PGI (ERP) » → « PGI »
    const m = part.match(/\(([^)]+)\)/) // acronyme entre parenthèses → « ERP »
    if (m) push(m[1])
  }
  return [...out]
}

// « Écris le terme » ne doit demander qu'UN terme précis, pas une phrase : on
// écarte les réponses de plus de 4 mots, les citations « … » et les fragments
// (« De la naissance à la mort », « On cherche à réduire le coût »…).
function isCleanTerm(term) {
  const t = String(term || '').trim()
  if (!t || t.length > 32) return false
  if (/[«»"]/.test(t)) return false
  if (t.split(/\s+/).length > 4) return false
  return true
}

// Abrège une définition pour l'association sans finir sur un mot vide (article,
// préposition) : « …au crédit d'un autre, pour un… » → « …au crédit d'un autre… ».
function shortenDef(def, max = 90) {
  const d = String(def || '')
  if (d.length <= max) return d
  let s = d.slice(0, max - 2).replace(/\s\S*$/, '')
  s = s.replace(/[\s,;:.–—-]+(l’|d’|de|des|du|le|la|les|un|une|à|au|aux|et|ou|en|pour|sur|dans|par|avec|qui|que|se|sa|son|ses|ce|cet|cette|leur)$/i, '')
  return s.replace(/[\s,;:–—-]+$/, '') + '…'
}

function saisieFromItems(items, id, title, icon = '⌨️') {
  const qs = shuffle(items)
    .filter((x) => x.answer && String(x.answer).trim().length > 0 && String(x.answer).length <= 40)
    .slice(0, 10)
  return qs.length >= 2 ? { id, type: 'saisie', title, icon, questions: qs } : null
}

// Vrai / Faux à partir des définitions : une moitié d'affirmations vraies, une
// moitié fausses (le terme est associé à une AUTRE définition de la section).
function vraiFauxFromDefs(defPairs, id, title) {
  if (defPairs.length < 4) return null
  const pool = shuffle(defPairs)
  const qs = []
  pool.slice(0, 8).forEach((p, k) => {
    if (k % 2 === 0) {
      qs.push({ statement: `« ${p.term} » : ${p.def}`, answer: true, explain: `Exact. ${p.term} → ${p.def}` })
    } else {
      // L'autre définition ne doit pas être vraie aussi pour ce terme (notion liée).
      const other = pool.find((o) => o.term !== p.term && o.def !== p.def && !notionsLiees(o.term, p.term))
      if (other) qs.push({ statement: `« ${p.term} » : ${other.def}`, answer: false, explain: `Faux. ${p.term} → ${p.def}` })
    }
  })
  return qs.length >= 4 ? { id, type: 'vraifaux', title, icon: '⚖️', questions: shuffle(qs) } : null
}

// Remise en ordre chronologique à partir de repères datés (années lisibles).
function ordreFromDates(datePairs, id, title) {
  const parsed = datePairs
    .map((p) => ({ y: parseInt(String(p.d).match(/-?\d{3,4}/)?.[0] ?? 'NaN', 10), d: p.d, e: p.e }))
    .filter((x) => !Number.isNaN(x.y) && x.e)
  const seen = new Set()
  const uniq = parsed.filter((x) => { if (seen.has(x.y)) return false; seen.add(x.y); return true })
  if (uniq.length < 4) return null
  const sorted = [...uniq].sort((a, b) => a.y - b.y).slice(0, 6)
  return { id, type: 'ordre', title, icon: '📶', steps: sorted.map((x) => `${x.d} — ${x.e}`) }
}

// Reformulations variées d'une même question « notion → définition » : d'un
// exercice à l'autre, l'élève ne relit plus exactement la même phrase.
const QDEF_TEMPLATES = [
  (term) => `Que signifie : « ${term} » ?`,
  (term) => `Quelle est la bonne définition de « ${term} » ?`,
  (term) => `« ${term} » : quelle proposition est correcte ?`,
  (term) => `À quoi correspond « ${term} » ?`,
]

// Élargit le pool de notions d'une section : ses définitions propres + la banque
// du thème (décalée selon la section), dédoublonnées par terme. On ne recycle
// plus les 5 mêmes définitions : le pool est bien plus large, et comme chaque
// exercice mélange puis tronque ce pool à chaque visite, le contenu change.
function enrichedDefPool(defPairs, themeId, idx) {
  const bank = (THEME_TERMS[themeId] || []).map(([term, def]) => ({ term, def }))
  const start = bank.length ? (idx * 3) % bank.length : 0
  const rotated = [...bank.slice(start), ...bank.slice(0, start)]
  const out = []
  for (const p of [...defPairs, ...rotated]) {
    if (!p.term || !p.def || out.some((o) => memeNotion(o.term, p.term))) continue
    out.push({ term: p.term, def: p.def })
  }
  return out
}

// Génère un ENSEMBLE d'exercices propres au chapitre (jamais de flashcard),
// tirés du contenu de SA section ET de la banque de notions du thème. Objectif :
// beaucoup d'exercices ET du contenu varié (plusieurs formes de questions, cas
// concrets). Chaque exercice a un id stable et distinct (pour la progression) ;
// le contenu, lui, est mélangé/tronqué à chaque partie — jamais deux fois le même.
function sectionExercises(sec, theme, idx) {
  const base = `${theme.id}::${idx}`
  const { datePairs, defPairs, widePairs, compareTables } = sectionPairs(sec)
  const richDefs = enrichedDefPool(defPairs, theme.id, idx)
  const out = []
  const uniqEvents = [...new Set(datePairs.map((p) => p.e))]

  // 1) QCM des dates + « écris la date » + remise en ordre chronologique.
  if (datePairs.length >= 3 && uniqEvents.length >= 3) {
    const qDate = qcmFromPairs(datePairs.map((p) => ({ q: `Que se passe-t-il en ${p.d} ?`, a: p.e, e: `${p.d} : ${p.e}` })), `${base}::qdate`, 'QCM — les dates du chapitre')
    if (qDate && qDate.questions.length >= 3) out.push(qDate)
    const sDate = saisieFromItems(datePairs.filter((p) => String(p.d).length <= 24).map((p) => ({ prompt: `À quelle date : ${p.e} ?`, answer: p.d, explain: `${p.e} → ${p.d}` })), `${base}::sdate`, 'Écris la date — ce chapitre', '📅')
    if (sDate) out.push(sDate)
    const ord = ordreFromDates(datePairs, `${base}::ordre`, 'Remets dans l’ordre — chronologie')
    if (ord) out.push(ord)
  }

  // 2) Notions : pool élargi (section + banque du thème). Plusieurs formes de
  //    questions, mélangées/tronquées à chaque visite → jamais le même contenu :
  //    QCM « notion → définition » (formulé de plusieurs façons), « cas concret »
  //    (situation → notion, sens inverse), vrai/faux, écris le terme, association.
  if (richDefs.length >= 2) {
    // QCM notion → définition, avec une formulation qui tourne d'un item à l'autre.
    const defItems = shuffle(richDefs).map((p, i) => ({ q: QDEF_TEMPLATES[i % QDEF_TEMPLATES.length](p.term), a: p.def, e: `${p.term} → ${p.def}`, term: p.term }))
    // Une définition ne sert pas de distracteur à une notion liée (elle serait juste aussi).
    const termeDeDef = new Map(richDefs.map((p) => [p.def, p.term]))
    const exclutDef = (p, a) => notionsLiees(p.term, termeDeDef.get(a) || '')
    if (defItems.length >= 10) {
      const half = Math.ceil(defItems.length / 2)
      const qa = qcmFromPairs(defItems.slice(0, half), `${base}::qdef0`, 'QCM — notions (série 1)', exclutDef)
      const qb = qcmFromPairs(defItems.slice(half), `${base}::qdef1`, 'QCM — notions (série 2)', exclutDef)
      if (qa && qa.questions.length >= 3) out.push(qa)
      if (qb && qb.questions.length >= 3) out.push(qb)
    } else {
      const qDef = qcmFromPairs(defItems, `${base}::qdef`, 'QCM — les notions du chapitre', exclutDef)
      if (qDef && qDef.questions.length >= 3) out.push(qDef)
    }

    // Cas concret : on décrit une situation (la définition) et l'élève retrouve
    // la bonne notion parmi plusieurs — l'inverse du QCM précédent.
    const casItems = richDefs.map((p) => ({ q: `Cas concret — on observe : « ${p.def} ». De quelle notion s'agit-il ?`, a: p.term, e: `${p.term} : ${p.def}` }))
    const qCas = qcmFromPairs(casItems, `${base}::qcas`, 'Cas concrets — trouve la notion', (p, a) => notionsLiees(p.a, a))
    if (qCas && qCas.questions.length >= 3) { qCas.icon = '🧩'; out.push(qCas) }

    const vf = vraiFauxFromDefs(richDefs, `${base}::vf`, 'Vrai ou faux — les notions')
    if (vf) out.push(vf)

    const shortTerms = richDefs.filter((p) => isCleanTerm(p.term))
    const sTerm = saisieFromItems(shortTerms.map((p) => ({ prompt: `Quel terme correspond à cette définition ?\n« ${p.def} »`, answer: p.term, alt: [...termVariants(p.term), ...reponsesAcceptees(p.term, theme.id)], explain: `${p.term} : ${p.def}` })), `${base}::sterm`, 'Écris le terme — ce chapitre', '🔤')
    if (sTerm) out.push(sTerm)

    if (richDefs.length >= 3) {
      // Association notion ↔ définition (définitions abrégées pour tenir à l'écran).
      // Jamais deux notions liées dans la même association.
      const rseen = new Set()
      const pairs = shuffle(richDefs)
        .filter((p, i, tous) => !tous.slice(0, i).some((q) => notionsLiees(q.term, p.term)))
        .map((p) => ({ left: p.term, right: shortenDef(p.def, 90) }))
        .filter((p) => { const k = p.right.toLowerCase(); if (rseen.has(k)) return false; rseen.add(k); return true })
        .slice(0, 6)
      if (pairs.length >= 3) out.push({ id: `${base}::assoc`, type: 'association', title: 'Association — notions du chapitre', icon: '🔗', pairs })
    }
  }

  // 3) QCM à partir d'un tableau large (3-4 colonnes).
  const qWide = qcmFromPairs(widePairs, `${base}::qwide`, 'QCM — tableau du chapitre')
  if (qWide && qWide.questions.length >= 3) out.push(qWide)

  // 4) Textes à trous : découpés en plusieurs lots + une version « à écrire ».
  const trou = trouFromBold(sec, theme.id)
  if (trou.length >= 2) {
    const batches = []
    for (let k = 0; k < trou.length; k += 6) batches.push(trou.slice(k, k + 6))
    batches.slice(0, 3).forEach((b, bi) => {
      if (b.length >= 2) out.push({ id: `${base}::trou${bi}`, type: 'trou', title: batches.length > 1 ? `Texte à trous — série ${bi + 1}` : 'Texte à trous — ce chapitre', icon: '✏️', questions: b })
    })
    const sTrou = saisieFromItems(trou.map((q) => ({ prompt: `Complète par le mot exact :\n${q.text}`, answer: q.answer, alt: q.alt, explain: q.explain })), `${base}::strou`, 'Complète — à écrire', '✍️')
    if (sTrou) out.push(sTrou)
  }

  // 5) Tri (classification) à partir des tableaux de COMPARAISON du cours (deux
  //    colonnes parallèles : atouts / risques, interne / externe, actif / passif,
  //    avant / après…). Ces tableaux ne deviennent jamais des définitions ; on en
  //    fait un exercice où l'élève range chaque élément dans la bonne colonne.
  const clean = (t) => stripMd(String(t || '')).replace(/\s+/g, ' ').trim()
  compareTables.forEach((ct, ci) => {
    const a = [...new Set(ct.itemsA.map(clean))].filter((t) => t.length >= 2 && t.length <= 70).slice(0, 4)
    const b = [...new Set(ct.itemsB.map(clean))].filter((t) => t.length >= 2 && t.length <= 70).slice(0, 4)
    if (a.length < 2 || b.length < 2) return
    const labelA = shortenDef(clean(ct.labelA), 42)
    const labelB = shortenDef(clean(ct.labelB), 42)
    if (labelA.toLowerCase() === labelB.toLowerCase()) return
    const items = shuffle([...a.map((t) => ({ text: t, cat: 'a' })), ...b.map((t) => ({ text: t, cat: 'b' }))])
    out.push({
      id: `${base}::tri${ci}`,
      type: 'tri',
      title: `Tri — ${labelA} ou ${labelB} ?`,
      icon: '🗂️',
      instruction: 'Classe chaque élément dans la bonne colonne.',
      categories: [{ id: 'a', label: labelA }, { id: 'b', label: labelB }],
      items,
    })
  })

  return out
}

// Flashcards d'une section (recto = terme, verso = définition). RÉSERVÉ à
// l'application installée : on ne les ajoute JAMAIS dans le navigateur. Les
// cartes sont mélangées à chaque partie par le composant.
export function flashcardsForSection(sec, theme, idx) {
  const { defPairs, datePairs } = sectionPairs(sec)
  const cards = []
  // Pool élargi (section + banque du thème) pour des cartes variées d'une visite
  // à l'autre, pas seulement les quelques définitions de la section.
  for (const p of enrichedDefPool(defPairs, theme.id, idx)) cards.push({ front: p.term, back: p.def })
  for (const p of datePairs) cards.push({ front: p.e, back: p.d })
  if (cards.length < 3) return null
  // Dédoublonnage recto.
  const seen = new Set()
  const uniq = cards.filter((c) => { const k = String(c.front).toLowerCase(); if (!c.front || seen.has(k)) return false; seen.add(k); return true })
  if (uniq.length < 3) return null
  return { id: `${theme.id}::${idx}::cards`, type: 'flashcard', title: 'Flashcards — ce chapitre', icon: '🃏', cards: uniq.slice(0, 16) }
}

// Paquet de flashcards agrégé pour TOUT un thème (toutes ses sections), à
// télécharger en un clic dans l'espace « Révision » (application installée).
export function deckForTheme(themeId) {
  const theme = ALL_CHAPTERS[themeId]
  if (!theme) return null
  const seen = new Set()
  const cards = []
  for (const ch of themeChapters(theme)) {
    const fc = flashcardsForSection(ch.section, theme, ch.idx)
    if (!fc) continue
    for (const c of fc.cards) {
      const k = String(c.front || '').toLowerCase().trim()
      if (!k || seen.has(k)) continue
      seen.add(k); cards.push({ front: c.front, back: c.back })
    }
  }
  if (cards.length < 3) return null
  return { id: `${themeId}::deck`, title: theme.short || theme.name, subjectId: theme.subjectId, themeId, color: theme.color, cards: cards.slice(0, 150) }
}

// Paquet agrégé pour TOUTE une matière (tous ses thèmes).
export function deckForSubject(subjectId) {
  const subj = getSubject(subjectId)
  if (!subj) return null
  const seen = new Set()
  const cards = []
  for (const th of subj.chapters || []) {
    const d = deckForTheme(th.id)
    if (!d) continue
    for (const c of d.cards) {
      const k = String(c.front || '').toLowerCase().trim()
      if (!k || seen.has(k)) continue
      seen.add(k); cards.push(c)
    }
  }
  if (cards.length < 3) return null
  return { id: `${subjectId}::deck`, title: subj.name, subjectId, themeId: null, color: subj.color, cards: cards.slice(0, 400) }
}

// Une section a-t-elle déjà un encadré « Définitions clés » écrit à la main ?
// (pour ne pas en afficher un second, généré, juste en dessous).
function hasHandDefinitions(sec) {
  for (const b of sec.blocks || []) {
    if (b.t === 'p' && /d[ée]finitions?\s+cl[ée]s/i.test(stripMd(b.c || ''))) return true
    if (b.t === 'table' && (b.head || []).length === 2 && /terme|notion|mot/i.test(String((b.head || [])[0] || '')) && /d[ée]finition|sens/i.test(String((b.head || [])[1] || ''))) return true
  }
  return false
}

// 5 « Définitions clés » pour UNE section de cours : d'abord les termes définis
// dans la section elle-même, complétés (par rotation, pour varier d'une section
// à l'autre) par la banque du thème puis, en dernier recours, la banque de la
// matière. Renvoie { skip, defs }. skip = true si la section a déjà son propre
// encadré de définitions écrit à la main.
export function sectionDefinitions(sec, themeId, subjectId, sectionIdx = 0, count = 5) {
  if (!sec || hasHandDefinitions(sec)) return { skip: true, defs: [] }
  const out = []
  const add = (term, def) => {
    const t = stripMd(String(term || '')).trim()
    const d = stripMd(String(def || '')).trim()
    if (!t || !d || t.length > 48 || out.length >= count || out.some((o) => memeNotion(o.term, t))) return
    out.push({ term: t, def: d })
  }
  // 1) Définitions propres à la section (les plus pertinentes).
  for (const p of sectionPairs(sec).defPairs) add(p.term, p.def)
  // 2) Complément depuis la banque du thème, décalée selon la section.
  const bank = THEME_TERMS[themeId] || []
  if (bank.length && out.length < count) {
    const start = (sectionIdx * 2) % bank.length
    const rotated = [...bank.slice(start), ...bank.slice(0, start)]
    for (const [term, def] of rotated) add(term, def)
  }
  // 3) Dernier filet : banque de la matière.
  if (out.length < count) for (const [term, def] of subjectFallbackFor(subjectId)) add(term, def)
  return { skip: false, defs: out }
}

export function getThemeChapter(themeId, idx) {
  const theme = ALL_CHAPTERS[themeId]
  if (!theme) return null
  const chs = themeChapters(theme)
  return chs[Number(idx)] || null
}

// Construit le « Test du thème » : un mélange de QCM (auto-corrigés),
// de questions à rédiger (dérivées des flashcards) et de cas pratiques
// (dérivés des exemples travaillés du cours). Aucune saisie manuelle :
// tout est reconstruit à partir du contenu existant, pour toutes les matières.
export function buildThemeTest(themeId) {
  const theme = ALL_CHAPTERS[themeId]
  if (!theme) return { qcm: [], redac: [], cas: [] }
  const qcm = []
  const redac = [] // questions à rédiger : { prompt, answer, style }
  for (const g of theme.games || []) {
    if (g.type === 'qcm') {
      for (const q of g.questions) qcm.push({ ...q })
    } else if (g.type === 'vraifaux') {
      for (const q of g.questions)
        qcm.push({ q: q.statement, choices: ['Vrai', 'Faux'], answer: q.answer ? 0 : 1, explain: q.explain })
    } else if (g.type === 'flashcard') {
      for (const c of g.cards) redac.push({ prompt: c.front, answer: c.back, style: 'def' })
    } else if (g.type === 'association') {
      for (const p of g.pairs) redac.push({ prompt: p.left, answer: p.right, style: 'def' })
    } else if (g.type === 'tri') {
      const labels = Object.fromEntries((g.categories || []).map((c) => [c.id, c.label]))
      for (const it of g.items || [])
        redac.push({ prompt: it.text, answer: labels[it.cat] || '', style: 'tri' })
    }
  }
  // Questions « développe ce sous-thème » : à partir de chaque section du
  // cours (intitulé → texte de la section comme corrigé). Garantit des
  // questions à rédiger pour TOUS les thèmes, même sans flashcards.
  const sectionRedac = []
  for (const sec of theme.cours || []) {
    const txt = sectionPlainText(sec)
    if (sec.h && txt.length > 40) sectionRedac.push({ prompt: sec.h, answer: txt, style: 'section' })
  }

  // Assemblage : on garantit quelques questions de développement, puis on
  // complète avec les définitions/classements, en évitant les doublons.
  const seen = new Set()
  const out = []
  const push = (r) => {
    const k = (r.prompt || '').toLowerCase().trim()
    if (!k || !r.answer || seen.has(k)) return
    seen.add(k)
    out.push(r)
  }
  sectionRedac.slice(0, 3).forEach(push)
  shuffle(redac).forEach(push)
  sectionRedac.slice(3).forEach(push)

  // Cas pratiques : l'énoncé d'un exemple sert de sujet, et les blocs qui le
  // suivent dans la section (règle, faits, analyse, conclusion) de corrigé.
  // Les blocs « Majeure », « Conclusion »… sont des étapes du corrigé, pas des sujets.
  const ETAPE_RE = /majeure|mineure|r[èe]gle|faits|application|conclusion|solution|corrig|analyse|m[ée]thode|retenir/i
  const cas = []
  for (const sec of theme.cours || []) {
    const blocks = sec.blocks || []
    blocks.forEach((b, j) => {
      if (b.t !== 'example' || !b.c || ETAPE_RE.test(b.h || '')) return
      const corrige = []
      for (const nb of blocks.slice(j + 1)) {
        if (nb.t === 'example' && !ETAPE_RE.test(nb.h || '')) break
        const txt = nb.t === 'example' ? nb.c : sectionPlainText({ blocks: [nb] })
        if (txt) corrige.push(nb.h ? `**${stripMd(nb.h)}** — ${txt}` : txt)
        if (corrige.length >= 4) break
      }
      const answer = corrige.join('\n\n')
      const prompt = stripMd(String(b.c).replace(/^\s*\*\*[^*]{1,30}[.:]\*\*\s*/, ''))
      if (answer.length >= 60 && prompt.length >= 20) cas.push({ prompt, answer })
    })
  }
  return {
    qcm: shuffle(qcm).slice(0, 8),
    redac: out.slice(0, 10),
    cas: cas.slice(0, 4),
  }
}

// Extrait un texte lisible (avec markdown) d'une section de cours, pour servir
// de corrigé à une question à rédiger. Gère le format « blocks » et l'ancien
// format « points ».
function sectionPlainText(sec) {
  const parts = []
  if (sec.blocks) {
    for (const b of sec.blocks) {
      if (b.t === 'p' || b.t === 'formula' || b.t === 'tip' || b.t === 'warning') parts.push(b.c)
      else if (b.t === 'list') parts.push(b.c.map((x) => '• ' + x).join('\n'))
      else if (b.t === 'table') {
        const head = (b.head || []).filter(Boolean).join(' · ')
        const rows = (b.rows || []).map((r) => '• ' + r.map(String).join(' — ')).join('\n')
        parts.push([head, rows].filter(Boolean).join('\n'))
      }
    }
  } else {
    if (sec.intro) parts.push(sec.intro)
    if (sec.points) parts.push(sec.points.map((x) => '• ' + x).join('\n'))
    if (sec.formula) parts.push(sec.formula)
  }
  return parts.join('\n')
}

// Construit le jeu de questions du Quiz noté d'un chapitre à partir de tous
// les items « qcm » et « vraifaux » présents dans ses mini-jeux.
export function buildQuiz(chapterId) {
  const c = ALL_CHAPTERS[chapterId]
  if (!c) return []
  const out = []
  for (const g of c.games || []) {
    if (g.type === 'qcm') {
      for (const q of g.questions) out.push({ ...q })
    } else if (g.type === 'vraifaux') {
      for (const q of g.questions)
        out.push({
          q: q.statement,
          choices: ['Vrai', 'Faux'],
          answer: q.answer ? 0 : 1,
          explain: q.explain,
        })
    }
  }
  return shuffle(out).slice(0, 10)
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Recherche simple (chapitres + matières + intitulés de jeux/notions).
export function search(query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const res = []
  for (const s of SUBJECTS) {
    if (s.name.toLowerCase().includes(q))
      res.push({ type: 'subject', id: s.id, label: s.name, sub: 'Matière', color: s.color })
    for (const c of s.chapters) {
      const hay = (c.name + ' ' + (c.short || '') + ' ' + (c.keywords || '')).toLowerCase()
      if (hay.includes(q))
        res.push({
          type: 'chapter',
          id: c.id,
          subjectId: s.id,
          label: c.name,
          sub: s.name,
          color: s.color,
        })
    }
  }
  return res.slice(0, 12)
}
