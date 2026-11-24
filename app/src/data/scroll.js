// Mode Scroll : un chapitre ou un thème transformé en cartes courtes, une par écran, qu'on fait défiler
// vers le haut. Les cartes de cours viennent du cours lui-même (rien n'est inventé) ; une flashcard revient
// toutes les trois cartes et une question éclair toutes les sept.
import { ALL_CHAPTERS, themeChapters, flashcardsForSection, buildQuiz, qcmDesTermes, termesDuChapitre, masquerMot } from './index.js'

const MAX_CARTES = 100
const PAR_SECTION = 10
const LONGUEUR = 230

// Coupe un paragraphe en morceaux de ~230 caractères, à la fin d'une phrase, sans casser un passage en gras.
export function decouper(texte, longueur = LONGUEUR) {
  // Un fragment très court (« Non. », « raffinerie). ») se recolle à la phrase voisine.
  const phrases = []
  for (const ph of String(texte || '').split(/(?<=[.!?…])\s+/).filter(Boolean)) {
    if (phrases.length && (ph.length < 25 || /^[a-zé]/.test(ph) && ph.length < 40)) phrases[phrases.length - 1] += ` ${ph}`
    else phrases.push(ph)
  }
  if (phrases.length > 1 && phrases[0].length < 25) phrases.splice(0, 2, `${phrases[0]} ${phrases[1]}`)
  const morceaux = []
  let cur = ''
  const gras = (s) => (s.match(/\*\*/g) || []).length % 2 === 1
  for (const ph of phrases) {
    const suite = cur ? `${cur} ${ph}` : ph
    if (cur && (suite.length > longueur || gras(cur)) && !gras(cur)) { morceaux.push(cur); cur = ph } else cur = suite
  }
  if (cur) morceaux.push(cur)
  return morceaux
}

const reduire = (s, n = 320) => (s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, '')}…`)

function cartesDeSection(sec, chapitre) {
  const cartes = []
  const ajouter = (c) => { if (cartes.length < PAR_SECTION) cartes.push({ ...c, chapitre }) }
  for (const b of sec?.blocks || []) {
    if (cartes.length >= PAR_SECTION) break
    if (b.t === 'p') for (const m of decouper(b.c).slice(0, 3)) ajouter({ type: 'cours', texte: m })
    else if (b.t === 'list') for (const it of (b.c || []).slice(0, 4)) ajouter({ type: 'cours', texte: reduire(String(it)) })
    else if (b.t === 'formula') ajouter({ type: 'formule', texte: String(b.c || '') })
    else if (b.t === 'warning') ajouter({ type: 'piege', texte: reduire(String(b.c || '')) })
    else if (b.t === 'tip') ajouter({ type: 'astuce', texte: reduire(String(b.c || '')) })
    else if (b.t === 'example') ajouter({ type: 'exemple', titre: b.h || 'Exemple', texte: reduire(String(b.c || ''), 360) })
  }
  return cartes.filter((c) => c.texte && c.texte.trim())
}

const versQcm = (q, chapitre) => ({ type: 'qcm', q: q.q, choix: q.choices, bonne: q.answer, explication: q.explain || '', chapitre })
const qcmValide = (q) => q?.q && Array.isArray(q.choices) && q.choices.length >= 2 && Number.isInteger(q.answer) && q.answer < q.choices.length

const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]] } return t }
const sansMd = (t) => String(t || '').replace(/\*\*/g, '')
const memeLongueur = (terme) => (o) => o.length >= terme.length * 0.4 && o.length <= terme.length * 2.5 + 6

// « À compléter » : une phrase du cours dont on a retiré un terme de vocabulaire (en gras dans le cours) ;
// les autres termes en gras du thème servent de pièges.
function trousDuCours(cours, termesTheme, chapitre, max = 3) {
  const out = []
  for (const c of cours) {
    if (out.length >= max) break
    if (c.type !== 'cours') continue
    const gras = [...c.texte.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim().replace(/[.:;,]+$/, '')).filter((t) => t.length >= 4 && t.length <= 32)
    const plain = sansMd(c.texte)
    for (const terme of gras) {
      const masque = masquerMot(plain, terme)
      if (!masque || masque.length < 40) continue
      const pieges = melange(termesTheme.filter((o) => o.toLowerCase() !== terme.toLowerCase() && memeLongueur(terme)(o))).slice(0, 3)
      if (pieges.length < 3) continue
      const choix = melange([terme, ...pieges])
      out.push({ type: 'trou', texte: masque, choix, bonne: choix.indexOf(terme), explication: plain, chapitre })
      break
    }
  }
  return out
}

// Les jeux écrits pour le chapitre (textes à trous, tri, remise en ordre, association) en cartes à jouer du pouce.
function jeuxDuChapitre(ch, reponsesTrou, chapitre) {
  const out = []
  for (const g of ch.games || []) {
    if (g.type === 'trou') {
      for (const q of (g.questions || []).slice(0, 3)) {
        const rep = String(q.answer || '').trim()
        if (!q.text || !rep || !/___/.test(q.text) || rep.length > 30) continue
        const pieges = melange(reponsesTrou.filter((o) => o.toLowerCase() !== rep.toLowerCase() && memeLongueur(rep)(o))).slice(0, 3)
        if (pieges.length < 3) continue
        const choix = melange([rep, ...pieges])
        out.push({ type: 'trou', texte: q.text.replace(/_{3,}/g, '____'), choix, bonne: choix.indexOf(rep), explication: q.explain || '', chapitre })
      }
    } else if (g.type === 'tri' && (g.categories || []).length === 2) {
      for (const it of melange(g.items || []).slice(0, 3)) {
        if (it?.text && g.categories.some((c) => c.id === it.cat)) out.push({ type: 'tri', consigne: g.instruction || 'Dans quelle catégorie ?', texte: it.text, categories: g.categories.map((c) => ({ id: c.id, label: c.label })), bonne: it.cat, chapitre })
      }
    } else if (g.type === 'ordre' && Array.isArray(g.steps) && g.steps.length >= 3 && g.steps.length <= 7) {
      out.push({ type: 'ordre', consigne: g.instruction || 'Remets dans l’ordre', etapes: g.steps.map(String), explication: g.explain || '', chapitre })
    } else if (g.type === 'association' && Array.isArray(g.pairs) && g.pairs.length >= 3) {
      const paires = melange(g.pairs).filter((p) => p.left && p.right && String(p.left).length <= 40 && String(p.right).length <= 70).slice(0, 3)
      if (paires.length === 3) out.push({ type: 'paires', paires: paires.map((p) => ({ g: String(p.left), d: String(p.right) })), chapitre })
    }
  }
  return out
}

// « Mot mélangé » : les lettres d'un terme du glossaire dans le désordre, sa définition en indice.
function motsMelanges(termes, chapitre, max = 2) {
  const out = []
  for (const t of melange(termes)) {
    if (out.length >= max) break
    const mot = sansMd(t.terme).trim()
    if (!/^[A-Za-zÀ-ÿ]{5,12}$/.test(mot)) continue
    const indice = String(t.def || '').replace(new RegExp(mot, 'gi'), '…')
    if (indice.length < 20) continue
    out.push({ type: 'mot', mot, indice: reduire(indice, 200), chapitre })
  }
  return out
}

// Un chapitre : chaque genre de carte est étalé régulièrement sur toute la longueur, pour que deux cartes du même
// genre se suivent le moins possible (le cours reste la trame, les jeux et questions s'y glissent).
function melanger(piles) {
  const decalage = { cours: 0, trou: 0.13, jeu: 0.29, flash: 0.41, qcm: 0.53 }
  const cartes = []
  for (const [genre, pile] of Object.entries(piles)) pile.forEach((c, j) => cartes.push({ c, cle: (j + 0.5 + (decalage[genre] || 0)) / pile.length }))
  return cartes.sort((x, y) => x.cle - y.cle).map((x) => x.c)
}

// Les cartes d'un thème (une centaine au plus), chapitre après chapitre : le cours d'abord, avec des jeux, des
// flashcards et des questions intercalés. Les questions du thème entier (QCM, vrai/faux) sont réparties entre les
// chapitres. Au-delà de `max`, on retire d'abord les cartes de cours en trop, puis les questions et les flashcards, dans
// le chapitre le plus chargé : tous les chapitres restent représentés, et les jeux sont gardés en priorité.
export function construireFlux(themeId, { max = MAX_CARTES } = {}) {
  const theme = ALL_CHAPTERS[themeId]
  if (!theme) return []
  const chapitres = themeChapters(theme)
  const reponsesTrou = [...new Set(chapitres.flatMap((ch) => (ch.games || []).filter((g) => g.type === 'trou').flatMap((g) => (g.questions || []).map((q) => String(q.answer || '').trim()))).filter(Boolean))]
  const termesTheme = [...new Set(chapitres.flatMap((ch) => (ch.section?.blocks || []).flatMap((b) => [b.c].flat().map((t) => String(t || '')).flatMap((t) => [...t.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim().replace(/[.:;,]+$/, ''))))).filter((t) => t.length >= 4 && t.length <= 32 && !/\d/.test(t)))]
  const blocs = chapitres.map((ch) => {
    const nom = ch.title || theme.short || theme.name
    const cours = cartesDeSection(ch.section, nom)
    const jeux = jeuxDuChapitre(ch, reponsesTrou, nom)
    const parType = (t, n) => jeux.filter((c) => c.type === t).slice(0, n)
    // Beaucoup de jeux d'un même genre se ressemblent : on en garde peu de chaque, pour varier.
    const clozes = trousDuCours(cours, termesTheme, nom, 2)
    const trou = [clozes[0], parType('trou', 1)[0], clozes[1]].filter(Boolean).slice(0, 2)
    const jeu = [...parType('ordre', 1), ...parType('paires', 1), ...parType('tri', 1), ...motsMelanges(termesDuChapitre(ch, theme), nom, 1)]
    const flash = (flashcardsForSection(ch.section, theme, ch.idx)?.cards || []).slice(0, 4).map((x) => ({ type: 'flash', recto: x.front, verso: x.back, chapitre: nom }))
    const qcm = (qcmDesTermes(ch, theme)?.questions || []).filter(qcmValide).slice(0, 4).map((x) => versQcm(x, nom))
    return { cours, trou, jeu, flash, qcm }
  })
  const pool = buildQuiz(themeId).filter(qcmValide).map((x) => versQcm(x, theme.short || theme.name))
  pool.forEach((q, i) => blocs[i % Math.max(1, blocs.length)]?.qcm.push(q))
  const taille = (b) => b.cours.length + b.trou.length + b.jeu.length + b.flash.length + b.qcm.length
  const total = () => blocs.reduce((n, b) => n + taille(b), 0)
  // Répartition visée d'un thème de 100 cartes : le cours reste la trame, mais jeux, flashcards et questions gardent
  // leur place même dans un thème très long. Une part que le thème ne remplit pas profite aux autres genres.
  const PARTS = { cours: 0.42, trou: 0.14, jeu: 0.14, flash: 0.1, qcm: 0.2 }
  const compte = (g) => blocs.reduce((n, b) => n + b[g].length, 0)
  const quotas = {}
  let reste = max
  let actifs = Object.keys(PARTS)
  while (actifs.length) {
    const poids = actifs.reduce((n, g) => n + PARTS[g], 0)
    const plein = actifs.find((g) => compte(g) <= Math.floor((reste * PARTS[g]) / poids))
    if (plein) { quotas[plein] = compte(plein); reste -= compte(plein); actifs = actifs.filter((g) => g !== plein) } else {
      for (const g of actifs) quotas[g] = Math.floor((reste * PARTS[g]) / poids)
      break
    }
  }
  for (const [genre, quota] of Object.entries(quotas)) {
    while (compte(genre) > quota) {
      const b = blocs.reduce((m, x) => (x[genre].length >= (m?.[genre].length || 0) && x[genre].length > 0 ? x : m), null)
      b[genre].pop()
    }
  }
  // Ordre des sacrifices (arrondis) : (genre, nombre minimum à garder dans le chapitre), du moins au plus précieux.
  const ETAPES = [['cours', 1], ['qcm', 0], ['flash', 0], ['jeu', 0], ['trou', 0], ['cours', 0]]
  for (const [genre, mini] of ETAPES) {
    while (total() > max) {
      const b = blocs.reduce((m, x) => (x[genre].length > mini && x[genre].length > (m?.[genre].length || 0) ? x : m), null)
      if (!b) break
      b[genre].pop()
    }
  }
  return blocs.flatMap(melanger)
}
