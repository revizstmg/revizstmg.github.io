// Accès au contenu pédagogique, rangé en JSON dans app/content/ :
//   content/ordre.json              ordre d'affichage des matières
//   content/<matière>/matiere.json  la matière et ses thèmes de base
//   content/<matière>/<couche>.json une couche de contenu, indexée par thème
//   content/commun/*.json           contenu qui ne dépend d'aucune matière
// Le contenu se corrige dans ces fichiers, sans toucher au code.
//
// Chargement à la demande : au démarrage, seul l'index léger (noms, couleurs,
// identifiants des thèmes et des exercices) et le contenu commun sont chargés.
// Les fichiers d'une matière arrivent quand on l'ouvre (un fichier compilé par
// matière, voir vite.config.js).
import INDEX from 'virtual:contenu-index'
import { genVerbEN, genVerbES, genGrammarEN, genGrammarES } from '../data/langgen.js'

const COMMUN = import.meta.glob('../../content/commun/*.json', { eager: true, import: 'default' })
const FICHIERS = import.meta.glob(['../../content/*/*.json', '!../../content/commun/*.json'], { import: 'default' })

export const ORDRE_MATIERES = INDEX.ordre

// Matières de l'index : objets complétés sur place au chargement.
export const MATIERES = INDEX.matieres

export function commun(nom) {
  const data = COMMUN[`../../content/commun/${nom}.json`]
  if (!data) throw new Error(`Contenu commun introuvable : content/commun/${nom}.json`)
  return data
}

// Couches de contenu, indexées par thème, remplies au fil des chargements.
export const NOMS_COUCHES = [
  'cours-complets', 'cours-reels', 'enrichissements', 'philo-longue-duree',
  'approfondi-1', 'approfondi-2', 'approfondi-3', 'approfondi-4', 'sic-si',
  'histoire-approfondie', 'management-approfondi', 'definitions', 'pieges',
  'cas-pratiques', 'etudes-documents', 'exercices-sections',
]
export const COUCHES = Object.fromEntries(NOMS_COUCHES.map((n) => [n, {}]))

// Les exercices de langues générés à la volée (types « verbs » et « grammar »)
// désignent leur générateur par son nom (« gen »: "genVerbEN") : on le remplace
// par la fonction. (Les exercices de calcul gardent leur « gen » texte, qui
// désigne un générateur de src/calc.js.)
const GENERATEURS = { genVerbEN, genVerbES, genGrammarEN, genGrammarES }
const TYPES_GENERES = new Set(['verbs', 'grammar'])
function relierGenerateurs(m) {
  for (const c of m.chapters || []) {
    for (const g of c.games || []) {
      if (!TYPES_GENERES.has(g.type) || typeof g.gen !== 'string') continue
      if (!GENERATEURS[g.gen]) throw new Error(`Générateur inconnu « ${g.gen} » (${g.id})`)
      g.gen = GENERATEURS[g.gen]
    }
  }
}

// Remplace le contenu d'un objet en gardant son identité (les pages qui le
// tiennent déjà voient la nouvelle version) et l'ordre des champs de la source.
export function remplacerEnPlace(cible, source) {
  for (const k of Object.keys(cible)) delete cible[k]
  return Object.assign(cible, source)
}

// Charge les fichiers d'une matière : complète l'objet matière de l'index et
// ses thèmes, et remplit les couches. Ne fait PAS l'assemblage (data/index.js).
export async function chargerFichiers(id) {
  const m = MATIERES.find((x) => x.id === id)
  if (!m) throw new Error(`Matière inconnue : ${id}`)
  const prefixe = `../../content/${id}/`
  const chemins = Object.keys(FICHIERS).filter((p) => p.startsWith(prefixe))
  const contenus = await Promise.all(chemins.map((p) => FICHIERS[p]()))
  const parNom = {}
  chemins.forEach((p, i) => { parNom[p.slice(prefixe.length, -'.json'.length)] = contenus[i] })
  const complet = parNom.matiere
  if (!complet) throw new Error(`Matière introuvable : content/${id}/matiere.json`)
  // Copie profonde : le module JSON reste intact si l'app recharge la matière.
  const source = JSON.parse(JSON.stringify(complet))
  const themes = m.chapters
  source.chapters.forEach((c, i) => {
    const cible = themes.find((t) => t.id === c.id)
    if (cible) { remplacerEnPlace(cible, c); themes[i] = cible } else themes[i] = c
  })
  themes.length = source.chapters.length
  remplacerEnPlace(m, { ...source, chapters: themes })
  relierGenerateurs(m)
  for (const nom of NOMS_COUCHES) if (parNom[nom]) Object.assign(COUCHES[nom], parNom[nom])
  return m
}
