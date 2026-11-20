// Fiche de révision visuelle : tout est déduit du cours déjà écrit (aucun contenu à la main).
// À partir d'une section de cours, on tire les idées en une phrase, les mots à connaître
// (gras du cours qui ont une définition au glossaire), les branches d'une carte mentale,
// les pièges, astuces, exemples, formules et un auto-test.
import { trouverDefinition } from './termes.js'

const sansGras = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
const gras = (s) => [...String(s ?? '').matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim()).filter(Boolean)

export function court(s, max) {
  const t = sansGras(s)
  if (t.length <= max) return t
  const coupe = t.slice(0, max - 1)
  const espace = coupe.lastIndexOf(' ')
  return `${(espace > max * 0.6 ? coupe.slice(0, espace) : coupe).replace(/[\s,;:]+$/, '')}…`
}

export function premiereIdee(texte, max = 170) {
  const t = sansGras(texte)
  const phrase = t.split(/(?<=[.!?])\s+/)[0] || t
  return court(phrase, max)
}

// Découpe un texte en lignes de `max` caractères au plus (pour les étiquettes SVG).
export function lignes(texte, max, nbMax = 2) {
  const mots = sansGras(texte).split(' ')
  const out = []
  let cur = ''
  for (const m of mots) {
    if ((cur ? cur.length + 1 : 0) + m.length > max && cur) { out.push(cur); cur = m } else cur = cur ? `${cur} ${m}` : m
  }
  if (cur) out.push(cur)
  if (out.length > nbMax) { const r = out.slice(0, nbMax); r[nbMax - 1] = court(`${r[nbMax - 1]} ${out.slice(nbMax).join(' ')}`, max); return r }
  return out
}

export function blocsDe(section) {
  if (!section) return []
  if (section.blocks?.length) return section.blocks
  const out = []
  if (section.intro) out.push({ t: 'p', c: section.intro })
  if (section.points?.length) out.push({ t: 'list', c: section.points })
  if (section.formula) out.push({ t: 'formula', c: section.formula })
  return out
}

const texteDuBloc = (b) => (Array.isArray(b.c) ? b.c.join(' ') : String(b.c ?? ''))

export function construireFiche(section, glossaire = null) {
  const blocs = blocsDe(section)
  const idees = []
  for (const b of blocs) {
    if ((b.t === 'p' || b.t === 'list') && idees.length < 5) {
      const base = b.t === 'list' ? (Array.isArray(b.c) ? b.c[0] : b.c) : b.c
      const idee = premiereIdee(base)
      if (idee.length >= 25 && !idees.includes(idee)) idees.push(idee)
    }
  }
  const vus = new Set()
  const tousLesGras = []
  for (const b of blocs) for (const g of gras(texteDuBloc(b))) { const k = g.toLowerCase(); if (!vus.has(k)) { vus.add(k); tousLesGras.push(g) } }

  const mots = []
  for (const g of tousLesGras) {
    const def = glossaire ? trouverDefinition(glossaire, g) : null
    if (def && mots.length < 8 && !mots.some((m) => m.definition === def)) mots.push({ terme: g.replace(/[.:;,]+$/, ''), definition: def })
  }

  const branches = []
  const pris = new Set()
  for (const b of blocs) {
    if ((b.t !== 'p' && b.t !== 'list') || branches.length >= 6) continue
    const g = gras(texteDuBloc(b)).filter((x) => x.length >= 3 && x.length <= 40 && !pris.has(x.toLowerCase()))
    if (!g.length) continue
    const uniques = [...new Map(g.map((x) => [x.toLowerCase(), x])).values()]
    uniques.slice(0, 3).forEach((x) => pris.add(x.toLowerCase()))
    branches.push({ titre: uniques[0], feuilles: uniques.slice(1, 3) })
  }

  const parType = (t) => blocs.filter((b) => b.t === t)
  return {
    idees,
    mots,
    branches,
    pieges: parType('warning').map((b) => ({ titre: sansGras(b.h || ''), texte: sansGras(b.c) })),
    astuces: parType('tip').map((b) => ({ titre: sansGras(b.h || ''), texte: sansGras(b.c) })),
    exemples: parType('example').map((b) => ({ titre: sansGras(b.h || ''), texte: sansGras(b.c) })),
    formules: parType('formula').map((b) => sansGras(b.c)),
    autotest: (mots.length ? mots.map((m) => m.terme) : tousLesGras.filter((x) => x.length <= 40)).slice(0, 5),
  }
}

// Une fiche n'a d'intérêt visuel que si elle a de quoi remplir au moins une zone.
export const ficheUtile = (f) => !!f && (f.idees.length > 0 || f.mots.length > 0 || f.branches.length > 0)
