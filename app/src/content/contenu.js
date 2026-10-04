// Accès au contenu pédagogique, rangé en JSON dans app/content/ :
//   content/ordre.json              ordre d'affichage des matières
//   content/<matière>/matiere.json  la matière et ses thèmes de base
//   content/<matière>/<couche>.json une couche de contenu, indexée par thème
//   content/commun/*.json           contenu qui ne dépend d'aucune matière
// Le contenu se corrige dans ces fichiers, sans toucher au code.
import { genVerbEN, genVerbES, genGrammarEN, genGrammarES } from '../data/langgen.js'

const FICHIERS = import.meta.glob('../../content/**/*.json', { eager: true, import: 'default' })

function fichier(chemin) {
  return FICHIERS[`../../content/${chemin}`]
}

export const ORDRE_MATIERES = fichier('ordre.json')

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
  return m
}

export function matiere(id) {
  const m = fichier(`${id}/matiere.json`)
  if (!m) throw new Error(`Matière introuvable : content/${id}/matiere.json`)
  return relierGenerateurs(m)
}

// Une couche (cours complets, cours approfondis, définitions…) réunie pour
// toutes les matières : { [id de thème]: … }.
export function couche(nom) {
  const out = {}
  for (const id of ORDRE_MATIERES) Object.assign(out, fichier(`${id}/${nom}.json`) || {})
  return out
}

export function commun(nom) {
  const data = fichier(`commun/${nom}.json`)
  if (!data) throw new Error(`Contenu commun introuvable : content/commun/${nom}.json`)
  return data
}
