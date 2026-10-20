// « Ma séance du jour » : erreurs dues, révision, puis le prochain exercice.
import { beforeAll, describe, expect, it } from 'vitest'
import * as C from '../src/data/index.js'
import { composerSeance, prochainExercice } from '../src/data/seance.js'
import { majCarnet } from '../src/store.jsx'

const track = { level: 'terminale-stmg', specialty: 'gestion-finance' }
const vide = () => ({ xp: 0, streak: { count: 0 }, badges: [], chapters: {}, favorites: [], erreurs: [], srs: {}, track })
beforeAll(() => C.chargerTout())

describe('séance du jour', () => {
  it('un élève qui débute : seulement « avancer », sur le premier exercice du cours', () => {
    const etapes = composerSeance(vide(), track, '2026-10-20')
    expect(etapes.map((e) => e.id)).toEqual(['avancer'])
    expect(etapes[0].game?.id).toBeTruthy()
    expect(C.chapitreDuJeu(etapes[0].themeId, etapes[0].game.id)).toBe(etapes[0].chapitre)
  })
  it('erreurs dues, révision due et cours : trois étapes dans cet ordre', () => {
    const s = vide()
    const q = { q: 'Question ratée', choices: ['A', 'B'], answer: 0 }
    s.erreurs = majCarnet([], { themeId: 'droit-t5', type: 'qcm', ratees: [q] }, '2026-10-18')
    s.chapters['eco-t6'] = { games: { 'eco-t6::0::qdef': 40 }, quiz: 0, worked: true }
    s.srs['eco-t6'] = { due: '2026-10-19' }
    const etapes = composerSeance(s, track, '2026-10-20', 'gf-t1')
    expect(etapes.map((e) => e.id)).toEqual(['erreurs', 'revision', 'avancer'])
    expect(etapes[0].game.questions).toEqual([q])
    expect(etapes[1].themeId).toBe('eco-t6')
    expect(etapes[1].game.questions.length).toBeGreaterThanOrEqual(3)
    expect(etapes[2].themeId).toBe('gf-t1')
  })
  it('une erreur pas encore due n’entre pas dans la séance', () => {
    const s = vide()
    s.erreurs = majCarnet([], { themeId: 'droit-t5', type: 'qcm', ratees: [{ q: 'X', choices: ['A', 'B'], answer: 0 }] }, '2026-10-20')
    expect(composerSeance(s, track, '2026-10-20').map((e) => e.id)).not.toContain('erreurs')
  })
  it('un chapitre maîtrisé est sauté : on passe au suivant', () => {
    const s = vide()
    const premier = prochainExercice(s, track, 'gf-t1')
    const theme = C.ALL_CHAPTERS['gf-t1']
    const jeux = C.jeuxDuChapitre(C.themeChapters(theme)[premier.chapitre.idx], theme)
    s.chapters['gf-t1'] = { games: Object.fromEntries(jeux.map((g) => [g.id, 100])), quiz: 0 }
    const suivant = prochainExercice(s, track, 'gf-t1')
    expect(suivant.themeId === 'gf-t1' ? suivant.chapitre.idx : Infinity).toBeGreaterThan(premier.chapitre.idx)
  })
})
