// Mode Scroll : les exercices d'UN chapitre, un par écran, qu'on fait défiler vers le haut. Pas de cours ici :
// uniquement des jeux (phrase à compléter, mot mélangé, A ou B, remise en ordre, association, questions,
// flashcards). Tout vient du cours et des exercices du chapitre, rien n'est inventé ; plusieurs jeux peuvent
// reprendre la même notion sous des formes différentes, ce qui aide à la retenir.
import { ALL_CHAPTERS, themeChapters, flashcardsForSection, termesDuChapitre, masquerMot, melangerPropositions } from './index.js'
import { instancierQuestion } from '../qcmgen.js'

const MAX_CARTES = 100

const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]] } return t }
const sansMd = (t) => String(t || '').replace(/\*\*/g, '')
const reduire = (s, n = 200) => (s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, '')}…`)
const memeLongueur = (terme) => (o) => o.length >= terme.length * 0.4 && o.length <= terme.length * 2.5 + 6
const qcmValide = (q) => q?.q && Array.isArray(q.choices) && q.choices.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length
const versQcm = (q) => ({ type: 'qcm', q: q.q, choix: q.choices, bonne: q.answer, explication: q.explain || '' })

const GRAS = /\*\*([^*]+)\*\*/g
const termesGras = (texte) => [...String(texte || '').matchAll(GRAS)].map((m) => m[1].trim().replace(/[.:;,]+$/, '')).filter((t) => t.length >= 4 && t.length <= 32 && !/\d/.test(t))

// Les phrases du chapitre (paragraphes, listes, astuces, pièges, exemples).
export function phrasesDuChapitre(sec) {
  const textes = []
  for (const b of sec?.blocks || []) {
    if (['p', 'tip', 'warning', 'example'].includes(b.t) && b.c) textes.push(String(b.c))
    else if (b.t === 'list' && Array.isArray(b.c)) textes.push(...b.c.map(String))
  }
  return textes.flatMap((t) => t.split(/(?<=[.!?…])\s+/)).map((x) => x.trim()).filter((x) => x.length >= 30)
}

// « À compléter » : une phrase du cours dont on retire un terme de vocabulaire (en gras dans le cours).
function trousDuCours(sec, termesTheme) {
  const out = []
  const vus = new Map()
  for (const ph of melange(phrasesDuChapitre(sec))) {
    const plain = sansMd(ph)
    if (plain.length > 260) continue
    for (const terme of termesGras(ph)) {
      if ((vus.get(terme.toLowerCase()) || 0) >= 2) continue
      const masque = masquerMot(plain, terme)
      if (!masque || masque.length < 30) continue
      const pieges = melange(termesTheme.filter((o) => o.toLowerCase() !== terme.toLowerCase() && memeLongueur(terme)(o))).slice(0, 3)
      if (pieges.length < 3) continue
      const choix = melange([terme, ...pieges])
      out.push({ type: 'trou', texte: masque, choix, bonne: choix.indexOf(terme), explication: plain })
      vus.set(terme.toLowerCase(), (vus.get(terme.toLowerCase()) || 0) + 1)
      break
    }
  }
  return out
}

function jeuxEcrits(ch, reponsesTrou) {
  const trou = [], tri = [], ordre = [], paires = [], qcm = []
  for (const g of ch.games || []) {
    if (g.type === 'trou') {
      for (const q of g.questions || []) {
        const rep = String(q.answer || '').trim()
        if (!q.text || !rep || !/___/.test(q.text) || rep.length > 30) continue
        const pieges = melange(reponsesTrou.filter((o) => o.toLowerCase() !== rep.toLowerCase() && memeLongueur(rep)(o))).slice(0, 3)
        if (pieges.length < 3) continue
        const choix = melange([rep, ...pieges])
        trou.push({ type: 'trou', texte: sansMd(q.text).replace(/_{3,}/g, '____'), choix, bonne: choix.indexOf(rep), explication: sansMd(q.explain || '') })
      }
    } else if (g.type === 'tri' && (g.categories || []).length === 2) {
      for (const it of g.items || []) {
        if (it?.text && g.categories.some((c) => c.id === it.cat)) tri.push({ type: 'tri', consigne: g.instruction || 'Dans quelle catégorie ?', texte: it.text, categories: g.categories.map((c) => ({ id: c.id, label: c.label })), bonne: it.cat })
      }
    } else if (g.type === 'ordre' && Array.isArray(g.steps) && g.steps.length >= 3 && g.steps.length <= 7) {
      ordre.push({ type: 'ordre', consigne: g.instruction || 'Remets dans l’ordre', etapes: g.steps.map(String), explication: g.explain || '' })
    } else if (g.type === 'association' && Array.isArray(g.pairs)) {
      const ok = melange(g.pairs).filter((p) => p.left && p.right && String(p.left).length <= 40 && String(p.right).length <= 70)
      for (let i = 0; i + 3 <= ok.length && paires.length < 8; i += 3) paires.push({ type: 'paires', paires: ok.slice(i, i + 3).map((p) => ({ g: String(p.left), d: String(p.right) })) })
    } else if (g.type === 'qcm') {
      for (const q of g.questions || []) { try { const x = melangerPropositions(instancierQuestion({ ...q })); if (qcmValide(x)) qcm.push(versQcm(x)) } catch { /* question non instanciable */ } }
    } else if (g.type === 'vraifaux') {
      for (const q of g.questions || []) if (q.statement) qcm.push({ type: 'qcm', q: `Vrai ou faux ?\n${q.statement}`, choix: ['Vrai', 'Faux'], bonne: q.answer ? 0 : 1, explication: q.explain || '' })
    }
  }
  return { trou, tri, ordre, paires, qcm }
}

// Exercices tirés du glossaire : mot mélangé, vrai/faux (une définition juste et une fausse par terme),
// « de quoi parle-t-on ? » (définition → terme) et « que signifie… ? » (terme → définition).
function jeuxDuGlossaire(termes) {
  const mots = [], qcm = []
  const court = (d) => reduire(String(d || ''), 120)
  for (const t of melange(termes)) {
    const mot = sansMd(t.terme).trim()
    if (/^[A-Za-zÀ-ÿ]{5,12}$/.test(mot)) {
      const indice = String(t.def || '').replace(new RegExp(mot, 'gi'), '…')
      if (indice.length >= 20) mots.push({ type: 'mot', mot, indice: reduire(indice) })
    }
    const autres = melange(termes.filter((o) => o.def !== t.def))
    if (!autres.length) continue
    qcm.push({ type: 'qcm', q: `Vrai ou faux ?\n${t.terme} : ${reduire(t.def, 170)}`, choix: ['Vrai', 'Faux'], bonne: 0, explication: `${t.terme} : ${t.def}` })
    qcm.push({ type: 'qcm', q: `Vrai ou faux ?\n${t.terme} : ${reduire(autres[0].def, 170)}`, choix: ['Vrai', 'Faux'], bonne: 1, explication: `${t.terme} : ${t.def}` })
    if (autres.length >= 3) {
      const termes4 = melange([t.terme, ...autres.slice(0, 3).map((o) => o.terme)])
      qcm.push({ type: 'qcm', q: `De quoi parle-t-on ?\n${reduire(t.def, 170)}`, choix: termes4, bonne: termes4.indexOf(t.terme), explication: `${t.terme} : ${t.def}` })
      const defs4 = melange([court(t.def), ...autres.slice(0, 3).map((o) => court(o.def))])
      if (new Set(defs4).size === 4) qcm.push({ type: 'qcm', q: `Que signifie « ${t.terme} » ?`, choix: defs4, bonne: defs4.indexOf(court(t.def)), explication: `${t.terme} : ${t.def}` })
    }
  }
  return { mots, qcm }
}

// Les genres sont étalés régulièrement sur toute la longueur : deux cartes du même genre se suivent le moins possible.
function melanger(piles) {
  const decalage = { trou: 0, jeu: 0.23, flash: 0.41, qcm: 0.6 }
  const cartes = []
  for (const [genre, pile] of Object.entries(piles)) pile.forEach((c, j) => cartes.push({ c, cle: (j + 0.5 + (decalage[genre] || 0)) / pile.length }))
  return cartes.sort((x, y) => x.cle - y.cle).map((x) => x.c)
}

// Répartition visée pour un chapitre de 100 cartes ; une part que le chapitre ne remplit pas profite aux autres genres.
const PARTS = { trou: 0.26, qcm: 0.3, jeu: 0.2, flash: 0.24 }

export function construireFlux(themeId, idx, { max = MAX_CARTES } = {}) {
  const theme = ALL_CHAPTERS[themeId]
  const ch = themeChapters(theme)[Number(idx)]
  if (!theme || !ch) return []
  const nom = ch.title || theme.short || theme.name
  const tous = themeChapters(theme)
  const termesTheme = [...new Set(tous.flatMap((c) => (c.section?.blocks || []).flatMap((b) => [b.c].flat().flatMap(termesGras))))]
  const reponsesTrou = [...new Set(tous.flatMap((c) => (c.games || []).filter((g) => g.type === 'trou').flatMap((g) => (g.questions || []).map((q) => String(q.answer || '').trim()))).filter(Boolean))]
  const termes = termesDuChapitre(ch, theme)
  const ecrits = jeuxEcrits(ch, reponsesTrou)
  const gloss = jeuxDuGlossaire(termes)
  const flashs = (flashcardsForSection(ch.section, theme, ch.idx)?.cards || []).map((x) => ({ type: 'flash', recto: x.front, verso: x.back }))
  const flashTermes = termes.map((t) => ({ type: 'flash', recto: t.terme, verso: t.def }))
  const vusFlash = new Set()
  const flash = [...flashs, ...flashTermes].filter((f) => { const k = String(f.recto).toLowerCase(); if (vusFlash.has(k)) return false; vusFlash.add(k); return true })
  const piles = {
    trou: melange([...trousDuCours(ch.section, termesTheme), ...ecrits.trou]),
    qcm: melange([...ecrits.qcm, ...gloss.qcm]),
    jeu: melange([...ecrits.ordre, ...ecrits.paires, ...ecrits.tri, ...gloss.mots]),
    flash: melange(flash),
  }
  // Water-filling : le genre le moins fourni garde tout, le reste se partage la place.
  const quotas = {}
  let reste = max
  let actifs = Object.keys(PARTS)
  while (actifs.length) {
    const poids = actifs.reduce((n, g) => n + PARTS[g], 0)
    const plein = actifs.find((g) => piles[g].length <= Math.floor((reste * PARTS[g]) / poids))
    if (plein) { quotas[plein] = piles[plein].length; reste -= piles[plein].length; actifs = actifs.filter((g) => g !== plein) } else {
      for (const g of actifs) quotas[g] = Math.floor((reste * PARTS[g]) / poids)
      break
    }
  }
  for (const g of Object.keys(piles)) piles[g] = piles[g].slice(0, quotas[g] ?? piles[g].length)
  return melanger(piles).map((c) => ({ ...c, chapitre: nom }))
}

// Nombre de chapitres d'un thème, pour la page de choix.
export function chapitresDuTheme(themeId) {
  return themeChapters(ALL_CHAPTERS[themeId]).map((c) => ({ idx: c.idx, titre: c.title }))
}
