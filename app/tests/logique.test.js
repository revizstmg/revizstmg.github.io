// Logique de l'app : niveaux, scores, répétition espacée, récompenses, badges,
// calculs chiffrés, filières.
import { describe, it, expect } from 'vitest'
import { levelFromXp, chapterScore, starsFromScore, subjectScore, globalScore, isoWeekKey, mergeProgress, majCarnet, cleErreur, erreursDues, CARNET_MAX } from '../src/store.jsx'
import { srsUpdate, addDays, daysUntil, defaultBacDate } from '../src/data/srs.js'
import { CALENDRIER, epreuvesAVenir, premiereEpreuve } from '../src/data/epreuves.js'
import { dailyBase, dailyRewardFor, nextMilestone, MILESTONES } from '../src/data/rewards.js'
import { BADGES } from '../src/badges.js'
import { CALC, makeCalcSet } from '../src/calc.js'
import { LEVELS, subjectsForTrack, trackLabel } from '../src/data/tracks.js'
import { ALL_CHAPTERS, SUBJECTS, jeuxJouablesDuTheme, chapitreDuJeu, chargerPourTheme, exercicesParChapitre, notionDuChoix } from '../src/data/index.js'
import { answerMatches, answerMatchesCours, melangerChoix } from '../src/games/common.jsx'
import { avecGraine, empreinte } from './outils.js'

const vide = () => ({ xp: 0, streak: { count: 0 }, badges: [], chapters: {}, favorites: [], themeTime: {}, totalAnswers: 0, correctAnswers: 0 })

describe('niveaux', () => {
  it('paliers d’XP', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, into: 0, span: 100, pct: 0 })
    expect(levelFromXp(99).level).toBe(1)
    expect(levelFromXp(100).level).toBe(2)
    expect(levelFromXp(250)).toMatchObject({ level: 3, into: 0, span: 200 })
    // Le niveau 12 ouvre désormais sur un vrai niveau 13 à 6 500 XP.
    expect(levelFromXp(5000)).toMatchObject({ level: 12, span: 1500 })
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
  it('les exercices des chapitres comptent : 3 réussis par chapitre pour le maîtriser', () => {
    // Compte calculé d'avance : le cours n'est pas chargé ici.
    expect(theme.cours).toBeUndefined()
    const nb = exercicesParChapitre(themeId)
    const n = nb.filter(Boolean).length
    expect(nb[0]).toBe(3)
    const s = vide()
    s.chapters[themeId] = { games: { [`${themeId}::0::qdef0`]: 100 }, quiz: 0 }
    expect(chapterScore(s, themeId)).toBe(Math.round(100 / 3 / n))
    s.chapters[themeId] = { games: { [`${themeId}::0::qdef0`]: 100, [`${themeId}::0::vf`]: 100, [`${themeId}::0::trou`]: 100, [`${themeId}::0::assoc`]: 40 }, quiz: 0 }
    expect(chapterScore(s, themeId)).toBe(Math.round(100 / n))
  })
  it('un chapitre de 1 ou 2 exercices est maîtrisé quand ils sont tous réussis', () => {
    const [id, i] = Object.entries(ALL_CHAPTERS).flatMap(([tid]) => exercicesParChapitre(tid).map((nb, j) => [tid, j, nb])).find(([, , nb]) => nb === 2)
    const n = exercicesParChapitre(id).filter(Boolean).length
    const s = vide()
    s.chapters[id] = { games: { [`${id}::${i}::a`]: 100, [`${id}::${i}::b`]: 100 }, quiz: 0 }
    expect(chapterScore(s, id)).toBe(Math.round(100 / n))
  })
  it('le test du thème compte s’il est meilleur ; les modes transverses ne comptent pas', () => {
    const s = vide()
    s.chapters[themeId] = { games: { exam: 100, daily: 100, 'coach-ia': 100 }, quiz: 0 }
    expect(chapterScore(s, themeId)).toBe(0)
    s.chapters[themeId].quiz = 92
    expect(chapterScore(s, themeId)).toBe(92)
  })
  it('chaque thème peut atteindre 100 %, par ses chapitres ou par son test', () => {
    const plafonnes = Object.keys(ALL_CHAPTERS).filter((id) => {
      const s = vide()
      const games = {}
      exercicesParChapitre(id).forEach((nb, i) => { for (let k = 0; k < nb; k++) games[`${id}::${i}::ex${k}`] = 100 })
      s.chapters[id] = { games, quiz: 0 }
      const parChapitres = chapterScore(s, id)
      s.chapters[id] = { games: {}, quiz: 100 }
      return parChapitres !== 100 || chapterScore(s, id) !== 100
    })
    expect(plafonnes).toEqual([])
  })
  it('étoiles', () => {
    expect([0, 24, 25, 59, 60, 89, 90, 100].map(starsFromScore)).toEqual([0, 0, 1, 1, 2, 2, 3, 3])
  })
  it('score de matière et score global', () => {
    const s = vide()
    expect(subjectScore(s, 'gestion-finance')).toBe(0)
    expect(globalScore(s)).toBe(0)
    const gf = SUBJECTS.find((x) => x.id === 'gestion-finance')
    for (const c of gf.chapters) s.chapters[c.id] = { games: {}, quiz: 100 }
    expect(subjectScore(s, 'gestion-finance')).toBe(100)
  })
  it('semaine ISO', () => {
    expect(isoWeekKey(new Date(2026, 0, 1))).toBe('2026-W01')
    expect(isoWeekKey(new Date(2026, 9, 4))).toBe('2026-W40')
    expect(isoWeekKey(new Date(2027, 0, 1))).toBe('2026-W53')
  })
})

// Fusion de la progression de l'appareil et de celle du compte (au démarrage et
// à la connexion). Le compte et l'appareil gardent chacun une copie : fusionner
// deux fois la même progression ne doit rien changer.
describe('fusion appareil ↔ compte', () => {
  const progression = () => ({
    ...vide(),
    xp: 420,
    themeTime: { 'gf-t1': 1800, 'droit-t5': 600 },
    notes: { 'gf-t1': 'TVA : HT × taux' },
    grandOral: { spec: 'gestion-finance', q1: 'Pourquoi les entreprises ?', q2: '', notes: '' },
  })
  it('fusionner une progression avec sa propre copie ne la change pas', () => {
    const p = progression()
    const f = mergeProgress(progression(), progression())
    expect(f.themeTime).toEqual(p.themeTime)
    expect(f.xp).toBe(p.xp)
    expect(f.grandOral).toEqual(p.grandOral)
    // Ouvrir l'app trois fois de suite ne fait pas grimper le temps.
    let s = progression()
    for (let i = 0; i < 3; i++) s = mergeProgress(s, progression())
    expect(s.themeTime).toEqual(p.themeTime)
  })
  it('le temps de chaque thème garde la valeur la plus grande', () => {
    const appareil = { ...progression(), themeTime: { 'gf-t1': 2400 } }
    const compte = { ...progression(), themeTime: { 'gf-t1': 1800, 'droit-t5': 600 } }
    expect(mergeProgress(appareil, compte).themeTime).toEqual({ 'gf-t1': 2400, 'droit-t5': 600 })
  })
  it('la préparation du Grand Oral est récupérée depuis le compte', () => {
    const neuf = { ...vide(), grandOral: { spec: '', q1: '', q2: '', notes: '' } }
    const compte = { ...progression(), grandOral: { spec: 'gestion-finance', q1: 'Question 1', q2: 'Question 2', notes: 'Plan en deux parties' } }
    expect(mergeProgress(neuf, compte).grandOral).toEqual(compte.grandOral)
  })
})

describe('dates des épreuves', () => {
  it('chaque date du calendrier est une vraie date, la fin après le début', () => {
    for (const e of CALENDRIER.epreuves) {
      for (const d of [e.debut, e.fin].filter(Boolean)) expect(new Date(d + 'T00:00:00Z').toISOString().slice(0, 10), e.id).toBe(d)
      if (e.fin) expect(e.fin >= e.debut, e.id).toBe(true)
      expect(['terminale', 'premiere']).toContain(e.niveau)
      expect(e.debut || e.note, `${e.id} : une date ou une explication`).toBeTruthy()
    }
  })
  it('le compte à rebours part de la première épreuve écrite du niveau', () => {
    expect(premiereEpreuve('terminale-stmg', '2026-10-12')).toBe('2027-06-14')
    expect(premiereEpreuve('premiere-stmg', '2026-10-12')).toBe('2027-06-15')
    const tle = epreuvesAVenir('terminale-stmg', '2026-10-12')
    expect(tle.map((e) => e.id)).toEqual(['philo', 'specialites', 'grand-oral'])
    expect(tle[0].jours).toBe(daysUntil('2027-06-14', '2026-10-12'))
  })
  it('une fois la session passée, plus d’épreuve ni de date par défaut', () => {
    expect(epreuvesAVenir('terminale-stmg', '2027-07-10')).toEqual([])
    expect(premiereEpreuve('terminale-stmg', '2027-07-10')).toBeNull()
  })
})

describe('carnet d’erreurs', () => {
  const q = (n) => ({ q: `Question ${n}`, choices: ['A', 'B'], answer: 0 })
  it('une question ratée entre ; elle sort après 3 réussites espacées (1, 3 puis 7 jours)', () => {
    const noter = (c, quoi, jour) => majCarnet(c, { themeId: 'gf-t1', type: 'qcm', ...quoi }, jour)
    let c = noter([], { ratees: [q(1), q(2)] }, '2026-10-01')
    expect(c.map((e) => [e.q.q, e.boite, e.due])).toEqual([['Question 1', 0, '2026-10-02'], ['Question 2', 0, '2026-10-02']])
    expect(erreursDues(c, '2026-10-01')).toEqual([])
    // Refaite juste après la série : bien joué, mais elle reste.
    c = noter(c, { reussies: [q(1)] }, '2026-10-01')
    expect(c.find((e) => e.q.q === 'Question 1')).toMatchObject({ boite: 0, due: '2026-10-02' })
    c = noter(c, { reussies: [q(1)] }, '2026-10-02')
    expect(c.find((e) => e.q.q === 'Question 1')).toMatchObject({ boite: 1, due: '2026-10-05' })
    c = noter(c, { reussies: [q(1)] }, '2026-10-03') // pas encore due : ne bouge pas
    expect(c.find((e) => e.q.q === 'Question 1')).toMatchObject({ boite: 1, due: '2026-10-05' })
    c = noter(c, { reussies: [q(1)] }, '2026-10-06')
    expect(c.find((e) => e.q.q === 'Question 1')).toMatchObject({ boite: 2, due: '2026-10-13' })
    expect(erreursDues(c, '2026-10-06').map((e) => e.q.q)).toEqual(['Question 2'])
    c = noter(c, { reussies: [q(1)] }, '2026-10-13')
    expect(c.map((e) => e.q.q)).toEqual(['Question 2'])
  })
  it('ratée de nouveau, une question repart de la première boîte', () => {
    let c = majCarnet([], { themeId: 'gf-t1', type: 'qcm', ratees: [q(1)] }, '2026-10-01')
    c = majCarnet(c, { themeId: 'gf-t1', type: 'qcm', reussies: [q(1)] }, '2026-10-02')
    c = majCarnet(c, { themeId: 'gf-t1', type: 'qcm', ratees: [q(1)] }, '2026-10-05')
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ boite: 0, due: '2026-10-06', le: '2026-10-05' })
  })
  it('une ancienne entrée (sans date) est à revoir tout de suite', () => {
    const ancienne = { id: cleErreur('qcm', q(1)), themeId: 'gf-t1', type: 'qcm', q: q(1), le: '2026-09-01' }
    expect(erreursDues([ancienne], '2026-10-01')).toHaveLength(1)
    const c = majCarnet([ancienne], { themeId: 'gf-t1', type: 'qcm', reussies: [q(1)] }, '2026-10-01')
    expect(c[0]).toMatchObject({ boite: 1, due: '2026-10-04' })
  })
  it('un mode qui mélange les thèmes range chaque question dans le sien', () => {
    const c = majCarnet([], { themeId: null, type: 'qcm', ratees: [{ ...q(1), themeId: 'droit-t5' }, { ...q(2), themeId: 'gf-t2' }, q(3)] }, '2026-10-01')
    expect(c.map((e) => [e.q.q, e.themeId])).toEqual([['Question 1', 'droit-t5'], ['Question 2', 'gf-t2']])
  })
  it('ratée deux fois, une question n’apparaît qu’une fois, en tête', () => {
    let c = majCarnet([], { themeId: 'gf-t1', type: 'qcm', ratees: [q(1), q(2)] }, '2026-10-01')
    c = majCarnet(c, { themeId: 'gf-t1', type: 'qcm', ratees: [q(2)] }, '2026-10-03')
    expect(c.map((e) => [e.q.q, e.le])).toEqual([['Question 2', '2026-10-03'], ['Question 1', '2026-10-01']])
  })
  it('même énoncé, types différents : deux entrées distinctes', () => {
    expect(cleErreur('qcm', { q: 'X' })).not.toBe(cleErreur('trou', { text: 'X' }))
  })
  it('le carnet a une taille limitée', () => {
    const beaucoup = Array.from({ length: CARNET_MAX + 30 }, (_, i) => q(i))
    expect(majCarnet([], { themeId: 'gf-t1', type: 'qcm', ratees: beaucoup }, '2026-10-01')).toHaveLength(CARNET_MAX)
  })
  it('fusion appareil ↔ compte : union sans doublon', () => {
    const a = { ...vide(), erreurs: majCarnet([], { themeId: 'gf-t1', type: 'qcm', ratees: [q(1)] }, '2026-10-01') }
    const b = { ...vide(), erreurs: majCarnet([], { themeId: 'gf-t1', type: 'qcm', ratees: [q(1), q(2)] }, '2026-10-02') }
    expect(mergeProgress(a, b).erreurs.map((e) => e.q.q).sort()).toEqual(['Question 1', 'Question 2'])
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

// En dernier : charge le cours d'un thème (les tests de score plus haut
// travaillent sans lui).
describe('score d’un thème, cours chargé', () => {
  it('un exercice rédigé compte dans le chapitre où il est placé', async () => {
    await chargerPourTheme('gf-t1')
    const n = exercicesParChapitre('gf-t1').filter(Boolean).length
    const jeu = jeuxJouablesDuTheme('gf-t1').find((g) => !g.id.includes('::') && chapitreDuJeu('gf-t1', g.id) != null)
    expect(jeu).toBeTruthy()
    const s = vide()
    s.chapters['gf-t1'] = { games: { [jeu.id]: 90, 'gf-t1-inconnu': 100 }, quiz: 0 }
    expect(chapterScore(s, 'gf-t1')).toBe(Math.round(90 / 3 / n))
  })
  it('« Pourquoi ? » : une proposition choisie à tort est rattachée à sa notion', async () => {
    await chargerPourTheme('gf-t1')
    expect(notionDuChoix('gf-t1', 'Sur les achats → créance sur l’État')).toMatchObject({ term: 'TVA déductible', idx: 0, est: 'definition' })
    expect(notionDuChoix('gf-t1', 'tva déductible')).toMatchObject({ def: 'Sur les achats → créance sur l’État', est: 'terme' })
    expect(notionDuChoix('gf-t1', 'une réponse inventée')).toBeNull()
    expect(notionDuChoix('theme-inexistant', 'TVA')).toBeNull()
  })
})

describe('études de documents', () => {
  it('les propositions sont mélangées et la bonne réponse suit', () => {
    const q = { q: 'Question', choices: ['bonne', 'b', 'c', 'd'], answer: 0 }
    const positions = new Set()
    for (let k = 0; k < 60; k++) {
      const m = melangerChoix(q)
      expect(m.choices[m.answer]).toBe('bonne')
      expect([...m.choices].sort()).toEqual([...q.choices].sort())
      positions.add(m.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
    const redac = { q: 'À rédiger', type: 'redac', answer: 'texte' }
    expect(melangerChoix(redac)).toBe(redac)
  })
})
