import { beforeAll, describe, expect, it } from 'vitest'
import * as C from '../src/data/index.js'
import { chapterScore } from '../src/store.jsx'
import { avecGraine } from './outils.js'

beforeAll(() => C.chargerMatiere('p1-sgn'))
const vue = (theme, idx) => avecGraine('isolation', () => {
  const ch = C.themeChapters(theme)[idx]
  return { jeux: C.jeuxDuChapitre(ch, theme), definitions: C.sectionDefinitions(ch.section, theme.id, theme.subjectId, idx) }
})

describe('exercices limités au chapitre lu', () => {
  it('la personnalité ne pose aucune question sur le reste du thème', () => {
    const th = C.ALL_CHAPTERS['p1-sgn-t1']
    const ch = C.themeChapters(th).find((c) => c.title === 'La personnalité de l’individu')
    const jeux = C.jeuxDuChapitre(ch, th)
    expect(jeux.length).toBeGreaterThan(5)
    expect(JSON.stringify(jeux)).toContain('Tempérament')
    expect(JSON.stringify(jeux)).not.toMatch(/Maslow|Herzberg|Qualification|Capital humain|Communication formelle|Leadership|Cotisations/i)
    const notions = ch.section.blocks.at(-1).rows.map(([t]) => t)
    for (const c of jeux.find((g) => g.type === 'flashcard').cards) expect(notions).toContain(c.front)
  })

  it('modifier les chapitres suivants ne change ni les exercices ni les cartes du chapitre', () => {
    const th = C.ALL_CHAPTERS['p1-sgn-t1']
    const avant = vue(th, 1)
    const autres = { ...th, cours: th.cours.map((sec, i) => i <= 1 ? sec : {
      h: 'Un autre cours', blocks: [{ t: 'table', head: ['Notion', 'Définition'], rows: [
        ['Intrus alpha', 'Une définition étrangère alpha'], ['Intrus beta', 'Une définition étrangère beta'],
        ['Intrus gamma', 'Une définition étrangère gamma'], ['Intrus delta', 'Une définition étrangère delta'],
      ] }, { t: 'p', c: '**Intrus** apparaît ailleurs, sans rapport avec la personnalité.' }],
    }) }
    expect(vue(autres, 1)).toEqual(avant)
  })

  it('un cours court ne reçoit aucune définition de secours du thème ou de la matière', () => {
    const sec = { h: 'Court', blocks: [{ t: 'p', c: 'Une **organisation** poursuit un **but commun**.' }] }
    const theme = { id: 'p1-sgn-t1', subjectId: 'p1-sgn', cours: [sec], games: [] }
    expect(C.sectionDefinitions(sec, theme.id, 'p1-sgn').defs).toEqual([])
    expect(C.flashcardsForSection(sec, theme, 0)).toBeNull()
    expect(JSON.stringify(vue(theme, 0))).not.toMatch(/Maslow|Herzberg|Tempérament|Qualification/i)
  })

  it('un jeu non rattaché et un cas du thème ne sont pas placés arbitrairement', () => {
    const theme = { id: 'p1-sgn-t3', cours: [{ h: 'La valeur', blocks: [] }], games: [
      { id: 'sans-rattachement', type: 'calcul', gen: 'tva' },
      { id: 'p1-sgn-t3-tri', type: 'tri' },
    ] }
    expect(C.themeChapters(theme)[0].games).toEqual([])
  })

  it('les neuf anciennes questions à trous de SDGN sont rattachées à leur chapitre exact', () => {
    const attendus = {
      'p1-sgn-t1': { perception: 2, statut: 6, feedback: 7, 'savoir-faire': 12, qualification: 14, hygiène: 17 },
      'p1-sgn-t2': { confidentialité: 8, RGPD: 9, unique: 5 },
    }
    for (const [id, reponses] of Object.entries(attendus)) {
      const chs = C.themeChapters(C.ALL_CHAPTERS[id])
      const trouves = chs.flatMap((ch) => ch.games.filter((g) => g.id.startsWith(`${id}-trou`)).flatMap((g) => g.questions.map((q) => ({ idx: ch.idx, answer: q.answer }))))
      for (const [answer, idx] of Object.entries(reponses)) expect(trouves.filter((q) => q.answer === answer)).toEqual([{ idx, answer }])
    }
  })
})


describe('rattachements vérifiés après l’audit', () => {
  it('les cinq exercices sont accessibles dans leur cours et ne plafonnent plus la maîtrise', async () => {
    await C.chargerMatieres(['langues', 'philosophie'])
    for (const [themeId, gameId] of [
      ['philo-methode', 'philo-methode-ordre'], ['lng-en-verbs', 'lng-en-verbs-gen'],
      ['lng-es-verbs', 'lng-es-verbs-gen'], ['lng-en-grammar-ex', 'lng-en-grammar-gen'],
      ['lng-es-grammar-ex', 'lng-es-grammar-gen'],
    ]) {
      const th = C.ALL_CHAPTERS[themeId]
      const chs = C.themeChapters(th)
      const ch = chs.find((c) => c.games.some((g) => g.id === gameId))
      expect(ch, gameId).toBeTruthy()
      const jeux = chs.flatMap((c) => c.games)
      const etat = { chapters: { [themeId]: { games: Object.fromEntries(jeux.map((g) => [g.id, 100])), quiz: 100 } } }
      expect(chapterScore(etat, themeId), themeId).toBe(100)
      const jeu = ch.games.find((g) => g.id === gameId)
      if (jeu.type === 'ordre') continue
      // Le générateur général pouvait tirer des verbes ou des règles absents du cours.
      expect(jeu.gen).toBeUndefined()
      expect(jeu.questions.length).toBeGreaterThanOrEqual(jeu.count)
      const cours = JSON.stringify(ch.section).toLowerCase().replaceAll('*', '')
      for (const q of jeu.questions) expect(cours, `${gameId} : ${q.answer}`).toContain(q.answer.toLowerCase())
    }
  })
})
