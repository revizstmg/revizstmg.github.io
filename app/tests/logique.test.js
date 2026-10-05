// Logique de l'app : niveaux, scores, répétition espacée, récompenses, badges,
// calculs chiffrés, filières.
import { describe, it, expect } from 'vitest'
import { levelFromXp, chapterScore, starsFromScore, subjectScore, globalScore, isoWeekKey } from '../src/store.jsx'
import { srsUpdate, addDays, daysUntil, defaultBacDate } from '../src/data/srs.js'
import { dailyBase, dailyRewardFor, nextMilestone, MILESTONES } from '../src/data/rewards.js'
import { BADGES } from '../src/badges.js'
import { CALC, makeCalcSet } from '../src/calc.js'
import { LEVELS, subjectsForTrack, trackLabel } from '../src/data/tracks.js'
import { ALL_CHAPTERS, SUBJECTS } from '../src/data/index.js'
import { answerMatches, answerMatchesCours } from '../src/games/common.jsx'
import { avecGraine, empreinte } from './outils.js'

const vide = () => ({ xp: 0, streak: { count: 0 }, badges: [], chapters: {}, favorites: [], themeTime: {}, totalAnswers: 0, correctAnswers: 0 })

describe('niveaux', () => {
  it('paliers d’XP', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, into: 0, span: 100, pct: 0 })
    expect(levelFromXp(99).level).toBe(1)
    expect(levelFromXp(100).level).toBe(2)
    expect(levelFromXp(250)).toMatchObject({ level: 3, into: 0, span: 200 })
    expect(levelFromXp(5000)).toMatchObject({ level: 12, span: 1200 })
  })
  it('le pourcentage reste entre 0 et 100', () => {
    for (const xp of [0, 1, 99, 100, 777, 4999, 5000, 99999]) {
      const { pct } = levelFromXp(xp)
      expect(pct).toBeGreaterThanOrEqual(0)
      expect(pct).toBeLessThanOrEqual(100)
    }
  })
})

describe('scores', () => {
  const themeId = 'gf-t1'
  const theme = ALL_CHAPTERS[themeId]
  it('un thème jamais travaillé vaut 0', () => {
    expect(chapterScore(vide(), themeId)).toBe(0)
    expect(chapterScore(vide(), 'theme-inexistant')).toBe(0)
  })
  it('moyenne des exercices et du quiz, exercices non faits comptés 0', () => {
    const n = theme.games.length + 1
    const s = vide()
    s.chapters[themeId] = { games: { [theme.games[0].id]: 100 }, quiz: 100 }
    expect(chapterScore(s, themeId)).toBe(Math.round(200 / n))
    s.chapters[themeId] = { games: Object.fromEntries(theme.games.map((g) => [g.id, 100])), quiz: 100 }
    expect(chapterScore(s, themeId)).toBe(100)
  })
  it('étoiles', () => {
    expect([0, 24, 25, 59, 60, 89, 90, 100].map(starsFromScore)).toEqual([0, 0, 1, 1, 2, 2, 3, 3])
  })
  it('score de matière et score global', () => {
    const s = vide()
    expect(subjectScore(s, 'gestion-finance')).toBe(0)
    expect(globalScore(s)).toBe(0)
    const gf = SUBJECTS.find((x) => x.id === 'gestion-finance')
    for (const c of gf.chapters) s.chapters[c.id] = { games: Object.fromEntries(c.games.map((g) => [g.id, 100])), quiz: 100 }
    expect(subjectScore(s, 'gestion-finance')).toBe(100)
  })
  it('semaine ISO', () => {
    expect(isoWeekKey(new Date(2026, 0, 1))).toBe('2026-W01')
    expect(isoWeekKey(new Date(2026, 9, 4))).toBe('2026-W40')
    expect(isoWeekKey(new Date(2027, 0, 1))).toBe('2026-W53')
  })
})

describe('répétition espacée', () => {
  const j0 = '2026-10-01'
  it('réussite : intervalles 2, 4 puis multipliés', () => {
    const a = srsUpdate(null, 90, j0)
    expect(a).toMatchObject({ reps: 1, interval: 2, due: '2026-10-03', score: 90 })
    const b = srsUpdate(a, 90, a.due)
    expect(b).toMatchObject({ reps: 2, interval: 4 })
    const c = srsUpdate(b, 90, b.due)
    expect(c.reps).toBe(3)
    expect(c.interval).toBeGreaterThan(4)
  })
  it('échec : on réapprend le lendemain', () => {
    const a = srsUpdate({ interval: 10, ease: 2.3, reps: 3 }, 40, j0)
    expect(a).toMatchObject({ reps: 0, interval: 1, due: '2026-10-02', ease: 2.1 })
  })
  it('jamais plus de 60 jours, facilité bornée', () => {
    let s = null
    for (let i = 0; i < 30; i++) s = srsUpdate(s, 100, j0)
    expect(s.interval).toBeLessThanOrEqual(60)
    expect(s.ease).toBeLessThanOrEqual(2.9)
    for (let i = 0; i < 30; i++) s = srsUpdate(s, 0, j0)
    expect(s.ease).toBeGreaterThanOrEqual(1.3)
  })
  it('dates', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(daysUntil('2026-10-11', '2026-10-01')).toBe(10)
    expect(daysUntil(null)).toBeNull()
    expect(defaultBacDate(new Date(2026, 9, 4))).toBe('2027-06-16')
    expect(defaultBacDate(new Date(2027, 2, 1))).toBe('2027-06-16')
  })
})

describe('récompenses de connexion', () => {
  it('XP du jour croissante et plafonnée', () => {
    expect([1, 2, 5, 9, 50].map(dailyBase)).toEqual([10, 15, 30, 50, 50])
  })
  it('bonus aux paliers', () => {
    for (const m of MILESTONES) expect(dailyRewardFor(m.day).bonus).toBe(m.xp)
    expect(dailyRewardFor(4).bonus).toBe(0)
  })
  it('prochain palier', () => {
    expect(nextMilestone(0)).toMatchObject({ day: 3, daysLeft: 3, pct: 0 })
    expect(nextMilestone(5)).toMatchObject({ day: 7, daysLeft: 2, pct: 50 })
    expect(nextMilestone(100)).toBeNull()
  })
})

describe('badges', () => {
  it('identifiants uniques', () => {
    const ids = BADGES.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('chaque badge se teste sans erreur, sur un élève débutant comme confirmé', () => {
    const debutant = vide()
    const confirme = { ...vide(), xp: 6000, streak: { count: 120 }, favorites: ['gf-t1'], profile: { firstName: 'Léa' }, totalAnswers: 900, correctAnswers: 800 }
    const derive = { global: 80, bySubject: {}, byChapter: {}, chaptersMastered: 12, subjectsPlayed: 6, level: 12, weeklyCourses: 5 }
    for (const b of BADGES) {
      expect(() => b.check(debutant, { ...derive, global: 0, chaptersMastered: 0, subjectsPlayed: 0, level: 1 })).not.toThrow()
      expect(() => b.check(confirme, derive)).not.toThrow()
    }
  })
  it('un débutant n’a aucun badge, sauf ceux d’inscription', () => {
    const obtenus = BADGES.filter((b) => b.check(vide(), { global: 0, bySubject: {}, byChapter: {}, chaptersMastered: 0, subjectsPlayed: 0, level: 1 }))
    expect(obtenus.map((b) => b.id)).toEqual([])
  })
})

describe('calcul express', () => {
  const generateurs = Object.keys(CALC)
  it('il y a des générateurs', () => expect(generateurs.length).toBeGreaterThan(10))
  it.each(generateurs)('%s : 200 tirages cohérents', (id) => {
    avecGraine(id, () => {
      for (const ex of makeCalcSet(id, 200)) {
        expect(ex.prompt, 'énoncé').toBeTruthy()
        expect(Number.isFinite(ex.answer), `réponse finie : ${ex.answer}`).toBe(true)
        expect(ex.tolerance ?? 0).toBeGreaterThanOrEqual(0)
        const texte = `${ex.prompt}\n${ex.explain}`
        expect(texte, 'aucun NaN / undefined / Infinity dans le texte').not.toMatch(/NaN|undefined|Infinity/)
      }
    })
  })
  it('mêmes tirages pour une même graine', () => {
    const e = Object.fromEntries(generateurs.map((id) => [id, empreinte(avecGraine(id, () => makeCalcSet(id, 5)))]))
    expect(e).toMatchSnapshot()
  })
})

describe('filières', () => {
  it('Terminale : la spécialité puis le tronc commun', () => {
    for (const spec of LEVELS.find((l) => l.id === 'terminale-stmg').specialties) {
      const subs = subjectsForTrack({ level: 'terminale-stmg', specialty: spec.id })
      expect(subs[0].id).toBe(spec.id)
      expect(subs.map((s) => s.id)).toEqual(expect.arrayContaining(['management', 'droit', 'economie', 'maths', 'philosophie']))
      expect(trackLabel({ level: 'terminale-stmg', specialty: spec.id })).toContain(spec.name)
    }
  })
  it('Première : uniquement les matières de Première', () => {
    const subs = subjectsForTrack({ level: 'premiere-stmg' })
    expect(subs.length).toBeGreaterThan(0)
    expect(subs.every((s) => s.niveau === 'premiere')).toBe(true)
  })
  it('pas de filière, pas de matière', () => expect(subjectsForTrack(null)).toEqual([]))
})

describe('correction des réponses écrites', () => {
  it('exercices de cours : article, numéro et ponctuation ne comptent pas', () => {
    expect(answerMatchesCours('convention collective', 'La convention collective')).toBe(true)
    expect(answerMatchesCours('mineure', '5. La mineure')).toBe(true)
    expect(answerMatchesCours('Dommages intérêts.', 'Les dommages-intérêts')).toBe(true)
    expect(answerMatchesCours('extracontractuelle', 'délictuelle', ['extracontractuelle'])).toBe(true)
    expect(answerMatchesCours('majeure', '5. La mineure')).toBe(false)
  })
  it('langues : l’article reste exigé', () => {
    expect(answerMatches('casa', 'la casa')).toBe(false)
  })
})
