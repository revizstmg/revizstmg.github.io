// Empreinte de TOUT le contenu tel que l'élève le voit : cours assemblé,
// exercices générés, flashcards, définitions clés, test du thème, quiz, paquets.
// Le hasard est fixé par thème, donc un même code donne toujours la même
// empreinte. Si un test échoue après une modification :
//   - c'était voulu (correction d'un cours…) : `npm run test:maj` met à jour ;
//   - ce n'était pas voulu : la refonte a changé ce que voit l'élève.
// `EMPREINTE_DETAIL=1 npm test` écrit le détail de chaque thème dans
// tests/.detail/ pour comparer deux versions.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import * as C from '../src/data/index.js'
import { avecGraine, empreinte, serialiser } from './outils.js'

const DETAIL = process.env.EMPREINTE_DETAIL ? new URL('./.detail/', import.meta.url) : null
if (DETAIL) mkdirSync(DETAIL, { recursive: true })

// Le contenu se charge matière par matière : on charge tout avant l'empreinte.
beforeAll(() => C.chargerTout())

function ceQueVoitLEleve(themeId) {
  const theme = C.ALL_CHAPTERS[themeId]
  return avecGraine(themeId, () => ({
    theme,
    chapitres: C.themeChapters(theme).map(({ section, ...ch }) => ch),
    flashcards: (theme.cours || []).map((sec, i) => C.flashcardsForSection(sec, theme, i)),
    definitions: (theme.cours || []).map((sec, i) => C.sectionDefinitions(sec, themeId, theme.subjectId, i, 5)),
    paquet: C.deckForTheme(themeId),
    test: C.buildThemeTest(themeId),
    quiz: C.buildQuiz(themeId),
  }))
}

describe('contenu', () => {
  it('liste des matières et de leurs thèmes', () => {
    const plan = C.SUBJECTS.map((s) => ({
      id: s.id, name: s.name, niveau: s.niveau, color: s.color,
      themes: (s.chapters || []).map((c) => [c.id, c.name, (c.games || []).map((g) => g.id)]),
    }))
    expect(plan).toMatchSnapshot()
  })

  it('chaque thème : cours, exercices, flashcards, définitions, tests', () => {
    const empreintes = {}
    for (const id of Object.keys(C.ALL_CHAPTERS)) {
      const vu = ceQueVoitLEleve(id)
      empreintes[id] = empreinte(vu)
      if (DETAIL) writeFileSync(new URL(`${id}.json`, DETAIL), JSON.stringify(JSON.parse(serialiser(vu)), null, 1))
    }
    expect(empreintes).toMatchSnapshot()
  })

  it('paquets de flashcards par matière', () => {
    const empreintes = {}
    for (const s of C.SUBJECTS) empreintes[s.id] = empreinte(avecGraine(s.id, () => C.deckForSubject(s.id)))
    expect(empreintes).toMatchSnapshot()
  })

  it('recherche', () => {
    const r = {}
    for (const q of ['contrat', 'marché', 'seuil', 'guerre', 'dérivée', 'management', 'zz-introuvable']) r[q] = C.search(q)
    expect(r).toMatchSnapshot()
  })

  it('aucun thème vide et aucun exercice sans identifiant', () => {
    for (const [id, th] of Object.entries(C.ALL_CHAPTERS)) {
      if (th.comingSoon) continue
      expect.soft((th.cours || []).length, `${id} a un cours`).toBeGreaterThan(0)
      for (const g of th.games || []) expect.soft(g.id, `${id} : exercice sans id`).toBeTruthy()
    }
  })

  it('identifiants de thème uniques', () => {
    const ids = C.SUBJECTS.flatMap((s) => (s.chapters || []).map((c) => c.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
