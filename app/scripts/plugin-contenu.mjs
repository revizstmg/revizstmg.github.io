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
  const matieres = ordre.map((id) => {
    const m = lire(`${id}/matiere.json`)
    fichiers.push(`${id}/matiere.json`)
    const etudesPath = `${id}/etudes-documents.json`
    const etudes = existsSync(join(CONTENT, etudesPath)) ? lire(etudesPath) : {}
    if (Object.keys(etudes).length) fichiers.push(etudesPath)
    const { chapters, ...champs } = m
    return {
      ...champs,
      chapters: (chapters || []).map((c) => {
        const leger = {}
        for (const [k, v] of Object.entries(c)) if (!CHAMPS_LOURDS.has(k)) leger[k] = v
        // Identifiants des exercices du thème une fois assemblé : exercices de
        // base, plus l'étude de documents (même règle que data/index.js).
        const jeux = (c.games || []).map((g) => g.id)
        const etude = etudes[c.id]
        if (etude && !jeux.includes(etude.id)) jeux.push(etude.id)
        leger.games = jeux.map((gid) => ({ id: gid }))
        return leger
      }),
    }
  })
  return { ordre, matieres, fichiers }
}

export default function contenuIndex() {
  return {
    name: 'revizstmg-contenu-index',
    resolveId(id) {
      if (id === VIRTUEL) return RESOLU
    },
    load(id) {
      if (id !== RESOLU) return
      const { ordre, matieres, fichiers } = construireIndex()
      for (const f of fichiers) this.addWatchFile(join(CONTENT, f))
      return `export default ${JSON.stringify({ ordre, matieres })}`
    },
  }
}
