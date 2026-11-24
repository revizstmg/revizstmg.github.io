// Mode Scroll : un chapitre ou un thème transformé en cartes courtes, une par écran, qu'on fait défiler
// vers le haut. Les cartes de cours viennent du cours lui-même (rien n'est inventé) ; une flashcard revient
// toutes les trois cartes et une question éclair toutes les sept.
import { ALL_CHAPTERS, themeChapters, flashcardsForSection, buildQuiz, qcmDesTermes } from './index.js'

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

// Mélange d'un chapitre : deux cartes de cours, une flashcard, puis (un tour sur deux) une question éclair.
function melanger(cours, fiches, questions) {
  const out = []
  const c = [...cours], f = [...fiches], q = [...questions]
  let tour = 0
  while (c.length || f.length || q.length) {
    out.push(...c.splice(0, 2))
    if (f.length) out.push(f.shift())
    if (tour % 2 === 1 || !c.length) { if (q.length) out.push(q.shift()) }
    tour++
  }
  return out
}

// Les cartes d'un thème (une centaine au plus), chapitre après chapitre : le cours d'abord, avec flashcards et
// questions éclair intercalées. Les questions du thème entier (QCM, vrai/faux) sont réparties entre les chapitres.
// Au-delà de `max`, on retire d'abord les cartes de cours en trop, puis les questions, puis les flashcards,
// dans le chapitre le plus chargé : tous les chapitres restent représentés.
export function construireFlux(themeId, { max = MAX_CARTES } = {}) {
  const theme = ALL_CHAPTERS[themeId]
  if (!theme) return []
  const chapitres = themeChapters(theme)
  const blocs = chapitres.map((ch) => {
    const nom = ch.title || theme.short || theme.name
    const cours = cartesDeSection(ch.section, nom)
    const fiches = (flashcardsForSection(ch.section, theme, ch.idx)?.cards || []).slice(0, 8).map((x) => ({ type: 'flash', recto: x.front, verso: x.back, chapitre: nom }))
    const questions = (qcmDesTermes(ch, theme)?.questions || []).filter(qcmValide).slice(0, 8).map((x) => versQcm(x, nom))
    return { cours, fiches, questions }
  })
  const pool = buildQuiz(themeId).filter(qcmValide).map((x) => versQcm(x, theme.short || theme.name))
  pool.forEach((q, i) => blocs[i % Math.max(1, blocs.length)]?.questions.push(q))
  const total = () => blocs.reduce((n, b) => n + b.cours.length + b.fiches.length + b.questions.length, 0)
  const lourd = () => blocs.reduce((m, b) => (b.cours.length + b.fiches.length + b.questions.length > m.n ? { b, n: b.cours.length + b.fiches.length + b.questions.length } : m), { b: null, n: 0 }).b
  while (total() > max) {
    const b = lourd()
    if (b.cours.length > 3) b.cours.pop()
    else if (b.questions.length > 1) b.questions.pop()
    else if (b.fiches.length > 1) b.fiches.pop()
    else if (b.cours.length > 1) b.cours.pop()
    else break
  }
  return blocs.flatMap((b) => melanger(b.cours, b.fiches, b.questions))
}
