// Exercices de mathématiques à données aléatoires : QCM chiffrés refaits à
// chaque partie, calculs mêlés, et au moins un calcul par chapitre de maths.
import { describe, it, expect } from 'vitest'
import { QCM_GEN, instancierQuestion } from '../src/qcmgen.js'
import { CALC, makeCalcMix } from '../src/calc.js'
import * as C from '../src/data/index.js'
import { buildDailyChallenge } from '../src/data/dailyChallenge.js'
import { avecGraine } from './outils.js'

// Relit un nombre écrit à la française (« 1,25 », « −8 », « 1 200 »).
const nb = (s) => Number(String(s).replace(/[\s  %+]/g, '').replace('−', '-').replace(',', '.'))
const prochePct = (texte, attendu) => Math.abs(nb(texte) - attendu) < 0.01

// La bonne réponse se recalcule à partir de l'énoncé.
const VERIF = {
  taux_evolution: (q) => {
    const [, v0, v1] = q.q.match(/passe de ([\d\s ,]+) à ([\d\s ,]+)\./)
    return prochePct(q.choices[q.answer], ((nb(v1) - nb(v0)) / nb(v0)) * 100)
  },
  coef_multiplicateur: (q) => {
    const [, sens, t] = q.q.match(/(hausse|baisse) de (\d+)/)
    return Math.abs(nb(q.choices[q.answer]) - (1 + (sens === 'hausse' ? 1 : -1) * Number(t) / 100)) < 1e-9
  },
  evolutions_successives: (q) => {
    const [[, s1, t1], [, s2, t2]] = [...q.q.matchAll(/(hausse|baisse) de (\d+)/g)]
    const cm = (1 + (s1 === 'hausse' ? 1 : -1) * t1 / 100) * (1 + (s2 === 'hausse' ? 1 : -1) * t2 / 100)
    const g = (cm - 1) * 100
    const r = q.choices[q.answer]
    if (Math.abs(g) < 1e-9) return r === 'Aucun changement'
    return r.startsWith(g > 0 ? 'Une hausse' : 'Une baisse') && prochePct(r.replace(/^\D+/, ''), Math.abs(g))
  },
  indice_base100: (q) => {
    const i = Number(q.q.match(/vaut (\d+)/)[1])
    return q.choices[q.answer] === (i > 100 ? `Augmenté de ${i - 100} % depuis la référence` : `Baissé de ${100 - i} % depuis la référence`)
  },
  raison_hausse: (q) => Math.abs(nb(q.choices[q.answer]) - (1 + Number(q.q.match(/(\d+)/)[1]) / 100)) < 1e-9,
  raison_baisse: (q) => Math.abs(nb(q.choices[q.answer]) - (1 - Number(q.q.match(/(\d+)/)[1]) / 100)) < 1e-9,
}

describe('QCM chiffrés à données aléatoires', () => {
  const gens = Object.keys(QCM_GEN)
  it('chaque générateur a sa vérification', () => expect(gens.sort()).toEqual(Object.keys(VERIF).sort()))

  it.each(gens)('%s : 300 tirages justes, quatre propositions distinctes', (id) => {
    avecGraine(id, () => {
      for (let k = 0; k < 300; k++) {
        const q = instancierQuestion({ q: 'écrite', choices: ['a', 'b', 'c', 'd'], answer: 0, gen: id })
        expect(q.q).not.toBe('écrite')
        expect(q.choices).toHaveLength(4)
        expect(new Set(q.choices).size).toBe(4)
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(VERIF[id](q), `${q.q} → ${q.choices[q.answer]}`).toBe(true)
        expect(`${q.q} ${q.choices.join(' ')} ${q.explain}`).not.toMatch(/NaN|undefined|Infinity/)
        expect(q.gen).toBeUndefined()
      }
    })
  })

  it.each(gens)('%s : de nouvelles données à chaque partie', (id) => {
    const enonces = new Set(Array.from({ length: 30 }, () => instancierQuestion({ gen: id }).q))
    expect(enonces.size).toBeGreaterThanOrEqual(5)
  })

  it('même aléa semé, même question', () => {
    const semé = () => {
      let a = 42
      return () => ((a = (a * 16807) % 2147483647) / 2147483647)
    }
    expect(instancierQuestion({ gen: 'taux_evolution' }, semé())).toEqual(instancierQuestion({ gen: 'taux_evolution' }, semé()))
  })

  it('une question sans générateur reste telle quelle ; un générateur inconnu rend la question écrite', () => {
    const q = { q: 'Q ?', choices: ['a', 'b'], answer: 1 }
    expect(instancierQuestion(q)).toBe(q)
    expect(instancierQuestion({ ...q, gen: 'inconnu', themeId: 't' })).toEqual({ ...q, themeId: 't' })
    expect(instancierQuestion({ ...q, gen: 'taux_evolution', themeId: 't' }).themeId).toBe('t')
  })

  it('les « gen » du contenu existent tous', async () => {
    await C.chargerTout()
    const vus = []
    for (const th of Object.values(C.ALL_CHAPTERS))
      for (const g of th.games || []) for (const q of g.type === 'qcm' ? g.questions || [] : []) if (q.gen) vus.push(q.gen)
    expect(vus.length).toBeGreaterThanOrEqual(6)
    for (const id of vus) expect(QCM_GEN[id], id).toBeTruthy()
  })
})

describe('calculs mêlés et chapitres de maths', () => {
  it('makeCalcMix balaie tous les générateurs demandés', () => {
    const ids = ['taux_evolution', 'cm_successif', 'indice_base100']
    const set = makeCalcMix([...ids, 'inconnu'], 6)
    expect(set).toHaveLength(6)
    for (const ex of set) expect(Number.isFinite(ex.answer)).toBe(true)
    expect(makeCalcMix(['inconnu'], 3)).toEqual([])
  })

  it('chaque chapitre de maths propose un calcul à nombres aléatoires', async () => {
    for (const sid of ['maths', 'p1-maths']) {
      await C.chargerMatiere(sid)
      for (const t of C.SUBJECTS.find((s) => s.id === sid).chapters) {
        const theme = C.ALL_CHAPTERS[t.id]
        for (const ch of C.themeChapters(theme)) {
          const calculs = ch.games.filter((g) => g.type === 'calcul')
          expect(calculs.length, `${t.id} · ${ch.title}`).toBeGreaterThan(0)
          for (const g of calculs) for (const id of g.gens || [g.gen]) expect(CALC[id], id).toBeTruthy()
        }
      }
    }
  })

  it('les autres matières ne reçoivent pas de calcul mêlé', async () => {
    await C.chargerMatiere('gestion-finance')
    const t = C.SUBJECTS.find((s) => s.id === 'gestion-finance').chapters[0]
    expect(C.gensCalculDuTheme(C.ALL_CHAPTERS[t.id])).toEqual([])
    for (const ch of C.themeChapters(C.ALL_CHAPTERS[t.id])) expect(ch.games.some((g) => g.gens)).toBe(false)
  })

  it('le défi du jour reste le même toute la journée, nombres compris', async () => {
    await C.chargerTout()
    // Toute la banque de la filière, pour être sûr d'y trouver les questions chiffrées.
    const filiere = { level: 'terminale-stmg', specialty: 'gestion-finance' }
    const a = buildDailyChallenge(filiere, '2026-10-13', 100000)
    expect(a.some((q) => /^Une valeur passe de/.test(q.q))).toBe(true)
    expect(a).toEqual(buildDailyChallenge(filiere, '2026-10-13', 100000))
  })
})
