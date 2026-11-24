// Mode Scroll : un chapitre ou un thème transformé en cartes courtes, une par écran, qu'on fait défiler
// vers le haut. Les cartes de cours viennent du cours lui-même (rien n'est inventé) ; une flashcard revient
// toutes les trois cartes et une question éclair toutes les sept.
import { ALL_CHAPTERS, themeChapters, flashcardsForSection, buildQuiz } from './index.js'

const MAX_CARTES = 90
const PAR_SECTION = 6
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
    if (b.t === 'p') for (const m of decouper(b.c).slice(0, 2)) ajouter({ type: 'cours', texte: m })
    else if (b.t === 'list') for (const it of (b.c || []).slice(0, 2)) ajouter({ type: 'cours', texte: reduire(String(it)) })
    else if (b.t === 'formula') ajouter({ type: 'formule', texte: String(b.c || '') })
    else if (b.t === 'warning') ajouter({ type: 'piege', texte: reduire(String(b.c || '')) })
    else if (b.t === 'tip') ajouter({ type: 'astuce', texte: reduire(String(b.c || '')) })
    else if (b.t === 'example') ajouter({ type: 'exemple', titre: b.h || 'Exemple', texte: reduire(String(b.c || ''), 360) })
  }
  return cartes.filter((c) => c.texte && c.texte.trim())
}

// Les cartes d'un thème, dans l'ordre : cours, avec une flashcard toutes les trois cartes, puis une question éclair
// toutes les sept. `hasard` permet de rendre le mélange des questions reproductible dans les tests.
export function construireFlux(themeId, { max = MAX_CARTES } = {}) {
  const theme = ALL_CHAPTERS[themeId]
  if (!theme) return []
  const flux = []
  for (const ch of themeChapters(theme)) {
    const nom = ch.title || theme.short || theme.name
    const cours = cartesDeSection(ch.section, nom)
    const fiches = (flashcardsForSection(ch.section, theme, ch.idx)?.cards || []).slice(0, 3).map((c) => ({ type: 'flash', recto: c.front, verso: c.back, chapitre: nom }))
    cours.forEach((c, i) => {
      flux.push(c)
      if ((i + 1) % 3 === 0 && fiches.length) flux.push(fiches.shift())
    })
    flux.push(...fiches.slice(0, 1))
  }
  const qcm = buildQuiz(themeId)
    .filter((q) => q?.q && Array.isArray(q.choices) && q.choices.length >= 2)
    .map((q) => ({ type: 'qcm', q: q.q, choix: q.choices, bonne: q.answer, explication: q.explain || '', chapitre: theme.short || theme.name }))
  const mixte = []
  let n = 0
  for (const c of flux) {
    mixte.push(c)
    n++
    if (n % 7 === 0 && qcm.length) mixte.push(qcm.shift())
  }
  mixte.push(...qcm)
  return mixte.slice(0, max)
}
