// Plugin Vite : fabrique l'index léger du contenu (module virtuel
// « virtual:contenu-index ») à partir de content/*/matiere.json.
//
// L'index est chargé au démarrage. Il donne à l'app, pour chaque matière et
// chaque thème, ce dont ont besoin le store, l'accueil, les menus et la
// recherche, sans le contenu lui-même (cours, exercices…), qui n'est chargé
// qu'à l'ouverture de la matière (voir src/content/contenu.js).
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const CONTENT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'content')
const VIRTUEL = 'virtual:contenu-index'
const RESOLU = '\0' + VIRTUEL

// Champs d'un thème qui restent dans le chargement de la matière.
export const CHAMPS_LOURDS = new Set(['cours', 'games', 'essentiel', 'intro', 'resources', 'formulas'])

const lire = (rel) => JSON.parse(readFileSync(join(CONTENT, rel), 'utf8'))

export function construireIndex() {
  const ordre = lire('ordre.json')
  const fichiers = ['ordre.json']
  // Chapitre de chaque exercice rédigé (exercices-sections.json) : la maîtrise
  // d'un thème en a besoin dès l'accueil, avant le chargement de la matière.
  const sections = {}
  const matieres = ordre.map((id) => {
    const m = lire(`${id}/matiere.json`)
    fichiers.push(`${id}/matiere.json`)
    const sectionsPath = `${id}/exercices-sections.json`
    if (existsSync(join(CONTENT, sectionsPath))) {
      Object.assign(sections, lire(sectionsPath))
      fichiers.push(sectionsPath)
    }
    const etudesPath = `${id}/etudes-documents.json`
    const etudes = existsSync(join(CONTENT, etudesPath)) ? lire(etudesPath) : {}
    if (Object.keys(etudes).length) fichiers.push(etudesPath)
    const { chapters, ...champs } = m
    return {
      ...champs,
      chapters: (chapters || []).map((c) => {
        const leger = {}
        for (const [k, v] of Object.entries(c)) if (!CHAMPS_LOURDS.has(k)) leger[k] = v
        // Identifiant et type des exercices du thème une fois assemblé :
        // exercices de base, plus l'étude de documents (même règle que
        // data/index.js). Le type dit si l'exercice se lance seul, ce dont le
        // score a besoin avant le chargement de la matière.
        const jeux = (c.games || []).map((g) => ({ id: g.id, type: g.type, ...(g.sectionOnly === true ? { sectionOnly: true } : {}) }))
        const etude = etudes[c.id]
        if (etude && !jeux.some((g) => g.id === etude.id)) jeux.push({ id: etude.id, type: etude.type })
        leger.games = jeux
        return leger
      }),
    }
  })
  return { ordre, matieres, sections, fichiers }
}

export default function contenuIndex() {
  return {
    name: 'revizstmg-contenu-index',
    resolveId(id) {
      if (id === VIRTUEL) return RESOLU
    },
    load(id) {
      if (id !== RESOLU) return
      const { ordre, matieres, sections, fichiers } = construireIndex()
      for (const f of fichiers) this.addWatchFile(join(CONTENT, f))
      return `export default ${JSON.stringify({ ordre, matieres, sections })}`
    },
  }
}
