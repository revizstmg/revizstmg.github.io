import { beforeAll, describe, it, expect } from 'vitest'
import * as C from '../src/data/index.js'
import { answerMatchesCours } from '../src/games/common.jsx'
import { avecGraine } from './outils.js'

beforeAll(() => C.chargerTout())
const jeux = (id, blocks) => C.themeChapters({ id, subjectId: 'philosophie', cours: [{ h: 'Régression', blocks }], games: [] })[0].games
const trous = (games) => games.filter(g => g.type === 'trou').flatMap(g => g.questions)

describe('régressions des rapports pédagogiques de Claude', () => {
  it('garde les phrases entières et rattache les pronoms au contexte', () => {
    const games = jeux('philo-justice', [
      { t: 'p', c: 'La justice est un idéal moral et politique qui permet de juger les lois et les institutions. Comme **idéal**, elle guide les citoyens dans leur réflexion sur la manière de répartir les droits, de réparer les torts et de corriger les décisions injustes.' },
      { t: 'p', c: 'Dans la théorie d’Aristote, l’**équité** corrige la loi trop générale pour tenir compte du cas particulier.' },
    ])
    const q = trous(games).find(q => q.answer === 'idéal')
    expect(q.text).toContain('La justice est un idéal moral et politique')
    expect(q.text).toContain('Comme ____, elle guide')
    expect(q.text).toContain('décisions injustes.')
    expect(q.text).not.toMatch(/^…|…$/)
  })
  it('ne masque pas une proposition tronquée ni un mot collé à son voisin', () => {
    const games = jeux('philo-justice', [
      { t: 'p', c: '**La justice est l’**idéal au nom duquel on juge les lois et les institutions.' },
      { t: 'p', c: 'La **justice** est un idéal au nom duquel on juge les lois et les institutions.' },
      { t: 'p', c: 'La **loi** organise la vie commune dans une société et protège les droits de chacun.' },
    ])
    expect(trous(games).length).toBeGreaterThan(0)
    expect(trous(games).every(q => q.answer !== 'La justice est l’')).toBe(true)
    expect(trous(games).every(q => !/____[\p{L}]/u.test(q.text))).toBe(true)
  })
  it('accepte les noms usuels et les variantes relues sans confondre les auteurs', () => {
    const questions = C.themeChapters(C.ALL_CHAPTERS['philo-justice']).flatMap(ch => trous(ch.games))
    const q = questions.find(q => q.answer === 'Hannah Arendt')
    expect(q).toBeDefined()
    expect(answerMatchesCours('Arendt', q.answer, q.alt)).toBe(true)
    for (const [id, terme, variante] of [['philo-justice', 'légale', 'légal'], ['eco-t6', 'répartition', 'redistribution']]) {
      const gs = jeux(id, [
        { t: 'p', c: `La notion de **${terme}** correspond au premier principe expliqué précisément dans ce chapitre.` },
        { t: 'p', c: 'La **loi** organise les relations entre toutes les personnes dans une société.' },
      ])
      const item = trous(gs).find(q => q.answer === terme)
      expect(answerMatchesCours(variante, item.answer, item.alt)).toBe(true)
    }
    expect(answerMatchesCours('Aristote', 'Platon')).toBe(false)
  })
  it('ne propose pas un synonyme comme distracteur ni comme affirmation fausse', () => {
    const blocks = [{ t: 'table', h: 'Notions et définitions', head: ['Notion', 'Définition'], rows: [
      ['Répartition', 'Réduire les inégalités par les impôts et les prestations.'],
      ['Redistribution', 'Prélever des impôts et verser des prestations pour réduire les inégalités.'],
      ['Allocation', 'Financer les biens publics non rivaux et non excluables.'],
      ['Stabilisation', 'Lisser les fluctuations économiques pour soutenir la croissance.'],
      ['Déficit public', 'Dépenses publiques supérieures aux recettes publiques pendant une année.'],
    ] }]
    for (let i = 0; i < 30; i++) {
      const gs = avecGraine(`rapport-${i}`, () => jeux('eco-t6', blocks))
      for (const g of gs) for (const q of g.questions || []) {
        if (g.type === 'qcm' && /qcas|qtrou/.test(g.id) && /^(répartition|redistribution)$/i.test(q.choices[q.answer]))
          expect(q.choices.filter(x => /^(répartition|redistribution)$/i.test(x)).length).toBeLessThanOrEqual(1)
        if (g.type === 'vraifaux' && !q.answer && /« (Répartition|Redistribution) »/.test(q.statement))
          expect(q.statement).not.toMatch(/réduire les inégalités/i)
      }
    }
  })
  it('ne conserve pas les erreurs factuelles signalées dans les cours assemblés', () => {
    const philo = JSON.stringify(C.ALL_CHAPTERS['philo-justice']) + JSON.stringify(C.ALL_CHAPTERS['philo-art'])
    expect(philo).not.toMatch(/mérite ou son besoin|jugeant Eichmann|procès de Nuremberg|faire de la boue et d’en tirer de l’or|distingue trois formes de justice|rendre à chacun son dû \(Aristote\)|plaisir mêlé d’effroi/)
    expect(philo).toContain('Jérusalem en 1961')
    expect(philo).toContain('Tu m’as donné ta boue et j’en ai fait de l’or')
    const eco = JSON.stringify(C.ALL_CHAPTERS['eco-t6']) + JSON.stringify(C.ALL_CHAPTERS['eco-t7'])
    expect(eco).not.toMatch(/sous-emploi réel|grand remplacement/)
  })
})
