// Chargement à la demande du contenu : l'index léger suffit au démarrage, et
// le chargement d'une matière complète les objets que l'app tient déjà.
import { describe, it, expect } from 'vitest'
import * as C from '../src/data/index.js'
import { chapterScore } from '../src/store.jsx'

describe('chargement à la demande', () => {
  it('au démarrage : noms, couleurs, mots-clés et identifiants d’exercices, sans le cours', () => {
    expect(C.SUBJECTS.length).toBe(19)
    for (const s of C.SUBJECTS) {
      expect(s.name && s.color).toBeTruthy()
      expect(C.matiereChargee(s.id)).toBe(false)
      for (const t of s.chapters) {
        expect(t.name, t.id).toBeTruthy()
        expect(t.cours, `${t.id} ne doit pas encore avoir de cours`).toBeUndefined()
        expect(Array.isArray(t.games)).toBe(true)
      }
    }
    expect(C.search('contrat').length).toBeGreaterThan(0)
  })

  it('les scores se calculent sans charger le contenu', () => {
    const t = C.ALL_CHAPTERS['gf-t1']
    const etat = { chapters: { 'gf-t1': { games: Object.fromEntries(t.games.map((g) => [g.id, 100])), quiz: 100 } } }
    expect(chapterScore(etat, 'gf-t1')).toBe(100)
  })

  it('le score d’un thème est le même avant et après le chargement de sa matière', async () => {
    // L'index léger garde le type des exercices : il sait lesquels se lancent seuls.
    const id = 'sig-t2'
    const jouables = C.jeuxJouablesDuTheme(id)
    expect(jouables.length).toBeGreaterThan(0)
    const etat = { chapters: { [id]: { games: { [jouables[0].id]: 100 }, quiz: 50 } } }
    const avant = chapterScore(etat, id)
    await C.chargerMatiere('sig')
    expect(C.jeuxJouablesDuTheme(id).map((g) => g.id)).toEqual(jouables.map((g) => g.id))
    expect(chapterScore(etat, id)).toBe(avant)
  })

  it('charger une matière complète les objets déjà en main, une seule fois', async () => {
    const matiere = C.getSubject('droit')
    const theme = matiere.chapters[0]
    const entree = C.ALL_CHAPTERS[theme.id]
    const nbJeuxIndex = entree.games.length
    const vus = []
    const stop = C.surChargement((id) => vus.push(id))
    const p1 = C.chargerMatiere('droit')
    const p2 = C.chargerMatiere('droit')
    expect(p1).toBe(p2)
    await p1
    stop()
    expect(vus).toEqual(['droit'])
    expect(C.matiereChargee('droit')).toBe(true)
    expect(C.getSubject('droit')).toBe(matiere)
    expect(matiere.chapters[0]).toBe(theme)
    expect(C.ALL_CHAPTERS[theme.id]).toBe(entree)
    expect(theme.cours.length).toBeGreaterThan(0)
    expect(entree.cours).toBe(theme.cours)
    expect(entree.games.length).toBe(nbJeuxIndex)
    expect(C.matiereChargee('economie')).toBe(false)
  })

  it('l’index léger annonce exactement les exercices du thème assemblé', async () => {
    const index = Object.fromEntries(Object.entries(C.ALL_CHAPTERS).map(([id, t]) => [id, t.games.map((g) => g.id)]))
    await C.chargerTout()
    for (const [id, t] of Object.entries(C.ALL_CHAPTERS)) {
      expect(t.games.map((g) => g.id), id).toEqual(index[id])
      // Le compte calculé d'avance (maîtrise) suit le cours et ses exercices :
      // sinon, lancer « npm run chapitres ».
      const nb = C.themeChapters(t).map((ch) => Math.min(C.EXERCICES_POUR_MAITRISER, C.jeuxDuChapitre(ch, t).length))
      expect(C.exercicesParChapitre(id), `${id} : lancer « npm run chapitres »`).toEqual(nb)
    }
  })
})
