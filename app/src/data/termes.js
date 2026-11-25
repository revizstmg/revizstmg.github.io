// Termes du cours : un mot en gras (**terme**) devient cliquable quand le glossaire de
// la matière en donne une définition. Sources, dans cet ordre :
//   1. content/<matière>/termes.json : { "<matière>": { "terme|autre forme": "définition" } }
//   2. content/<matière>/definitions.json : les « définitions clés » déjà écrites par thème.
// Un mot en gras sans définition reste un simple gras (l'emphase n'est pas un terme).
import { COUCHES, MATIERES } from '../content/contenu.js'

const ARTICLES = /^(?:l['’]|d['’]|(?:le|la|les|un|une|des|du|de la|de l['’]|au|aux|ce|cette|ces|son|sa|ses|leur|leurs)\s+)/

// Clé de comparaison : sans accents, casse, ponctuation, parenthèses ni article initial.
export function cleTerme(brut) {
  let s = String(brut || '').replace(/\([^)]*\)/g, ' ').trim().replace(/^[\s.:;,!?«"“]+|[\s.:;,!?»"”]+$/g, '')
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ').trim()
  for (let i = 0; i < 2; i++) s = s.replace(ARTICLES, '')
  return s.trim()
}

const CACHE = new Map()

// Glossaire d'une matière : Map(clé → définition). Reconstruit tant qu'il est vide
// (la matière se charge à la demande).
export function glossaireDe(matiereId) {
  const deja = CACHE.get(matiereId)
  if (deja && deja.size) return deja
  const g = new Map()
  const propres = COUCHES.termes?.[matiereId] || {}
  for (const [cles, def] of Object.entries(propres)) {
    if (typeof def !== 'string' || !def.trim()) continue
    for (const c of cles.split('|')) { const k = cleTerme(c); if (k && !g.has(k)) g.set(k, def.trim()) }
  }
  const matiere = MATIERES.find((m) => m.id === matiereId)
  for (const t of matiere?.chapters || []) {
    for (const item of COUCHES.definitions?.[t.id] || []) {
      if (!Array.isArray(item) || item.length < 2 || typeof item[1] !== 'string') continue
      const k = cleTerme(item[0])
      if (k && !g.has(k)) g.set(k, item[1].trim())
    }
  }
  CACHE.set(matiereId, g)
  return g
}

// Définition d'un mot en gras, ou null. Essaie le singulier/pluriel simple.
export function trouverDefinition(glossaire, brut) {
  if (!glossaire || !glossaire.size) return null
  const k = cleTerme(brut)
  if (!k || k.length < 3) return null
  if (glossaire.has(k)) return glossaire.get(k)
  if (/[sx]$/.test(k) && glossaire.has(k.slice(0, -1))) return glossaire.get(k.slice(0, -1))
  if (glossaire.has(k + 's')) return glossaire.get(k + 's')
  return null
}

// Mots-vedettes d'une matière : le premier terme de chaque entrée de termes.json (les autres formes de la clé sont
// des variantes, parfois de simples fragments de phrase) et les titres des définitions clés écrites par thème.
// Les exercices fabriqués automatiquement n'utilisent que ceux-là pour poser une définition.
const PRINCIPAUX = new Map()
export function termesPrincipaux(matiereId) {
  if (PRINCIPAUX.has(matiereId)) return PRINCIPAUX.get(matiereId)
  const out = new Set()
  for (const cles of Object.keys(COUCHES.termes?.[matiereId] || {})) {
    const k = cleTerme(cles.split('|')[0])
    if (k) out.add(k)
  }
  const matiere = MATIERES.find((m) => m.id === matiereId)
  for (const t of matiere?.chapters || []) for (const item of COUCHES.definitions?.[t.id] || []) if (Array.isArray(item) && item[0]) out.add(cleTerme(item[0]))
  if (out.size) PRINCIPAUX.set(matiereId, out)
  return out
}
