import { describe, it, expect, beforeAll } from 'vitest'
import * as C from '../src/data/index.js'
import { construirePlan, themesDuParcours, matieresDuParcours, maitriseTheme, cibleMaitrise, composerPositionnement, resultatPositionnement, echeances, lundiDe, avancementSemaine, OBJECTIFS_DEFAUT } from '../src/data/parcours.js'

const TERM = { level: 'terminale-stmg', specialty: 'gestion-finance' }
const PREM = { level: 'premiere-stmg' }
const AUJOURDHUI = '2026-11-02' // un lundi
let themes, themesP
beforeAll(async () => { await C.chargerTout(); themes = themesDuParcours(TERM); themesP = themesDuParcours(PREM) })
const etat = (extra = {}) => ({ chapters: {}, srs: {}, bacDate: null, parcours: { objectifs: { ...OBJECTIFS_DEFAUT } }, ...extra })

describe('cible de maîtrise', () => {
  it('croît avec la note visée et reste bornée', () => {
    const c = [8, 10, 12, 14, 16, 18].map(cibleMaitrise)
    expect(c).toEqual([...c].sort((a, b) => a - b))
    expect(c[0]).toBe(50); expect(c[5]).toBeLessThanOrEqual(95)
    expect(cibleMaitrise(0)).toBe(45); expect(cibleMaitrise(30)).toBe(95)
  })
})

describe('échéances', () => {
  it('chaque matière a la date de son épreuve, le contrôle continu la fin des écrits', () => {
    const e = echeances('terminale-stmg', etat(), AUJOURDHUI)
    expect(e('philosophie')).toBe('2027-06-14')
    expect(e('droit')).toBe('2027-06-16')
    expect(e('maths')).toBe('2027-06-17')
    const p = echeances('premiere-stmg', etat(), AUJOURDHUI)
    expect(p('p1-francais')).toBe('2027-06-15'); expect(p('p1-maths')).toBe('2027-06-21')
  })
  it('la date choisie par l’élève l’emporte, sauf si elle est passée', () => {
    expect(echeances('terminale-stmg', etat({ bacDate: '2027-03-01' }), AUJOURDHUI)('philosophie')).toBe('2027-03-01')
    expect(echeances('terminale-stmg', etat({ bacDate: '2026-01-01' }), AUJOURDHUI)('philosophie')).toBe('2027-06-14')
  })
  it('lundiDe renvoie le lundi de la semaine', () => {
    expect(lundiDe('2026-11-02')).toBe('2026-11-02'); expect(lundiDe('2026-11-08')).toBe('2026-11-02'); expect(lundiDe('2026-11-04')).toBe('2026-11-02')
  })
})

describe('maîtrise estimée', () => {
  it('sans donnée : valeur prudente ; le test de positionnement la remplace', () => {
    const t = themes[0]
    expect(maitriseTheme(etat(), t, AUJOURDHUI).maitrise).toBe(35)
    const pos = { [t.subjectId]: { score: 80, themes: { [t.themeId]: { ok: 1, total: 1 } } } }
    expect(maitriseTheme(etat(), t, AUJOURDHUI, pos).maitrise).toBe(100)
    expect(maitriseTheme(etat(), t, AUJOURDHUI, { [t.subjectId]: { score: 80, themes: {} } }).maitrise).toBe(72)
  })
  it('l’activité pèse plus que le test, et une révision en retard fait baisser la maîtrise', () => {
    const t = themes[0]
    const pos = { [t.subjectId]: { score: 0, themes: { [t.themeId]: { ok: 0, total: 1 } } } }
    const th = C.ALL_CHAPTERS[t.themeId]
    const jeux = Object.fromEntries(C.themeChapters(th).flatMap((ch) => C.jeuxDuChapitre(ch, th).map((g) => [g.id, 100])))
    const travaille = etat({ chapters: { [t.themeId]: { quiz: 1, games: jeux } } })
    const a = maitriseTheme(travaille, t, AUJOURDHUI, pos)
    expect(a.pratique).toBe(true); expect(a.maitrise).toBeGreaterThan(0)
    const enRetard = etat({ chapters: travaille.chapters, srs: { [t.themeId]: { due: '2026-10-01' } } })
    expect(maitriseTheme(enRetard, t, AUJOURDHUI, pos).maitrise).toBeLessThan(a.maitrise)
  })
})

describe('test de positionnement', () => {
  it('une question par thème, taguée, sans doublon', () => {
    const subjectId = matieresDuParcours(TERM).find((m) => m.themes >= 3).id
    const qs = composerPositionnement(subjectId, 6)
    expect(qs.length).toBeGreaterThanOrEqual(3)
    expect(new Set(qs.map((q) => q.q)).size).toBe(qs.length)
    for (const q of qs) { expect(q.themeId).toBeTruthy(); expect(q.choices.length).toBeGreaterThanOrEqual(2); expect(q.choices[q.answer]).toBeTruthy() }
  })
  it('le résultat donne le score et la réussite par thème', () => {
    const r = resultatPositionnement({ reussies: [{ themeId: 'a' }, { themeId: 'b' }], ratees: [{ themeId: 'b' }, { themeId: 'c' }] }, AUJOURDHUI)
    expect(r.score).toBe(50); expect(r.themes).toEqual({ a: { ok: 1, total: 1 }, b: { ok: 1, total: 2 }, c: { ok: 0, total: 1 } })
    expect(resultatPositionnement({}, AUJOURDHUI).score).toBe(0)
  })
})

describe('plan semaine par semaine', () => {
  const plan = (o = {}, s = {}) => construirePlan({ state: etat({ parcours: { objectifs: { ...OBJECTIFS_DEFAUT, ...o } }, ...s }), track: TERM, today: AUJOURDHUI, themes })

  it('couvre tous les thèmes, du lundi courant à la dernière épreuve, sans dépasser la capacité', () => {
    const p = plan({ heuresSemaine: 10 })
    expect(p.semaines[0].debut).toBe('2026-11-02')
    expect(p.semaines.at(-1).debut <= '2027-06-17').toBe(true)
    for (const s of p.semaines) expect(s.minutes).toBeLessThanOrEqual(s.capacite)
    const vus = new Set(p.semaines.flatMap((s) => s.taches.map((t) => t.themeId)))
    expect(vus.size).toBe(themes.length)
    expect(p.faisable).toBe(true); expect(p.manque).toBe(0)
  })
  it('chaque tâche est placée avant l’épreuve de sa matière', () => {
    const p = plan({ heuresSemaine: 10 })
    const e = echeances('terminale-stmg', etat(), AUJOURDHUI)
    for (const s of p.semaines) for (const t of s.taches) expect(s.debut < e(t.subjectId), `${t.themeId} ${s.debut}`).toBe(true)
  })
  it('un thème est découvert avant d’être consolidé, et le rappel vient dans les deux dernières semaines', () => {
    const p = plan({ heuresSemaine: 10 })
    for (const t of themes.slice(0, 6)) {
      const taches = p.semaines.flatMap((s) => s.taches.filter((x) => x.themeId === t.themeId).map((x) => ({ ...x, i: s.index })))
      const d = taches.find((x) => x.kind === 'decouvrir'), c = taches.find((x) => x.kind === 'consolider'), r = taches.find((x) => x.kind === 'rappel')
      if (d && c) expect(d.i).toBeLessThanOrEqual(c.i)
      if (r) { const echeance = echeances('terminale-stmg', etat(), AUJOURDHUI)(t.subjectId); expect(r.i).toBeGreaterThanOrEqual(Math.floor((new Date(echeance) - new Date(p.semaines[0].debut)) / 6048e5) - 2) }
    }
  })
  it('une note plus ambitieuse et des matières difficiles demandent plus de travail', () => {
    const base = plan({ noteVisee: 10 }), haut = plan({ noteVisee: 17 })
    expect(haut.minutesTotal).toBeGreaterThan(base.minutesTotal)
    const dur = plan({ noteVisee: 10, difficiles: [themes[0].subjectId] })
    expect(dur.minutesTotal).toBeGreaterThan(base.minutesTotal)
  })
  it('trop peu d’heures : le plan le dit et propose un volume réalisable', () => {
    const p = plan({ heuresSemaine: 1, noteVisee: 18 })
    expect(p.faisable).toBe(false); expect(p.manque).toBeGreaterThan(0)
    expect(p.heuresConseillees).toBeGreaterThan(1)
    const ok = plan({ heuresSemaine: p.heuresConseillees, noteVisee: 18 })
    expect(ok.manque).toBeLessThan(p.manque)
  })
  it('le plan s’adapte : un thème maîtrisé demande moins de travail, un thème en retard plus', () => {
    const t = themes[0]
    const avant = plan({ heuresSemaine: 10 })
    const th = C.ALL_CHAPTERS[t.themeId]
    const jeux = Object.fromEntries(C.themeChapters(th).flatMap((ch) => C.jeuxDuChapitre(ch, th).map((g) => [g.id, 100])))
    const bien = plan({ heuresSemaine: 10 }, { chapters: { [t.themeId]: { quiz: 3, games: jeux } } })
    const minutes = (p) => p.semaines.flatMap((s) => s.taches).filter((x) => x.themeId === t.themeId).reduce((n, x) => n + x.minutes, 0)
    expect(minutes(bien)).toBeLessThan(minutes(avant))
  })
  it('chaque semaine alterne les matières au lieu d’en enchaîner une seule', () => {
    const p = plan({ heuresSemaine: 10 })
    for (const s of p.semaines.slice(0, 6)) expect(new Set(s.taches.map((t) => t.subjectId)).size, `semaine ${s.index}`).toBeGreaterThanOrEqual(3)
  })
  it('les séances sont courtes, rangées par chapitres, et la somme des tâches égale le temps de la semaine', () => {
    const p = plan({ heuresSemaine: 10 })
    for (const s of p.semaines) {
      expect(s.taches.reduce((n, t) => n + t.minutes, 0)).toBe(s.minutes)
      for (const t of s.taches) expect(t.minutes, `${t.themeName} ${t.kind}`).toBeLessThanOrEqual(90)
    }
    // Les chapitres d'un thème découvert sont couverts une fois chacun, dans l'ordre.
    for (const t of themes.slice(0, 8)) {
      const parts = p.semaines.flatMap((s) => s.taches.filter((x) => x.themeId === t.themeId && x.kind === 'decouvrir').map((x) => x.chapitres))
      if (!parts.length) continue
      const vus = parts.flatMap((c) => Array.from({ length: c.a - c.de + 1 }, (_, i) => c.de + i))
      expect(vus).toEqual(Array.from({ length: Math.max(1, t.chapitres) }, (_, i) => i + 1))
    }
  })
  it('un thème déjà pratiqué n’est pas redécouvert, et un thème mesuré ne passe plus pour estimé', () => {
    const t = themes[0]
    const th = C.ALL_CHAPTERS[t.themeId]
    const jeux = Object.fromEntries(C.themeChapters(th).flatMap((ch) => C.jeuxDuChapitre(ch, th).map((g) => [g.id, 40])))
    const p = plan({ heuresSemaine: 10 }, { chapters: { [t.themeId]: { quiz: 1, games: jeux } } })
    const taches = p.semaines.flatMap((s) => s.taches).filter((x) => x.themeId === t.themeId)
    expect(taches.some((x) => x.kind === 'decouvrir')).toBe(false)
    expect(taches.find((x) => x.kind === 'consolider').pourquoi.estime).toBe(false)
    const vierge = plan({ heuresSemaine: 10 }).semaines.flatMap((s) => s.taches).find((x) => x.kind === 'consolider')
    expect(vierge.pourquoi.estime).toBe(true)
  })
  it('la semaine en cours n’a que les jours restants', () => {
    const mercredi = construirePlan({ state: etat(), track: TERM, today: '2026-11-04', themes })
    expect(mercredi.semaines[0].debut).toBe('2026-11-02')
    expect(mercredi.semaines[0].capacite).toBeLessThan(OBJECTIFS_DEFAUT.heuresSemaine * 60)
  })
  it('fonctionne aussi en Première, avec les épreuves anticipées', () => {
    const p = construirePlan({ state: etat(), track: PREM, today: AUJOURDHUI, themes: themesP })
    expect(p.semaines.length).toBeGreaterThan(20)
    const vus = new Set(p.semaines.flatMap((s) => s.taches.map((t) => t.subjectId)))
    expect(vus.has('p1-francais')).toBe(true); expect(vus.has('p1-maths')).toBe(true)
  })
  it('l’avancement de la semaine compte ce qui a été fait depuis le lundi', () => {
    const sem = { minutes: 60 }
    expect(avancementSemaine({ semaine: { debut: '2026-11-02', minutes: 120 } }, sem, '2026-11-04')).toMatchObject({ prevu: 120, fait: 60, pct: 50 })
    expect(avancementSemaine({}, sem, '2026-11-04')).toMatchObject({ prevu: 60, fait: 0, pct: 0 })
  })
})

import { mergeProgress, PROGRESS_KEYS, chargeUtile } from '../src/progression.js'
describe('synchronisation du parcours', () => {
  it('fait partie de la progression envoyée sur le compte', () => {
    expect(PROGRESS_KEYS).toContain('parcours')
    const envoi = chargeUtile({ parcours: { objectifs: { noteVisee: 14 }, maj: 5 }, xp: 1 })
    expect(envoi.parcours.objectifs.noteVisee).toBe(14)
  })
  it('la version la plus récente des objectifs l’emporte, sans perdre un test de positionnement', () => {
    const tel = { parcours: { maj: 10, objectifs: { noteVisee: 12 }, positionnement: { droit: { date: '2026-11-01', score: 40, themes: {} } } } }
    const pc = { parcours: { maj: 20, objectifs: { noteVisee: 15 }, positionnement: { maths: { date: '2026-11-02', score: 70, themes: {} }, droit: { date: '2026-10-01', score: 10, themes: {} } } } }
    const m = mergeProgress(tel, pc, 30).parcours
    expect(m.objectifs.noteVisee).toBe(15)
    expect(Object.keys(m.positionnement).sort()).toEqual(['droit', 'maths'])
    expect(m.positionnement.droit.score).toBe(40) // le test du 1er novembre est plus récent que celui d'octobre
    const inverse = mergeProgress(pc, tel, 30).parcours
    expect(inverse.objectifs.noteVisee).toBe(15)
  })
  it('un seul appareil avec un parcours : il est conservé', () => {
    expect(mergeProgress({ xp: 1 }, { xp: 2, parcours: { maj: 1, objectifs: { noteVisee: 11 } } }, 3).parcours.objectifs.noteVisee).toBe(11)
  })
})
