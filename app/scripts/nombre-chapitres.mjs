// Recalcule content/commun/nombre-chapitres.json : pour chaque thème, le nombre
// d'exercices de chacun de ses chapitres qui comptent pour la maîtrise (3 au
// plus), une fois le cours assemblé (toutes les couches, voir
// src/data/index.js). La maîtrise d'un thème s'en sert partout, accueil compris,
// sans charger la matière ni refabriquer les exercices. (Au-delà de 3, le nombre
// d'exercices fabriqués varie d'un tirage à l'autre : il n'est pas gardé.)
//   npm run chapitres
// Un test (tests/chargement.test.js) échoue si le fichier n'est plus à jour.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ALL_CHAPTERS, chargerTout, themeChapters, jeuxDuChapitre, EXERCICES_POUR_MAITRISER } from '../src/data/index.js'

await chargerTout()
const themes = {}
for (const id of Object.keys(ALL_CHAPTERS).sort()) {
  const t = ALL_CHAPTERS[id]
  themes[id] = themeChapters(t).map((ch) => Math.min(EXERCICES_POUR_MAITRISER, jeuxDuChapitre(ch, t).length))
}
const fichier = fileURLToPath(new URL('../content/commun/nombre-chapitres.json', import.meta.url))
const lignes = Object.entries(themes).map(([id, n]) => `    ${JSON.stringify(id)}: ${JSON.stringify(n)}`)
writeFileSync(fichier, `{\n  "_": "Exercices de chaque chapitre comptés pour la maîtrise (3 au plus), par thème. Fichier calculé par « npm run chapitres » : ne pas le modifier à la main.",\n  "themes": {\n${lignes.join(',\n')}\n  }\n}\n`)
console.log(`${lignes.length} thèmes → content/commun/nombre-chapitres.json`)
