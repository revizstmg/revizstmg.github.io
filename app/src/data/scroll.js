// Scroll : les exercices d'UN chapitre, un par écran, qu'on fait défiler vers le haut. Pas de cours ici :
// uniquement des jeux (phrase à compléter, mot mélangé, A ou B, remise en ordre, association, questions,
// flashcards). Tout vient du cours et des exercices du chapitre, rien n'est inventé ; plusieurs jeux peuvent
// reprendre la même notion sous des formes différentes, ce qui aide à la retenir.
// Les exercices fabriqués automatiquement passent par des filtres de qualité : pièges de même forme que la
// bonne réponse, jamais déjà présents dans la phrase, définitions complètes et distinctes, pas de doublon.
import { ALL_CHAPTERS, themeChapters, flashcardsForSection, termesDuChapitre, masquerMot, melangerPropositions } from './index.js'
import { cleTerme, termesPrincipaux } from './termes.js'
import { instancierQuestion } from '../qcmgen.js'
import { makeCalcSet, makeCalcMix } from '../calc.js'

const MAX_CARTES = 100

// themeChapters fabrique les exercices de chaque section à chaque appel : on garde son résultat par thème.
const CHAPITRES = new Map()
function chapitresDe(theme) {
  if (!theme) return []
  const c = CHAPITRES.get(theme.id)
  if (c) return c
  const r = themeChapters(theme)
  if (r.length) CHAPITRES.set(theme.id, r)
  return r
}

const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]] } return t }
const sansMd = (t) => String(t || '').replace(/\*+/g, '')
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/’/g, "'")
const mots = (s) => norm(s).split(/[^a-z0-9]+/).filter((m) => m.length >= 3)
const qcmValide = (q) => q?.q && Array.isArray(q.choices) && q.choices.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length
const versQcm = (q) => ({ type: 'qcm', q: q.q, choix: q.choices, bonne: q.answer, explication: q.explain || '' })

// Part des mots du plus court des deux textes qu'on retrouve dans l'autre.
function recouvrement(a, b) {
  const x = mots(a), y = new Set(mots(b))
  const [court, long] = x.length <= y.size ? [x, y] : [[...y], new Set(x)]
  return court.length ? court.filter((m) => long.has(m)).length / court.length : 0
}
// Coupe une définition à la fin d'une proposition ; null si elle est trop longue sans point de coupe naturel.
function coupe(texte, n = 140) {
  const t = String(texte || '').trim()
  if (t.length <= n) return t
  const i = Math.max(t.lastIndexOf(', ', n), t.lastIndexOf(' ; ', n), t.lastIndexOf(' : ', n), t.lastIndexOf('. ', n))
  if (i < 45) return null
  const morceau = t.slice(0, i).replace(/[,;:]$/, '')
  // Une parenthèse restée ouverte ferait une phrase bancale : on renonce à la carte.
  return (morceau.match(/\(/g) || []).length === (morceau.match(/\)/g) || []).length ? `${morceau}…` : null
}
// Première proposition d'une définition (jusqu'à la première virgule, point-virgule ou deux-points), sans « … » :
// les quatre choix d'une carte sont ainsi traités de la même façon.
function propositionCourte(texte, n = 110) {
  const t = String(texte || '').trim().replace(/[.]$/, '')
  const m = t.slice(35).search(/[,;:]| \(/)
  const coupee = m >= 0 ? t.slice(0, 35 + m) : t
  return coupee.length >= 15 && coupee.length <= n && (coupee.match(/\(/g) || []).length === (coupee.match(/\)/g) || []).length ? coupee : null
}
const radical = (mot) => norm(mot).slice(0, Math.max(4, Math.min(norm(mot).length - 2, 6)))
// La définition cite-t-elle déjà le terme demandé (ou un mot de même radical) ?
const citeLeTerme = (def, terme) => { const d = norm(def); return mots(terme).filter((m) => m.length >= 5).some((m) => d.includes(radical(m))) }

// Mots-vedettes qui ne sont pas des notions à retenir seules : verbes, adjectifs, fragments (« trois TVA », « non écrites »).
const TERME_REFUSE = /^(?:non |classe \d|trois |deux |quatre |cinq |\d)|(?:ner|ser|ter|cer)$/i
const TERMES_REFUSES = new Set(['dilue', 'stratégique', 'tactique', 'opérationnel', 'stratégiques', 'annule', 'multiplie leurs coefficients', 'multiplie', 'argumente', 'sanctionner', 'rapporte', 'poussent'])
const termeAcceptable = (t) => /^\p{L}/u.test(t.trim()) && !TERME_REFUSE.test(t.trim()) && !TERMES_REFUSES.has(norm(t).trim())

const MOTS_OUTILS = new Set(['jamais', 'comment', 'pourquoi', 'toujours', 'souvent', 'aussi', 'alors', 'donc', 'cela', 'chaque', 'toute', 'toutes', 'tous', 'tout', 'sans', 'avec', 'pour', 'dans', 'entre', 'sous', 'plus', 'moins', 'tres', 'mais', 'quand', 'lorsque', 'parce', 'puisque', 'ainsi', 'encore', 'deja', 'peut', 'sont', 'etre', 'avoir', 'fait', 'faire', 'doit', 'peuvent', 'selon', 'depuis', 'pendant', 'toi', 'not', 'the', 'and', 'exemple', 'quoi', 'afficher', 'quel', 'quelle', 'quels', 'quelles', 'voici', 'voila'])

// Un piège de trou est valable s'il ressemble à la bonne réponse (même casse, même nombre de mots, même nombre
// grammatical, même type de première lettre après une élision) et n'apparaît pas dans la phrase.
function piegeValable(rep, p, phrase, avantTrou, souple = false) {
  const r = rep.trim(), x = p.trim()
  if (!x || norm(x) === norm(r) || norm(r).includes(norm(x)) || norm(x).includes(norm(r))) return false
  if (/^\p{Lu}/u.test(r) !== /^\p{Lu}/u.test(x)) return false
  const nr = r.split(/\s+/).length, nx = x.split(/\s+/).length
  if (!souple && (Math.abs(nr - nx) > 1 || nx > 4)) return false
  if (nx > 6 || (nr === 1) !== (nx === 1) && !souple) return false
  if (!souple && (x.length < r.length * 0.5 || x.length > r.length * 2 + 3)) return false
  if (norm(phrase).includes(norm(x))) return false
  if (/\d/.test(r) !== /\d/.test(x)) return false
  if (/['’]$/.test(avantTrou) && /^[aeiouyhàâéèêëîïôûù]/i.test(r) !== /^[aeiouyhàâéèêëîïôûù]/i.test(x)) return false
  if (/(?:^|\s)(?:les|des|ces|mes|ses|nos|vos|leurs|aux)\s*$/i.test(avantTrou) && /[sx]$/i.test(r) !== /[sx]$/i.test(x)) return false
  return true
}
function troisPieges(rep, candidats, phrase, avantTrou, souple = false) {
  const v = melange([...new Set(candidats)]).filter((p) => piegeValable(rep, p, phrase, avantTrou, souple))
  const out = []
  for (const p of v) if (out.length < 3 && !out.some((o) => recouvrement(o, p) >= 0.6)) out.push(p)
  return out.length === 3 ? out : null
}

const GRAS = /\*\*([^*]+)\*\*/g
const termesGras = (texte) => [...String(texte || '').matchAll(GRAS)].map((m) => m[1].trim().replace(/[.:;,]+$/, '')).filter((t) => t.length >= 4 && t.length <= 32 && !/\d/.test(t) && t.split(/\s+/).length <= 3)

// Les phrases complètes du chapitre : majuscule au début, ponctuation finale (pas de puces coupées).
// Début de phrase qui annonce un verbe ou un sujet à accorder : la réponse serait une forme conjuguée.
const AVANT_VERBE = /(?:^|\s)(?:il|elle|ils|elles|on|qui|ne|n['’]|se|s['’]|nous|vous|je|j['’]|peut|peuvent|doit|doivent|va|vont|a|ont|est|sont|sera|seront|fait|font)\s*$/i
const CONSIGNE = /^(?:associer|relier|classer|compl[ée]ter|cocher|choisir|d[ée]crire|rep[ée]rer|indiquer|remettre|ordonner|citer|calculer|rep[ée]rez|associe|classe)\b/i

export function phrasesDuChapitre(sec) {
  const textes = []
  for (const b of sec?.blocks || []) {
    if (['p', 'tip', 'warning', 'example'].includes(b.t) && b.c) textes.push(String(b.c))
    else if (b.t === 'list' && Array.isArray(b.c)) textes.push(...b.c.map(String))
  }
  const ABR = /\b(ex|cf|env|art|etc|notamment|resp|fig|vs|p|n°|M|Mme)\.(\s)/gi
  return textes.flatMap((t) => t.replace(ABR, '$1§$2').split(/(?<=[.!?…])\s+/)).map((x) => x.replace(/§/g, '.').trim()).filter((x) => x.length >= 40 && /^[\p{Lu}\d«"“]/u.test(x) && /[.!?…»"”]$/.test(x) && !CONSIGNE.test(x) && !/[=≈→]/.test(x) && (x.match(/\(/g) || []).length === (x.match(/\)/g) || []).length)
}

// « À compléter » : une phrase du cours dont on retire un terme de vocabulaire (en gras dans le cours).
function trousDuCours(sec, pool, titre, vus, souple = false) {
  const { vedettes, gras } = pool
  const dejaMasques = [...vus]
  const out = []
  const nbParTerme = new Map()
  const motsTitre = new Set(mots(titre))
  for (const ph of melange(phrasesDuChapitre(sec))) {
    const plain = sansMd(ph)
    if (plain.length > 260) continue
    for (const terme of termesGras(ph)) {
      const k = norm(terme)
      if (MOTS_OUTILS.has(k) || mots(terme).every((m) => motsTitre.has(m)) || (nbParTerme.get(k) || 0) >= 2) continue
      const masque = masquerMot(plain, terme)
      if (!masque || masque.length < 35 || vus.has(norm(masque)) || vus.has(`phrase:${norm(plain)}`)) continue
      // Même phrase déjà posée par un jeu écrit à la main (avec un autre mot masqué) : on ne la repose pas.
      if (dejaMasques.some((d) => !d.startsWith('phrase:') && recouvrement(d, masque) >= 0.85)) continue
      const avant = masque.split('____')[0]
      if (AVANT_VERBE.test(avant)) continue
      const pieges = troisPieges(terme, vedettes, plain, avant, souple) || troisPieges(terme, gras, plain, avant, souple)
      if (!pieges) continue
      const choix = melange([terme, ...pieges])
      out.push({ type: 'trou', texte: masque, choix, bonne: choix.indexOf(terme), explication: plain })
      vus.add(norm(masque)); vus.add(`phrase:${norm(plain)}`); nbParTerme.set(k, (nbParTerme.get(k) || 0) + 1)
      break
    }
  }
  return out
}

// Les jeux de calcul du thème qui parlent du sujet du chapitre (son titre contient le mot-clé du générateur).
function calculsDuSujet(ch, theme) {
  const titre = norm(ch.title)
  const propres = (ch.games || []).map((g) => g.id)
  return (theme.games || []).filter((g) => g.type === 'calcul' && !propres.includes(g.id)).filter((g) => {
    const cles = mots(`${String(g.title || '').replace(/calcul express\s*[—-]/i, '')} ${String(g.gen || '').replace(/_/g, ' ')}`).filter((m) => m.length >= 5)
    return cles.some((m) => titre.includes(radical(m)))
  })
}

function jeuxEcrits(ch, vus, souple = false, calculsSupp = []) {
  const trou = [], tri = [], ordre = [], paires = [], qcm = [], calcul = []
  const reponsesChapitre = (ch.games || []).filter((g) => g.type === 'trou').flatMap((g) => (g.questions || []).map((q) => String(q.answer || '').trim())).filter(Boolean)
  for (const g of [...(ch.games || []), ...calculsSupp]) {
    if (g.type === 'trou') {
      const dujeu = (g.questions || []).map((q) => String(q.answer || '').trim()).filter(Boolean)
      for (const q of g.questions || []) {
        const rep = String(q.answer || '').trim()
        const texte = sansMd(q.text).replace(/_{3,}/g, '____')
        if (!q.text || !rep || !/____/.test(texte) || rep.length > 30 || MOTS_OUTILS.has(norm(rep)) || vus.has(norm(texte))) continue
        // Même phrase déjà posée avec un autre mot masqué : la 2e carte donnerait la réponse de la 1re.
        if ([...vus].some((d) => !d.startsWith('phrase:') && recouvrement(d, texte) >= 0.85)) continue
        const avant = texte.split('____')[0]
        if (AVANT_VERBE.test(avant)) continue
        const pieges = troisPieges(rep, dujeu, texte.replace('____', ' '), avant, souple) || troisPieges(rep, reponsesChapitre, texte.replace('____', ' '), avant, souple)
        if (!pieges) continue
        const choix = melange([rep, ...pieges])
        trou.push({ type: 'trou', texte, choix, bonne: choix.indexOf(rep), explication: sansMd(q.explain || '') })
        vus.add(norm(texte))
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
    } else if (g.type === 'calcul') {
      // Calcul express : plusieurs tirages du même générateur, avec leurs nombres aléatoires.
      try {
        const tirages = g.gens ? makeCalcMix(g.gens, 8) : g.gen ? makeCalcSet(g.gen, 8) : (g.questions || [])
        const vus = new Set()
        for (const q of tirages) {
          if (!q?.prompt || typeof q.answer !== 'number' || q.fig || vus.has(q.prompt)) continue
          vus.add(q.prompt)
          calcul.push({ type: 'calcul', prompt: q.prompt, reponse: q.answer, unite: q.unit || '', tolerance: q.tolerance ?? 0.01, explication: q.explain || '' })
        }
      } catch { /* générateur indisponible */ }
    } else if (g.type === 'vraifaux') {
      for (const q of g.questions || []) if (q.statement) qcm.push({ type: 'qcm', q: `Vrai ou faux ?\n${q.statement}`, choix: ['Vrai', 'Faux'], bonne: q.answer ? 0 : 1, explication: q.explain || '' })
    }
  }
  return { trou, tri, ordre, paires, qcm, calcul }
}

// Définition débarrassée d'un début qui répète le terme (« SCP : SCP : … »).
const sansTerme = (def, terme) => String(def || '').replace(new RegExp(`^${terme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:,–-]?\\s*`, 'i'), '').replace(/^./, (c) => c.toUpperCase())

// Exercices tirés du glossaire (mots-vedettes seulement) : mot mélangé, vrai/faux (une définition juste et une fausse),
// « de quoi parle-t-on ? » (définition → terme) et « que signifie… ? » (terme → définition).
function jeuxDuGlossaire(termes, titre) {
  const motsM = [], qcm = []
  const vusQ = new Set()
  const ajouterGlobal = (c) => { const k = norm(c.q).replace(/[«»"“”]/g, ''); if (!vusQ.has(k)) { vusQ.add(k); qcm.push(c) } }
  const radicalTitre = mots(titre).map((m) => radical(m))
  for (const t of melange(termes)) {
    const def = sansTerme(t.def, t.terme)
    const motUnique = sansMd(t.terme).trim()
    if (/^[A-Za-zÀ-ÿ]{5,9}$/.test(motUnique) && !MOTS_OUTILS.has(norm(motUnique)) && !radicalTitre.includes(radical(motUnique)) && !/(?:ons|ez|ent|ais|ait|ant|ons|ées?|ées|ir|er)$/.test(norm(motUnique))) {
      const r = radical(motUnique)
      const indice = def.replace(new RegExp(`[\\p{L}]*${r}[\\p{L}]*`, 'giu'), '…')
      if (indice.length >= 25 && !norm(indice).includes(r)) motsM.push({ type: 'mot', mot: motUnique.toLowerCase(), indice: coupe(indice, 200) || indice.slice(0, 200) })
    }
    if (def.length < 20) continue
    const autres = melange(termes.filter((o) => o.def !== t.def && recouvrement(o.terme, t.terme) < 0.5 && !norm(o.terme).includes(norm(t.terme)) && !norm(t.terme).includes(norm(o.terme))))
    const faux = autres.find((o) => recouvrement(sansTerme(o.def, o.terme), def) < 0.5 && !citeLeTerme(o.def, t.terme))
    const parTerme = []
    const ajouter = (c) => parTerme.push(c)
    const defLong = coupe(def, 170)
    if (defLong) ajouter({ type: 'qcm', q: `Vrai ou faux ?\n${t.terme} : ${defLong}`, choix: ['Vrai', 'Faux'], bonne: 0, explication: `${t.terme} : ${t.def}` })
    const fauxLong = faux && coupe(sansTerme(faux.def, faux.terme), 170)
    if (fauxLong) ajouter({ type: 'qcm', q: `Vrai ou faux ?\n${t.terme} : ${fauxLong}`, choix: ['Vrai', 'Faux'], bonne: 1, explication: `${t.terme} : ${t.def}` })
    if (autres.length >= 3 && defLong && !citeLeTerme(def, t.terme)) {
      const pieges = []
      for (const o of autres) if (pieges.length < 3 && !pieges.some((p) => recouvrement(p.terme, o.terme) >= 0.5)) pieges.push(o)
      if (pieges.length === 3) {
        const termes4 = melange([t.terme, ...pieges.map((o) => o.terme)])
        ajouter({ type: 'qcm', q: `De quoi parle-t-on ?\n${defLong}`, choix: termes4, bonne: termes4.indexOf(t.terme), explication: `${t.terme} : ${t.def}` })
        const brutes = [def, ...pieges.map((o) => sansTerme(o.def, o.terme))]
        const courtes = brutes.map((d) => propositionCourte(d))
        const distinctes = courtes.every((c, i) => c && courtes.every((d, j) => i === j || recouvrement(c, d) < 0.6))
        if (distinctes) { const defs4 = melange(courtes); ajouter({ type: 'qcm', q: `Que signifie « ${t.terme} » ?`, choix: defs4, bonne: defs4.indexOf(courtes[0]), explication: `${t.terme} : ${t.def}` }) }
      }
    }
    // Au plus trois questions par terme (même notion, formes différentes) : on ne rabâche pas.
    for (const c of melange(parTerme).slice(0, 3)) ajouterGlobal(c)
  }
  // « Associe » : trois mots-vedettes à relier à leur définition courte.
  const paires = []
  const candidats = melange(termes.map((t) => ({ g: sansMd(t.terme), d: propositionCourte(sansTerme(t.def, t.terme), 70) })).filter((p) => p.d && p.g.length <= 32 && !citeLeTerme(p.d, p.g)))
  const groupe = []
  for (const p of candidats) {
    if (groupe.every((q) => recouvrement(q.d, p.d) < 0.5 && recouvrement(q.g, p.g) < 0.5)) groupe.push(p)
    if (groupe.length === 3) { paires.push({ type: 'paires', paires: groupe.map((x) => ({ g: x.g, d: x.d })) }); groupe.length = 0 }
  }
  return { mots: motsM, qcm, paires: paires.slice(0, 6) }
}

// Marques Markdown mal appariées (« **C », « Intelligence** ») : on les retire plutôt que de les afficher.
const nettoyerTexte = (t) => { const x = String(t ?? ''); return (x.match(/\*\*/g) || []).length % 2 ? x.replace(/\*+/g, '') : x }
const sansVerdict = (t) => String(t || '').replace(/^\s*(?:exact|vrai|faux|oui|non|correct)\s*[.:!,–-]\s*/i, '')
function nettoyer(c) {
  const o = { ...c }
  for (const k of ['texte', 'q', 'recto', 'verso', 'indice', 'consigne']) if (k in o) o[k] = nettoyerTexte(o[k])
  if ('explication' in o) o.explication = nettoyerTexte(sansVerdict(o.explication))
  if (o.choix) o.choix = o.choix.map(nettoyerTexte)
  if (o.etapes) o.etapes = o.etapes.map(nettoyerTexte)
  if (o.paires) o.paires = o.paires.map((p) => ({ g: nettoyerTexte(p.g), d: nettoyerTexte(p.d) }))
  return o
}

// Les genres sont étalés régulièrement sur toute la longueur : deux cartes du même genre se suivent le moins possible.
function melanger(piles) {
  const decalage = { trou: 0, jeu: 0.19, flash: 0.33, qcm: 0.5, calcul: 0.7 }
  const cartes = []
  for (const [genre, pile] of Object.entries(piles)) pile.forEach((c, j) => cartes.push({ c, cle: (j + 0.5 + (decalage[genre] || 0)) / pile.length }))
  return cartes.sort((x, y) => x.cle - y.cle).map((x) => x.c)
}

// Répartition visée pour un chapitre de 100 cartes ; une part que le chapitre ne remplit pas profite aux autres genres.
const PLANCHER = 30
const PARTS = { trou: 0.2, qcm: 0.25, jeu: 0.17, flash: 0.18, calcul: 0.2 }

// Ce qui ne dépend que du thème (mots-vedettes de chaque chapitre, pièges possibles) est calculé une seule fois.
const CONTEXTES = new Map()
function contexteTheme(theme, tous) {
  const cache = CONTEXTES.get(theme.id)
  if (cache && cache.n === tous.length) return cache
  const principaux = termesPrincipaux(theme.subjectId)
  const parChapitre = tous.map((c) => termesDuChapitre(c, theme, { sansTheme: true }).filter((t) => principaux.has(cleTerme(t.terme)) && t.def && termeAcceptable(t.terme) && t.def.length <= 260 && !/[+=/]/.test(t.terme) && t.terme.split(/\s+/).length <= 4))
  const ctx = {
    n: tous.length,
    parChapitre,
    pool: {
      // Pièges des phrases à trous : mots-vedettes du glossaire du thème, à défaut les termes en gras du thème.
      vedettes: [...new Set(parChapitre.flatMap((l) => l.map((t) => sansMd(t.terme))))],
      gras: [...new Set(tous.flatMap((c) => (c.section?.blocks || []).flatMap((b) => [b.c].flat().flatMap(termesGras))))],
    },
  }
  if (principaux.size) CONTEXTES.set(theme.id, ctx)
  return ctx
}

export function construireFlux(themeId, idx, { max = MAX_CARTES, souple = false } = {}) {
  const theme = ALL_CHAPTERS[themeId]
  const tous = chapitresDe(theme)
  const ch = tous[Number(idx)]
  if (!theme || !ch) return []
  const nom = ch.title || theme.short || theme.name
  const { parChapitre, pool } = contexteTheme(theme, tous)
  // Un chapitre qui n'atteint pas le plancher (2e passage « souple ») complète son glossaire avec les termes du thème.
  const termes = souple
    ? termesDuChapitre(ch, theme).filter((t) => termesPrincipaux(theme.subjectId).has(cleTerme(t.terme)) && t.def && termeAcceptable(t.terme) && t.def.length <= 260 && !/[+=/]/.test(t.terme) && t.terme.split(/\s+/).length <= 4)
    : parChapitre[Number(idx)]
  const vus = new Set()
  const ecrits = jeuxEcrits(ch, vus, souple, calculsDuSujet(ch, theme))
  const gloss = jeuxDuGlossaire(termes, nom)
  const flashs = (flashcardsForSection(ch.section, theme, ch.idx)?.cards || []).map((x) => ({ type: 'flash', recto: sansMd(x.front), verso: sansMd(x.back) }))
  const flashTermes = termes.map((t) => ({ type: 'flash', recto: sansMd(t.terme), verso: sansTerme(t.def, t.terme) }))
  const vusFlash = new Set()
  const flash = [...flashs, ...flashTermes].filter((f) => {
    const k = norm(f.recto)
    if (!k || vusFlash.has(k) || norm(f.verso) === k || f.verso.length < 8) return false
    vusFlash.add(k); return true
  })
  const piles = {
    trou: melange([...ecrits.trou, ...trousDuCours(ch.section, pool, nom, vus, souple)]),
    qcm: melange([...ecrits.qcm, ...gloss.qcm]),
    jeu: melange([...ecrits.ordre, ...ecrits.paires, ...ecrits.tri, ...gloss.paires, ...gloss.mots]),
    flash: melange(flash),
    calcul: melange(ecrits.calcul),
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
  // Les questions ne dépassent pas la moitié du chapitre : on veut de la variété.
  const autres = piles.trou.length + piles.jeu.length + piles.flash.length + piles.calcul.length
  piles.qcm = piles.qcm.slice(0, Math.max(autres + 5, 12))
  const cartes = melanger(piles).map((c) => nettoyer({ ...c, chapitre: nom }))
  // Chapitre pauvre : on réessaie avec des filtres de forme assouplis (la casse et la phrase restent contrôlées).
  return cartes.length < PLANCHER && !souple ? (() => { const r = construireFlux(themeId, idx, { max, souple: true }); return r.length > cartes.length ? r : cartes })() : cartes
}

// Chapitres d'un thème, pour la page de choix.
export function chapitresDuTheme(themeId) {
  return chapitresDe(ALL_CHAPTERS[themeId]).map((c) => ({ idx: c.idx, titre: c.title }))
}

// Les exercices d'un chapitre sont tirés une fois par visite : le nombre annoncé sur la page de choix est celui qu'on trouve.
const MEMO = new Map()
export function exercicesDuChapitre(themeId, idx) {
  const k = `${themeId}::${idx}`
  if (!MEMO.has(k)) MEMO.set(k, construireFlux(themeId, idx))
  return MEMO.get(k)
}
