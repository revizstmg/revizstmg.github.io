import { beforeAll, describe, expect, it } from 'vitest'
import * as C from '../src/data/index.js'

const SUJETS = ['p1-droit', 'p1-economie', 'p1-sgn', 'droit']
beforeAll(async () => { for (const s of SUJETS) await C.chargerMatiere(s) })

describe('chapitres sans exercice : un QCM fabriqué avec le glossaire', () => {
  it('les chapitres qui n’avaient aucun jeu en ont un maintenant, sans toucher aux missions', () => {
    const th = C.ALL_CHAPTERS['p1-droit-t1']
    const ch = C.themeChapters(th)[3]
    expect(C.jeuxDuChapitre(ch, th).filter((g) => g.type === 'qcm')).toHaveLength(0)
    const affiches = C.jeuxAffiches(ch, th)
    const qcm = affiches.find((g) => g.type === 'qcm')
    expect(qcm).toBeTruthy()
    expect(qcm.id).toBe(`${th.id}-termes-${ch.idx}`)
    for (const q of qcm.questions) {
      expect(q.choices.length).toBe(4)
      expect(new Set(q.choices).size).toBe(4)
      expect(q.choices[q.answer]).toBeTruthy()
      expect(q.explain).toContain(q.choices[q.answer])
    }
  })
  it('un chapitre qui a déjà un QCM garde ses jeux tels quels', () => {
    const th = C.ALL_CHAPTERS['droit-t5']
    const ch = C.themeChapters(th)[0]
    expect(C.jeuxAffiches(ch, th).map((g) => g.id)).toEqual(C.jeuxDuChapitre(ch, th).map((g) => g.id))
  })
  it('presque tous les chapitres ont au moins un jeu', () => {
    let vides = 0, total = 0
    for (const s of SUJETS) for (const th of Object.values(C.ALL_CHAPTERS).filter((t) => t.subjectId === s)) {
      for (const ch of C.themeChapters(th)) { total++; if (C.jeuxAffiches(ch, th).length === 0) vides++ }
    }
    expect(total).toBeGreaterThan(50)
    expect(vides).toBeLessThanOrEqual(1)
  })
})
